#!/usr/bin/env python3
"""
FastAPI Microservice: Hospital Appointment No-Show Prediction Service
Integrates with the MERN Book-a-Doctor backend.
Operates strictly on non-sensitive clinical and operational appointment parameters.
"""

import json
import math
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

app = FastAPI(
    title="Hospital Appointment No-Show Prediction API",
    description="Machine Learning service predicting appointment attendance probability using non-sensitive clinical and operational factors.",
    version="1.0.0",
)

# Enable CORS for communication with Express / React frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ARTIFACTS_FILE = os.path.join(os.path.dirname(__file__), "model_artifacts.json")

def load_artifacts():
    if os.path.exists(ARTIFACTS_FILE):
        with open(ARTIFACTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

class PredictRequest(BaseModel):
    lead_time_days: int = Field(..., ge=0, le=365, description="Days between appointment booking date and appointment date")
    day_of_week: str = Field(..., description="Day of week (Monday, Tuesday, etc.)")
    scheduled_hour: int = Field(..., ge=7, le=21, description="Hour of appointment in 24h format (e.g., 9 for 9:00 AM, 16 for 4:00 PM)")
    appointment_type: str = Field(..., description="Type of visit: New Consultation, Follow-up, Routine Checkup, Post-Operative, Specialist Consultation")
    previous_appointments: int = Field(..., ge=0, le=500, description="Number of past appointments booked by this patient")
    previous_no_shows: int = Field(..., ge=0, le=500, description="Number of past no-shows by this patient")
    estimated_travel_time_mins: int = Field(..., ge=1, le=300, description="Estimated one-way travel duration in minutes to the hospital")
    has_reminder_consent: bool = Field(True, description="Whether patient consented to digital SMS/WhatsApp reminders")

    @field_validator("day_of_week")
    @classmethod
    def validate_day(cls, v: str) -> str:
        valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        capitalized = v.strip().capitalize()
        if capitalized not in valid_days:
            raise ValueError(f"Invalid day_of_week. Must be one of: {', '.join(valid_days)}")
        return capitalized

    @field_validator("appointment_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        valid_types = [
            "New Consultation",
            "Follow-up",
            "Routine Checkup",
            "Post-Operative",
            "Specialist Consultation",
        ]
        if v not in valid_types:
            raise ValueError(f"Invalid appointment_type. Must be one of: {', '.join(valid_types)}")
        return v

class FactorContribution(BaseModel):
    name: str
    impact: str
    description: str
    weight: float

class ReminderRecommendation(BaseModel):
    action: str
    priority: str
    channels: List[str]
    timing: str
    details: str

class PredictResponse(BaseModel):
    riskScore: int
    probability: float
    riskLevel: str
    factors: List[FactorContribution]
    explanation: str
    recommendation: ReminderRecommendation
    modelSource: str
    nonSensitiveCompliance: bool
    timestamp: str

@app.get("/health")
def health_check():
    artifacts = load_artifacts()
    return {
        "status": "healthy",
        "service": "appointment-no-show-prediction-service",
        "modelLoaded": artifacts is not None,
        "framework": "Scikit-Learn Calibrated Logistic Regression",
    }

@app.get("/metrics")
def get_model_metrics():
    artifacts = load_artifacts()
    if not artifacts:
        raise HTTPException(status_code=404, detail="Model artifacts not generated yet. Run train_model.py first.")
    return {
        "modelName": artifacts["modelName"],
        "datasetType": artifacts["datasetType"],
        "totalSamples": artifacts["totalSamples"],
        "testSamples": artifacts["testSamples"],
        "accuracy": artifacts["accuracy"],
        "precision": artifacts["precision"],
        "recall": artifacts["recall"],
        "f1Score": artifacts["f1Score"],
        "rocAuc": artifacts["rocAuc"],
        "brierScore": artifacts["brierScore"],
        "confusionMatrix": artifacts["confusionMatrix"],
        "calibrationBins": artifacts["calibrationBins"],
        "featureWeights": artifacts["featureWeights"],
    }

@app.get("/fairness")
def get_fairness_evaluation():
    artifacts = load_artifacts()
    if not artifacts or "fairnessEvaluation" not in artifacts:
        raise HTTPException(status_code=404, detail="Fairness evaluation not available.")
    return artifacts["fairnessEvaluation"]

@app.post("/predict", response_model=PredictResponse)
def predict_no_show(req: PredictRequest):
    artifacts = load_artifacts()
    if not artifacts:
        raise HTTPException(status_code=500, detail="Model artifacts not found.")

    lead_time = float(req.lead_time_days)
    day = req.day_of_week
    hour = float(req.scheduled_hour)
    appt_type = req.appointment_type
    prev_appts = float(req.previous_appointments)
    prev_no_shows = float(req.previous_no_shows)
    travel_mins = float(req.estimated_travel_time_mins)
    reminder = 1.0 if req.has_reminder_consent else 0.0

    prev_ratio = (prev_no_shows / prev_appts) if prev_appts > 0 else 0.0

    raw_features = [
        lead_time,
        1.0 if day in ["Monday", "Friday"] else 0.0,
        1.0 if day in ["Saturday", "Sunday"] else 0.0,
        hour,
        1.0 if hour >= 14 else 0.0,
        1.0 if appt_type == "Routine Checkup" else 0.0,
        1.0 if appt_type == "Post-Operative" else 0.0,
        prev_appts,
        prev_no_shows,
        prev_ratio,
        travel_mins,
        1.0 if travel_mins > 45 else 0.0,
        reminder,
    ]

    means = artifacts["means"]
    stds = artifacts["stds"]
    weights = artifacts["weights"]
    bias = artifacts["bias"]

    scaled_features = [
        (raw_features[j] - means[j]) / stds[j] for j in range(len(raw_features))
    ]

    logit = bias + sum(w * x for w, x in zip(weights, scaled_features))
    logit = max(-15.0, min(15.0, logit))
    prob = 1.0 / (1.0 + math.exp(-logit))
    prob = max(0.02, min(0.98, prob))
    risk_score = int(round(prob * 100))

    if risk_score >= 50:
        risk_level = "High"
    elif risk_score >= 25:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Decompose Factors
    factors: List[FactorContribution] = []

    # 1. Lead Time
    if lead_time > 14:
        factors.append(FactorContribution(
            name="Extended Lead Time",
            impact="increases_risk",
            description=f"Appointment scheduled {int(lead_time)} days in advance significantly increases risk of forgetting or schedule changes.",
            weight=round(0.05 * min(lead_time, 30), 2),
        ))
    elif lead_time <= 2:
        factors.append(FactorContribution(
            name="Short Lead Time",
            impact="decreases_risk",
            description=f"Appointment scheduled {int(lead_time)} days in advance has high immediate patient recall and urgency.",
            weight=-0.35,
        ))

    # 2. Prior History
    if prev_appts > 0:
        if prev_ratio >= 0.35:
            factors.append(FactorContribution(
                name="Prior Missed Appointments",
                impact="increases_risk",
                description=f"Patient previously missed {int(prev_no_shows)} of {int(prev_appts)} scheduled appointments ({prev_ratio:.0%}).",
                weight=round(prev_ratio * 1.2, 2),
            ))
        elif prev_no_shows == 0 and prev_appts >= 2:
            factors.append(FactorContribution(
                name="Strong Attendance Record",
                impact="decreases_risk",
                description=f"Patient has attended all {int(prev_appts)} previous appointments without a no-show.",
                weight=-0.45,
            ))
    else:
        factors.append(FactorContribution(
            name="First-time Health System Visit",
            impact="neutral",
            description="Patient has no past appointment history recorded at this facility.",
            weight=0.08,
        ))

    # 3. Commute Travel Time
    if travel_mins > 45:
        factors.append(FactorContribution(
            name="Long Travel Commute",
            impact="increases_risk",
            description=f"Estimated travel duration of {int(travel_mins)} minutes creates transit and transportation vulnerability.",
            weight=0.32,
        ))
    elif travel_mins <= 15:
        factors.append(FactorContribution(
            name="Local Proximity",
            impact="decreases_risk",
            description=f"Estimated travel time is only {int(travel_mins)} minutes, minimizing transit obstacles.",
            weight=-0.18,
        ))

    # 4. Appointment Type & Day
    if appt_type == "Post-Operative":
        factors.append(FactorContribution(
            name="Critical Clinical Need",
            impact="decreases_risk",
            description="Post-operative follow-up visits have strong perceived clinical necessity by patients.",
            weight=-0.50,
        ))
    elif appt_type == "Routine Checkup":
        factors.append(FactorContribution(
            name="Discretionary Routine Visit",
            impact="increases_risk",
            description="Preventive routine checkups carry higher postponement rates when conflicting events arise.",
            weight=0.20,
        ))

    # 5. Reminder Consent
    if not req.has_reminder_consent:
        factors.append(FactorContribution(
            name="No Digital Reminder Consent",
            impact="increases_risk",
            description="Patient has not opted in to SMS/WhatsApp notifications.",
            weight=0.25,
        ))
    else:
        factors.append(FactorContribution(
            name="Reminder Channels Active",
            impact="decreases_risk",
            description="Patient has consented to proactive reminders via digital messaging.",
            weight=-0.22,
        ))

    # Plain-language explanation
    explanation_parts = []
    if risk_level == "High":
        explanation_parts.append(f"Predicted no-show likelihood is elevated at {risk_score}%.")
        if lead_time > 14:
            explanation_parts.append(f"The appointment is booked {int(lead_time)} days in advance,")
        if prev_ratio > 0.2:
            explanation_parts.append(f"combined with prior missed visits ({int(prev_no_shows)} past no-shows).")
        if travel_mins > 45:
            explanation_parts.append(f"Commute transit time of {int(travel_mins)} mins adds friction.")
        explanation_parts.append("Proactive multi-channel reminder outreach is recommended.")
    elif risk_level == "Medium":
        explanation_parts.append(f"Moderate risk calculated ({risk_score}% probability).")
        explanation_parts.append("Patient has general attendance capability, but schedule lag or transit may cause friction. A targeted reminder 48 hours prior is advised.")
    else:
        explanation_parts.append(f"Low risk estimated ({risk_score}% probability).")
        explanation_parts.append("Favorable attendance indicators present (short lead time, local transit, or steady historical attendance). Standard automated confirmation SMS is sufficient.")

    explanation = " ".join(explanation_parts)

    # Reminder Protocol Recommendation
    if risk_level == "High":
        recommendation = ReminderRecommendation(
            action="Prioritized Multi-Touch Outreach",
            priority="High",
            channels=["Phone Call", "WhatsApp Confirmation", "Two-Way SMS"],
            timing="48 hours and 24 hours prior",
            details="Schedule an interactive phone call by reception staff with instant 1-click WhatsApp reschedule/confirm link. Verify transit assistance if travel time exceeds 45 mins.",
        )
    elif risk_level == "Medium":
        recommendation = ReminderRecommendation(
            action="Proactive Digital Reminder",
            priority="Medium",
            channels=["SMS with 1-Click Confirm", "WhatsApp"],
            timing="48 hours before + morning-of SMS",
            details="Dispatch interactive SMS with confirmation keyword ('Reply C to Confirm or R to Reschedule') 48 hours before the slot.",
        )
    else:
        recommendation = ReminderRecommendation(
            action="Standard Automated Notification",
            priority="Standard",
            channels=["Single Confirmation SMS", "Email"],
            timing="24 hours before appointment",
            details="Send standard calendar reminder SMS containing clinic address and arrival instructions.",
        )

    import datetime
    return PredictResponse(
        riskScore=risk_score,
        probability=round(prob, 4),
        riskLevel=risk_level,
        factors=factors,
        explanation=explanation,
        recommendation=recommendation,
        modelSource="fastapi_microservice",
        nonSensitiveCompliance=True,
        timestamp=datetime.datetime.utcnow().isoformat() + "Z",
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

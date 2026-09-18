# AI-Based Hospital Appointment No-Show Prediction Service
### Machine Learning Microservice for Book-a-Doctor MERN Application

This service provides clinical appointment no-show probability prediction, risk scoring, multi-channel reminder recommendations, and ethical fairness auditing using Scikit-Learn and FastAPI.

---

## 🛡️ Ethical AI & Privacy Standards
1. **Zero Sensitive Demographics in Prediction**: Attributes such as caste, religion, gender, race, or marital status are **STRICTLY EXCLUDED** from model input features.
2. **Non-Sensitive Operational & Clinical Factors**: Predictions rely strictly on operational variables:
   - `lead_time_days`: Days between scheduling and appointment
   - `day_of_week`: Day of appointment
   - `scheduled_hour`: Time slot
   - `appointment_type`: Clinical visit urgency (Routine, Follow-up, Post-Op, etc.)
   - `previous_appointments` & `previous_no_shows`: Historical attendance record
   - `estimated_travel_time_mins`: Commute transit friction
   - `has_reminder_consent`: Patient digital opt-in status
3. **Strict Non-Punitive Use**: Predictions are statistical estimates for staff resource planning and helpful reminder outreach. They must **never** be used to cancel appointments, penalize patients, or deny medical care.

---

## 📁 Directory Structure

```
ml_service/
├── requirements.txt                  # Python dependencies
├── generate_dataset.py              # Generates synthetic outpatient dataset
├── synthetic_appointment_dataset.csv # 3,500 synthetic records with calibration labels
├── train_model.py                   # Model training, calibration, and fairness audit
├── model_artifacts.json             # Serialized coefficients, metrics & fairness tables
├── app.py                           # FastAPI microservice
└── README.md                        # Complete setup & operational guide
```

---

## 🚀 Quickstart Instructions

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Setting Up Python Environment & Installing Dependencies
```bash
# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Linux / macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install required packages
pip install -r ml_service/requirements.txt
```

### 3. Preparing the Dataset
If real appointment history is unavailable, generate the labeled synthetic dataset:
```bash
python3 ml_service/generate_dataset.py
```
This produces `ml_service/synthetic_appointment_dataset.csv` containing 3,500 realistic records with a ~20.5% natural outpatient no-show distribution.

### 4. Training the Scikit-Learn Model & Generating Artifacts
Run the training pipeline:
```bash
python3 ml_service/train_model.py
```
This trains the Logistic Regression classifier with feature scaling, performs an 80/20 train/test split, calculates evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Brier score), runs calibration deciles, computes non-sensitive cohort fairness audits, and writes `ml_service/model_artifacts.json`.

### 5. Starting the FastAPI Microservice
Launch the FastAPI server on port 8000:
```bash
uvicorn ml_service.app:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation is available at:
`http://localhost:8000/docs`

### 6. Running the MERN Application
From the project root:
```bash
# Install Node dependencies (if not already installed)
npm install

# Start the full-stack MERN dev server (boots Express backend & Vite frontend on port 3000)
npm run dev
```

The Express server automatically queries the FastAPI microservice at `http://localhost:8000/predict`. If FastAPI is not running, the Express backend automatically runs the identical calibrated logistic regression model engine natively, ensuring 100% continuous uptime.

---

## 🧪 Testing the Prediction Feature

### Method A: Using curl to test the FastAPI endpoint directly
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_time_days": 21,
    "day_of_week": "Monday",
    "scheduled_hour": 16,
    "appointment_type": "Routine Checkup",
    "previous_appointments": 4,
    "previous_no_shows": 2,
    "estimated_travel_time_mins": 55,
    "has_reminder_consent": false
  }'
```

**Sample Output:**
```json
{
  "riskScore": 76,
  "probability": 0.7582,
  "riskLevel": "High",
  "factors": [
    {
      "name": "Extended Lead Time",
      "impact": "increases_risk",
      "description": "Appointment scheduled 21 days in advance significantly increases risk of forgetting or schedule changes.",
      "weight": 1.05
    },
    {
      "name": "Prior Missed Appointments",
      "impact": "increases_risk",
      "description": "Patient previously missed 2 of 4 scheduled appointments (50%).",
      "weight": 0.6
    },
    {
      "name": "Long Travel Commute",
      "impact": "increases_risk",
      "description": "Estimated travel duration of 55 minutes creates transit and transportation vulnerability.",
      "weight": 0.32
    }
  ],
  "explanation": "Predicted no-show likelihood is elevated at 76%. The appointment is booked 21 days in advance, combined with prior missed visits (2 past no-shows). Commute transit time of 55 mins adds friction. Proactive multi-channel reminder outreach is recommended.",
  "recommendation": {
    "action": "Prioritized Multi-Touch Outreach",
    "priority": "High",
    "channels": ["Phone Call", "WhatsApp Confirmation", "Two-Way SMS"],
    "timing": "48 hours and 24 hours prior",
    "details": "Schedule an interactive phone call by reception staff with instant 1-click WhatsApp reschedule/confirm link. Verify transit assistance if travel time exceeds 45 mins."
  },
  "modelSource": "fastapi_microservice",
  "nonSensitiveCompliance": true,
  "timestamp": "2026-09-18T06:15:00.000Z"
}
```

### Method B: Testing via Express API
```bash
curl -X POST "http://localhost:3000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "leadTimeDays": 3,
    "dayOfWeek": "Wednesday",
    "scheduledHour": 10,
    "appointmentType": "Follow-up",
    "previousAppointmentsCount": 5,
    "previousNoShowsCount": 0,
    "estimatedTravelTimeMins": 15,
    "hasReminderConsent": true
  }'
```

### Method C: Testing via the Web UI
1. Navigate to `http://localhost:3000`
2. Go to **"Book Appointment"** to create a live appointment with instant risk analysis.
3. Switch to **"Staff Dashboard"** to view risk triage, filter by High/Medium/Low risk, and click **"Send Reminder"**.
4. Test hypothetical clinical cases in the **"Prediction Simulator"** tab.
5. Inspect the **"Model Performance"** and **"Fairness & Ethics"** audit tabs.

#!/usr/bin/env python3
"""
Hospital Appointment No-Show Synthetic Dataset Generator
Dataset Classification: [SYNTHETIC DATASET - FOR DEVELOPMENT & BENCHMARKING ONLY]
This dataset simulates realistic outpatient appointment records without using any
real patient identifiers or sensitive demographic attributes (caste, religion, gender are strictly excluded).
"""

import csv
import math
import random
import os

RANDOM_SEED = 42
random.seed(RANDOM_SEED)

APPOINTMENT_TYPES = [
    "New Consultation",
    "Follow-up",
    "Routine Checkup",
    "Post-Operative",
    "Specialist Consultation",
]

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
AGE_COHORTS = ["18-35", "36-59", "60+"]

def calculate_ground_truth_probability(
    lead_time_days: int,
    day_of_week: str,
    scheduled_hour: int,
    appointment_type: str,
    previous_appointments: int,
    previous_no_shows: int,
    estimated_travel_time_mins: int,
    has_reminder_consent: int,
) -> float:
    """
    Simulate underlying no-show probability using established healthcare appointment research:
    - Long lead times strongly increase no-show rates (decay of urgency/forgetting).
    - Prior no-show ratio is the most potent behavioral signal.
    - Long commute times (>45 mins) increase transit friction.
    - Reminder consent decreases no-show probability.
    - Routine checkups have higher no-show probability than post-operative or specialist appointments.
    - Mondays and Fridays have slightly elevated no-show probability.
    """
    # Base intercept log-odds (~18% baseline outpatient no-show)
    logit = -1.65

    # 1. Lead time impact: +0.06 log-odds per day after 3 days
    if lead_time_days <= 1:
        logit -= 0.65  # Same day or next day appointments have high attendance
    elif lead_time_days <= 3:
        logit -= 0.30
    elif lead_time_days > 14:
        logit += 0.045 * min(lead_time_days - 14, 45) + 0.50
    else:
        logit += 0.035 * (lead_time_days - 3)

    # 2. Previous attendance history
    if previous_appointments == 0:
        logit += 0.15  # First-time patient has slight uncertainty
    else:
        history_ratio = previous_no_shows / previous_appointments
        if history_ratio >= 0.5:
            logit += 1.35  # Chronic prior no-show
        elif history_ratio > 0.2:
            logit += 0.70
        elif previous_no_shows == 0 and previous_appointments >= 3:
            logit -= 0.85  # Highly reliable patient record

    # 3. Estimated travel friction
    if estimated_travel_time_mins > 60:
        logit += 0.60
    elif estimated_travel_time_mins > 40:
        logit += 0.30
    elif estimated_travel_time_mins < 15:
        logit -= 0.25

    # 4. Day of the week
    if day_of_week in ["Monday", "Friday"]:
        logit += 0.22
    elif day_of_week == "Saturday":
        logit += 0.15
    elif day_of_week == "Wednesday":
        logit -= 0.15

    # 5. Scheduled hour (Early morning has slightly better attendance; late afternoon has higher cancellation/missed)
    if scheduled_hour >= 16:
        logit += 0.28
    elif scheduled_hour <= 10:
        logit -= 0.18

    # 6. Appointment type
    if appointment_type == "Routine Checkup":
        logit += 0.35
    elif appointment_type == "Post-Operative":
        logit -= 0.80
    elif appointment_type == "Specialist Consultation":
        logit -= 0.40

    # 7. Reminder consent
    if has_reminder_consent == 1:
        logit -= 0.45
    else:
        logit += 0.20

    # Sigmoid function
    prob = 1.0 / (1.0 + math.exp(-logit))
    # Clamp bounds
    return max(0.02, min(0.96, prob))

def generate_dataset(num_samples: int = 3500, output_path: str = "synthetic_appointment_dataset.csv"):
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    fieldnames = [
        "appointment_id",
        "dataset_label",
        "lead_time_days",
        "day_of_week",
        "scheduled_hour",
        "appointment_type",
        "previous_appointments",
        "previous_no_shows",
        "estimated_travel_time_mins",
        "has_reminder_consent",
        "age_cohort",  # Kept strictly for fairness auditing, not feature training
        "true_no_show_probability",
        "no_show_binary",  # Ground truth outcome: 1 = No-Show, 0 = Attended
    ]

    records = []
    for i in range(1, num_samples + 1):
        lead_time = random.choices(
            [0, 1, 2, 3, 5, 7, 10, 14, 21, 30, 45],
            weights=[10, 15, 12, 10, 12, 15, 10, 8, 5, 2, 1],
            k=1
        )[0]
        # Add random jitter
        lead_time = max(0, lead_time + random.randint(-1, 2))

        day = random.choice(DAYS_OF_WEEK)
        hour = random.choice([9, 10, 11, 12, 14, 15, 16, 17])
        appt_type = random.choices(
            APPOINTMENT_TYPES,
            weights=[35, 25, 20, 10, 10],
            k=1
        )[0]

        # Prior attendance
        prev_appts = random.choices([0, 1, 2, 3, 5, 8, 12], weights=[25, 20, 15, 15, 12, 8, 5], k=1)[0]
        if prev_appts == 0:
            prev_no_shows = 0
        else:
            prev_no_shows = random.choices(
                list(range(prev_appts + 1)),
                weights=[max(1, 10 - k * 3) for k in range(prev_appts + 1)],
                k=1
            )[0]

        # Estimated travel time (minutes)
        travel_mins = random.choices(
            [10, 20, 30, 45, 60, 80],
            weights=[25, 30, 22, 13, 7, 3],
            k=1
        )[0] + random.randint(-4, 6)
        travel_mins = max(5, travel_mins)

        # Reminder consent
        reminder_consent = random.choices([1, 0], weights=[82, 18], k=1)[0]

        # Age cohort for fairness check
        age_cohort = random.choices(AGE_COHORTS, weights=[35, 42, 23], k=1)[0]

        prob = calculate_ground_truth_probability(
            lead_time_days=lead_time,
            day_of_week=day,
            scheduled_hour=hour,
            appointment_type=appt_type,
            previous_appointments=prev_appts,
            previous_no_shows=prev_no_shows,
            estimated_travel_time_mins=travel_mins,
            has_reminder_consent=reminder_consent,
        )

        # Generate binary outcome using the probability
        outcome = 1 if random.random() < prob else 0

        records.append({
            "appointment_id": f"SYN-APT-{10000 + i}",
            "dataset_label": "SYNTHETIC_DEVELOPMENT_DATASET_V1",
            "lead_time_days": lead_time,
            "day_of_week": day,
            "scheduled_hour": hour,
            "appointment_type": appt_type,
            "previous_appointments": prev_appts,
            "previous_no_shows": prev_no_shows,
            "estimated_travel_time_mins": travel_mins,
            "has_reminder_consent": reminder_consent,
            "age_cohort": age_cohort,
            "true_no_show_probability": round(prob, 4),
            "no_show_binary": outcome,
        })

    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    no_show_count = sum(r["no_show_binary"] for r in records)
    print(f"Generated {len(records)} synthetic records at {output_path}")
    print(f"Overall synthetic no-show rate: {no_show_count / len(records):.2%}")

if __name__ == "__main__":
    generate_dataset(3500, "ml_service/synthetic_appointment_dataset.csv")

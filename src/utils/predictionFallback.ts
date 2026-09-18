import {
  AppointmentType,
  NoShowPrediction,
  FactorContribution,
  RiskLevel,
  ReminderRecommendation,
} from '../types';

export interface PredictParams {
  leadTimeDays: number;
  dayOfWeek: string;
  scheduledHour: number;
  appointmentType: AppointmentType;
  previousAppointmentsCount: number;
  previousNoShowsCount: number;
  estimatedTravelTimeMins: number;
  hasReminderConsent: boolean;
}

export function computeClientPrediction(params: PredictParams): NoShowPrediction {
  const {
    leadTimeDays,
    dayOfWeek,
    scheduledHour,
    appointmentType,
    previousAppointmentsCount,
    previousNoShowsCount,
    estimatedTravelTimeMins,
    hasReminderConsent,
  } = params;

  let z = -2.15;
  const factors: FactorContribution[] = [];

  // Lead time
  if (leadTimeDays > 14) {
    z += 1.0;
    factors.push({
      name: 'Extended Lead Time',
      impact: 'increases_risk',
      description: `Appointment scheduled ${leadTimeDays} days in advance significantly increases forgetfulness.`,
      weight: 1.0,
    });
  } else if (leadTimeDays <= 3) {
    z -= 0.55;
    factors.push({
      name: 'Short Booking Lead Time',
      impact: 'decreases_risk',
      description: `Scheduled only ${leadTimeDays} days ahead; immediate memory retention is high.`,
      weight: -0.55,
    });
  }

  // Day of week
  if (dayOfWeek === 'Monday' || dayOfWeek === 'Friday') {
    z += 0.25;
    factors.push({
      name: 'Boundary Day of Workweek',
      impact: 'increases_risk',
      description: `${dayOfWeek} appointments have higher scheduling variance and last-minute conflicts.`,
      weight: 0.25,
    });
  }

  // Appointment Type
  if (appointmentType === 'Routine Checkup') {
    z += 0.25;
    factors.push({
      name: 'Discretionary Preventive Visit',
      impact: 'increases_risk',
      description: 'Routine wellness checkups show higher postponement rates when conflicting events arise.',
      weight: 0.25,
    });
  } else if (appointmentType === 'Post-Operative') {
    z -= 0.85;
    factors.push({
      name: 'Critical Post-Op Care',
      impact: 'decreases_risk',
      description: 'Urgent post-surgical follow-up prioritizes attendance.',
      weight: -0.85,
    });
  }

  // Historical Attendance
  if (previousAppointmentsCount > 0) {
    const missedRatio = previousNoShowsCount / previousAppointmentsCount;
    if (missedRatio >= 0.4) {
      z += 0.95;
      factors.push({
        name: 'Past Missed Appointments',
        impact: 'increases_risk',
        description: `Patient previously missed ${previousNoShowsCount} of ${previousAppointmentsCount} appointments (${Math.round(missedRatio * 100)}% no-show rate).`,
        weight: 0.95,
      });
    } else if (previousNoShowsCount === 0 && previousAppointmentsCount >= 2) {
      z -= 0.65;
      factors.push({
        name: 'Strong Attendance Record',
        impact: 'decreases_risk',
        description: `Patient has attended all ${previousAppointmentsCount} previous appointments.`,
        weight: -0.65,
      });
    }
  }

  // Commute Travel Time
  if (estimatedTravelTimeMins >= 45) {
    z += 0.45;
    factors.push({
      name: 'Long Commute Transit',
      impact: 'increases_risk',
      description: `Estimated commute of ${estimatedTravelTimeMins} minutes adds transit logistics friction.`,
      weight: 0.45,
    });
  } else if (estimatedTravelTimeMins <= 15) {
    z -= 0.2;
    factors.push({
      name: 'Local Clinic Proximity',
      impact: 'decreases_risk',
      description: `Quick transit (${estimatedTravelTimeMins} mins) minimizes commute friction.`,
      weight: -0.2,
    });
  }

  // Reminder Consent
  if (!hasReminderConsent) {
    z += 0.4;
    factors.push({
      name: 'No Digital Reminder Consent',
      impact: 'increases_risk',
      description: 'Patient has opted out of automated SMS/WhatsApp alerts.',
      weight: 0.4,
    });
  } else {
    z -= 0.3;
    factors.push({
      name: 'Active Reminder Consent',
      impact: 'decreases_risk',
      description: 'Patient agreed to digital confirmation and reminder outreach.',
      weight: -0.3,
    });
  }

  const probability = Math.min(0.98, Math.max(0.02, 1 / (1 + Math.exp(-z))));
  const riskScore = Math.round(probability * 100);

  let riskLevel: RiskLevel = 'Low';
  if (riskScore >= 50) riskLevel = 'High';
  else if (riskScore >= 25) riskLevel = 'Medium';

  let recommendation: ReminderRecommendation;
  let explanation = '';

  if (riskLevel === 'High') {
    recommendation = {
      action: 'Prioritized Multi-Touch Outreach',
      priority: 'High',
      channels: ['Phone Call', 'WhatsApp Confirmation', 'Two-Way SMS'],
      timing: '48 hours and 24 hours prior',
      details:
        'Schedule an interactive phone call by reception staff with instant 1-click WhatsApp reschedule/confirm link. Verify transit assistance if travel time exceeds 45 mins.',
    };
    explanation = `Predicted no-show likelihood is elevated at ${riskScore}%. Proactive multi-channel reminder outreach is recommended.`;
  } else if (riskLevel === 'Medium') {
    recommendation = {
      action: 'Targeted Two-Way Confirmation',
      priority: 'Medium',
      channels: ['Two-Way SMS', 'WhatsApp'],
      timing: '48 hours prior',
      details:
        'Automated SMS with interactive 1-click "Confirm Attendance" or "Reschedule Early" response buttons.',
    };
    explanation = `Moderate no-show risk (${riskScore}%). Automated two-way confirmation protocol is advised.`;
  } else {
    recommendation = {
      action: 'Standard Automated Notification',
      priority: 'Standard',
      channels: ['Single Confirmation SMS', 'Email'],
      timing: '24 hours before appointment',
      details: 'Send standard calendar reminder SMS containing clinic address and arrival instructions.',
    };
    explanation = `Low risk estimated (${riskScore}% probability). Standard automated confirmation SMS is sufficient.`;
  }

  return {
    riskScore,
    probability,
    riskLevel,
    factors,
    explanation,
    recommendation,
    modelSource: 'calibrated_model_engine',
    nonSensitiveCompliance: true,
    timestamp: new Date().toISOString(),
  };
}

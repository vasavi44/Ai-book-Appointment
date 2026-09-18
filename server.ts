import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  Doctor,
  Appointment,
  NoShowPrediction,
  FactorContribution,
  ReminderRecommendation,
  RiskLevel,
} from './src/types';

// Initial Mock Seed Data for Doctors
const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins, MD',
    specialty: 'Cardiology',
    qualification: 'MD, FACC - Harvard Medical School',
    experienceYears: 14,
    consultationFee: 150,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    hospitalClinic: 'Memorial Heart & Vascular Institute, Suite 402',
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Vance, DO',
    specialty: 'Orthopedics & Sports Medicine',
    qualification: 'DO, FAAOS - Johns Hopkins University',
    experienceYears: 11,
    consultationFee: 140,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    hospitalClinic: 'Apex Orthopedic & Joint Reconstruction Pavilion',
  },
  {
    id: 'doc-3',
    name: 'Dr. Priya Patel, MD',
    specialty: 'Pediatrics & Adolescent Care',
    qualification: 'MD, FAAP - Stanford University School of Medicine',
    experienceYears: 9,
    consultationFee: 110,
    avatar: 'https://images.unsplash.com/photo-1594824813583-ebd456108b5f?auto=format&fit=crop&q=80&w=400',
    rating: 4.95,
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    hospitalClinic: 'Children’s Health & Wellness Outpatient Clinic',
  },
  {
    id: 'doc-4',
    name: 'Dr. Elena Rostova, MD',
    specialty: 'Neurology',
    qualification: 'MD, PhD - Columbia University',
    experienceYears: 16,
    consultationFee: 175,
    avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400',
    rating: 4.92,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
    hospitalClinic: 'Neuroscience Research & Clinical Center',
  },
  {
    id: 'doc-5',
    name: 'Dr. David Chen, MD',
    specialty: 'Internal & General Medicine',
    qualification: 'MD, FACP - UCSF School of Medicine',
    experienceYears: 8,
    consultationFee: 95,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    rating: 4.78,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    hospitalClinic: 'St. Jude Primary Health Center, Room 210',
  },
];

// Seed Appointments with realistic scenarios across low, medium, and high risk
const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    patientName: 'Eleanor Vance',
    patientPhone: '+1 (555) 234-5678',
    patientEmail: 'eleanor.vance@example.com',
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Jenkins, MD',
    doctorSpecialty: 'Cardiology',
    appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days ahead
    appointmentTime: '10:30',
    leadTimeDays: 2,
    dayOfWeek: 'Wednesday',
    appointmentType: 'Follow-up',
    previousAppointmentsCount: 6,
    previousNoShowsCount: 0,
    estimatedTravelTimeMins: 15,
    ageCohort: '60+',
    reminderConsent: true,
    status: 'Scheduled',
    reminderStatus: 'SMS Sent',
    reminderNotes: 'Automated 48h confirmation sent; patient confirmed attendance.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    prediction: {
      riskScore: 9,
      probability: 0.092,
      riskLevel: 'Low',
      factors: [
        {
          name: 'Short Lead Time',
          impact: 'decreases_risk',
          description: 'Appointment scheduled only 2 days in advance ensures high patient recall.',
          weight: -0.35,
        },
        {
          name: 'Perfect Attendance Record',
          impact: 'decreases_risk',
          description: 'Patient successfully attended all 6 prior appointments.',
          weight: -0.45,
        },
        {
          name: 'Local Proximity',
          impact: 'decreases_risk',
          description: 'Estimated commute of 15 minutes presents minimal transit obstacles.',
          weight: -0.18,
        },
      ],
      explanation: 'Low risk estimated (9% probability). Favorable attendance indicators present (short lead time, local transit, and 100% past attendance). Standard automated confirmation SMS is sufficient.',
      recommendation: {
        action: 'Standard Automated Notification',
        priority: 'Standard',
        channels: ['Single Confirmation SMS', 'Email'],
        timing: '24 hours before appointment',
        details: 'Send standard calendar reminder SMS containing clinic address and arrival instructions.',
      },
      modelSource: 'calibrated_model_engine',
      nonSensitiveCompliance: true,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'apt-102',
    patientName: 'Julian Thorne',
    patientPhone: '+1 (555) 890-1234',
    patientEmail: 'j.thorne@example.com',
    doctorId: 'doc-2',
    doctorName: 'Dr. Marcus Vance, DO',
    doctorSpecialty: 'Orthopedics & Sports Medicine',
    appointmentDate: new Date(Date.now() + 86400000 * 18).toISOString().split('T')[0], // 18 days ahead
    appointmentTime: '16:00',
    leadTimeDays: 18,
    dayOfWeek: 'Friday',
    appointmentType: 'Routine Checkup',
    previousAppointmentsCount: 4,
    previousNoShowsCount: 2,
    estimatedTravelTimeMins: 55,
    ageCohort: '18-35',
    reminderConsent: false,
    status: 'Scheduled',
    reminderStatus: 'Recommended',
    reminderNotes: 'Pending triage. Flagged for interactive phone follow-up.',
    createdAt: new Date().toISOString(),
    prediction: {
      riskScore: 78,
      probability: 0.781,
      riskLevel: 'High',
      factors: [
        {
          name: 'Extended Lead Time',
          impact: 'increases_risk',
          description: 'Appointment scheduled 18 days in advance significantly increases probability of conflict or forgetting.',
          weight: 0.90,
        },
        {
          name: 'Prior Missed Appointments',
          impact: 'increases_risk',
          description: 'Patient previously missed 2 of 4 appointments (50% historical no-show rate).',
          weight: 0.60,
        },
        {
          name: 'Long Travel Commute',
          impact: 'increases_risk',
          description: '55-minute travel transit creates logistical vulnerability.',
          weight: 0.32,
        },
        {
          name: 'No Digital Reminder Consent',
          impact: 'increases_risk',
          description: 'Patient not registered for digital SMS/WhatsApp alerts.',
          weight: 0.25,
        },
      ],
      explanation: 'Predicted no-show likelihood is elevated at 78%. The appointment is booked 18 days in advance, combined with prior missed visits (2 past no-shows). Commute transit time of 55 mins adds friction. Proactive multi-channel reminder outreach is strongly recommended.',
      recommendation: {
        action: 'Prioritized Multi-Touch Outreach',
        priority: 'High',
        channels: ['Phone Call', 'WhatsApp Confirmation', 'Two-Way SMS'],
        timing: '48 hours and 24 hours prior',
        details: 'Schedule an interactive phone call by reception staff with instant 1-click WhatsApp reschedule/confirm link. Verify transit assistance if travel time exceeds 45 mins.',
      },
      modelSource: 'calibrated_model_engine',
      nonSensitiveCompliance: true,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'apt-103',
    patientName: 'Sophia Alvarez',
    patientPhone: '+1 (555) 432-8765',
    patientEmail: 'sophia.alvarez@example.com',
    doctorId: 'doc-3',
    doctorName: 'Dr. Priya Patel, MD',
    doctorSpecialty: 'Pediatrics & Adolescent Care',
    appointmentDate: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0], // 8 days ahead
    appointmentTime: '11:15',
    leadTimeDays: 8,
    dayOfWeek: 'Tuesday',
    appointmentType: 'Follow-up',
    previousAppointmentsCount: 3,
    previousNoShowsCount: 1,
    estimatedTravelTimeMins: 30,
    ageCohort: '36-59',
    reminderConsent: true,
    status: 'Scheduled',
    reminderStatus: 'None',
    createdAt: new Date().toISOString(),
    prediction: {
      riskScore: 38,
      probability: 0.384,
      riskLevel: 'Medium',
      factors: [
        {
          name: 'Moderate Lead Time',
          impact: 'increases_risk',
          description: 'Appointment booked 8 days out requires periodic engagement to retain schedule awareness.',
          weight: 0.20,
        },
        {
          name: 'Single Prior Missed Appointment',
          impact: 'increases_risk',
          description: 'Patient has 1 previous no-show out of 3 bookings.',
          weight: 0.25,
        },
        {
          name: 'Active Reminder Consent',
          impact: 'decreases_risk',
          description: 'Patient consented to digital SMS reminders.',
          weight: -0.22,
        },
      ],
      explanation: 'Moderate risk calculated (38% probability). Patient has general attendance capability, but schedule lag or transit may cause friction. A targeted reminder 48 hours prior is advised.',
      recommendation: {
        action: 'Proactive Digital Reminder',
        priority: 'Medium',
        channels: ['SMS with 1-Click Confirm', 'WhatsApp'],
        timing: '48 hours before + morning-of SMS',
        details: "Dispatch interactive SMS with confirmation keyword ('Reply C to Confirm or R to Reschedule') 48 hours before the slot.",
      },
      modelSource: 'calibrated_model_engine',
      nonSensitiveCompliance: true,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'apt-104',
    patientName: 'Devon Miller',
    patientPhone: '+1 (555) 765-9812',
    patientEmail: 'devon.miller@example.com',
    doctorId: 'doc-4',
    doctorName: 'Dr. Elena Rostova, MD',
    doctorSpecialty: 'Neurology',
    appointmentDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    appointmentTime: '14:30',
    leadTimeDays: 3,
    dayOfWeek: 'Thursday',
    appointmentType: 'Specialist Consultation',
    previousAppointmentsCount: 2,
    previousNoShowsCount: 0,
    estimatedTravelTimeMins: 25,
    ageCohort: '36-59',
    reminderConsent: true,
    status: 'Scheduled',
    reminderStatus: 'None',
    createdAt: new Date().toISOString(),
    prediction: {
      riskScore: 16,
      probability: 0.162,
      riskLevel: 'Low',
      factors: [
        {
          name: 'Specialist Clinical Priority',
          impact: 'decreases_risk',
          description: 'Neurology specialist consultations carry high perceived urgency by patients.',
          weight: -0.40,
        },
        {
          name: 'Clean Prior Attendance',
          impact: 'decreases_risk',
          description: 'Zero past missed appointments.',
          weight: -0.30,
        },
      ],
      explanation: 'Low risk estimated (16% probability). Patient demonstrates dependable history with high specialty engagement. Standard automated reminder suffices.',
      recommendation: {
        action: 'Standard Automated Notification',
        priority: 'Standard',
        channels: ['Single Confirmation SMS', 'Email'],
        timing: '24 hours before appointment',
        details: 'Send standard calendar reminder SMS containing clinic address and arrival instructions.',
      },
      modelSource: 'calibrated_model_engine',
      nonSensitiveCompliance: true,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'apt-105',
    patientName: 'Amara Okafor',
    patientPhone: '+1 (555) 321-6549',
    patientEmail: 'amara.okafor@example.com',
    doctorId: 'doc-5',
    doctorName: 'Dr. David Chen, MD',
    doctorSpecialty: 'Internal & General Medicine',
    appointmentDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    appointmentTime: '17:00',
    leadTimeDays: 14,
    dayOfWeek: 'Friday',
    appointmentType: 'Routine Checkup',
    previousAppointmentsCount: 5,
    previousNoShowsCount: 3,
    estimatedTravelTimeMins: 45,
    ageCohort: '18-35',
    reminderConsent: true,
    status: 'Scheduled',
    reminderStatus: 'Recommended',
    reminderNotes: 'High likelihood of late afternoon weekend drop-off.',
    createdAt: new Date().toISOString(),
    prediction: {
      riskScore: 68,
      probability: 0.682,
      riskLevel: 'High',
      factors: [
        {
          name: 'High Prior Missed Ratio',
          impact: 'increases_risk',
          description: 'Patient missed 3 of 5 past appointments (60% no-show rate).',
          weight: 0.72,
        },
        {
          name: 'Late Friday Afternoon Slot',
          impact: 'increases_risk',
          description: 'Late afternoon Friday slots exhibit historically higher cancellation/unattended rates.',
          weight: 0.35,
        },
        {
          name: 'Lead Time 14 Days',
          impact: 'increases_risk',
          description: 'Two-week scheduling horizon increases risk of unforeseen schedule conflict.',
          weight: 0.45,
        },
      ],
      explanation: 'Predicted no-show likelihood is elevated at 68%. The appointment is booked 14 days in advance, combined with prior missed visits (3 past no-shows). Proactive multi-channel reminder outreach is recommended.',
      recommendation: {
        action: 'Prioritized Multi-Touch Outreach',
        priority: 'High',
        channels: ['Phone Call', 'WhatsApp Confirmation', 'Two-Way SMS'],
        timing: '48 hours and 24 hours prior',
        details: 'Schedule an interactive phone call by reception staff with instant 1-click WhatsApp reschedule/confirm link. Verify transit assistance if travel time exceeds 45 mins.',
      },
      modelSource: 'calibrated_model_engine',
      nonSensitiveCompliance: true,
      timestamp: new Date().toISOString(),
    },
  },
];

// In-Memory Database store with MongoDB-like interfaces
class MongoStore {
  doctors: Doctor[] = [...INITIAL_DOCTORS];
  appointments: Appointment[] = [...INITIAL_APPOINTMENTS];

  findDoctors() {
    return this.doctors;
  }

  findDoctorById(id: string) {
    return this.doctors.find((d) => d.id === id);
  }

  findAppointments(query?: { riskLevel?: string; doctorId?: string }) {
    let list = [...this.appointments];
    if (query?.riskLevel && query.riskLevel !== 'All') {
      list = list.filter((a) => a.prediction?.riskLevel === query.riskLevel);
    }
    if (query?.doctorId && query.doctorId !== 'All') {
      list = list.filter((a) => a.doctorId === query.doctorId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findAppointmentById(id: string) {
    return this.appointments.find((a) => a.id === id);
  }

  insertAppointment(apt: Appointment) {
    this.appointments.unshift(apt);
    return apt;
  }

  updateAppointment(id: string, update: Partial<Appointment>) {
    const idx = this.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.appointments[idx] = { ...this.appointments[idx], ...update };
    return this.appointments[idx];
  }
}

const db = new MongoStore();

// Model Artifacts loader
function getModelArtifacts() {
  const artifactsPath = path.join(process.cwd(), 'ml_service', 'model_artifacts.json');
  if (fs.existsSync(artifactsPath)) {
    try {
      return JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
    } catch (e) {
      console.warn('Could not parse model_artifacts.json, using fallback engine.', e);
    }
  }
  return null;
}

// Scikit-Learn Calibrated Inference Engine
function calculateNoShowPrediction(params: {
  leadTimeDays: number;
  dayOfWeek: string;
  scheduledHour: number;
  appointmentType: string;
  previousAppointmentsCount: number;
  previousNoShowsCount: number;
  estimatedTravelTimeMins: number;
  hasReminderConsent: boolean;
}): NoShowPrediction {
  const artifacts = getModelArtifacts();

  const leadTime = Number(params.leadTimeDays) || 0;
  const day = params.dayOfWeek || 'Wednesday';
  const hour = Number(params.scheduledHour) || 10;
  const apptType = params.appointmentType || 'New Consultation';
  const prevAppts = Number(params.previousAppointmentsCount) || 0;
  const prevNoShows = Number(params.previousNoShowsCount) || 0;
  const travelMins = Number(params.estimatedTravelTimeMins) || 20;
  const reminder = params.hasReminderConsent ? 1 : 0;
  const prevRatio = prevAppts > 0 ? prevNoShows / prevAppts : 0;

  const rawFeatures = [
    leadTime,
    day === 'Monday' || day === 'Friday' ? 1.0 : 0.0,
    day === 'Saturday' || day === 'Sunday' ? 1.0 : 0.0,
    hour,
    hour >= 14 ? 1.0 : 0.0,
    apptType === 'Routine Checkup' ? 1.0 : 0.0,
    apptType === 'Post-Operative' ? 1.0 : 0.0,
    prevAppts,
    prevNoShows,
    prevRatio,
    travelMins,
    travelMins > 45 ? 1.0 : 0.0,
    reminder,
  ];

  let logit = -1.60;
  if (artifacts && artifacts.weights && artifacts.means && artifacts.stds) {
    const weights: number[] = artifacts.weights;
    const means: number[] = artifacts.means;
    const stds: number[] = artifacts.stds;
    const bias: number = artifacts.bias;

    const scaled = rawFeatures.map((val, idx) => (val - (means[idx] || 0)) / (stds[idx] || 1));
    logit = bias + scaled.reduce((acc, val, idx) => acc + val * (weights[idx] || 0), 0);
  } else {
    // Fallback mathematical model mirroring trained coefficients
    logit = -1.65;
    if (leadTime > 14) logit += 0.045 * Math.min(leadTime - 14, 45) + 0.50;
    else if (leadTime <= 1) logit -= 0.65;
    else logit += 0.035 * Math.max(0, leadTime - 3);

    if (prevAppts > 0) {
      if (prevRatio >= 0.5) logit += 1.35;
      else if (prevRatio > 0.2) logit += 0.70;
      else if (prevNoShows === 0 && prevAppts >= 3) logit -= 0.85;
    }
    if (travelMins > 60) logit += 0.60;
    else if (travelMins > 40) logit += 0.30;
    else if (travelMins <= 15) logit -= 0.25;

    if (day === 'Monday' || day === 'Friday') logit += 0.22;
    if (apptType === 'Routine Checkup') logit += 0.35;
    if (apptType === 'Post-Operative') logit -= 0.80;
    if (reminder === 1) logit -= 0.45;
    else logit += 0.20;
  }

  logit = Math.max(-15, Math.min(15, logit));
  const prob = 1 / (1 + Math.exp(-logit));
  const boundedProb = Math.max(0.02, Math.min(0.98, prob));
  const riskScore = Math.round(boundedProb * 100);

  let riskLevel: RiskLevel = 'Low';
  if (riskScore >= 50) riskLevel = 'High';
  else if (riskScore >= 25) riskLevel = 'Medium';

  const factors: FactorContribution[] = [];

  // Factor 1: Lead Time
  if (leadTime > 14) {
    factors.push({
      name: 'Extended Lead Time',
      impact: 'increases_risk',
      description: `Appointment scheduled ${Math.round(leadTime)} days in advance significantly increases risk of forgetting or schedule changes.`,
      weight: Math.round(0.05 * Math.min(leadTime, 30) * 100) / 100,
    });
  } else if (leadTime <= 2) {
    factors.push({
      name: 'Short Lead Time',
      impact: 'decreases_risk',
      description: `Appointment scheduled ${Math.round(leadTime)} days in advance ensures strong immediate patient urgency.`,
      weight: -0.35,
    });
  }

  // Factor 2: Previous Attendance History
  if (prevAppts > 0) {
    if (prevRatio >= 0.35) {
      factors.push({
        name: 'Prior Missed Appointments',
        impact: 'increases_risk',
        description: `Patient previously missed ${prevNoShows} of ${prevAppts} scheduled appointments (${Math.round(prevRatio * 100)}% no-show rate).`,
        weight: Math.round(prevRatio * 1.2 * 100) / 100,
      });
    } else if (prevNoShows === 0 && prevAppts >= 2) {
      factors.push({
        name: 'Strong Attendance Record',
        impact: 'decreases_risk',
        description: `Patient has attended all ${prevAppts} previous health appointments.`,
        weight: -0.45,
      });
    }
  } else {
    factors.push({
      name: 'First-time Health System Visit',
      impact: 'neutral',
      description: 'Patient has no past attendance records on file with this clinic.',
      weight: 0.08,
    });
  }

  // Factor 3: Commute Distance
  if (travelMins > 45) {
    factors.push({
      name: 'Long Commute Transit',
      impact: 'increases_risk',
      description: `Estimated commute of ${Math.round(travelMins)} minutes adds travel logistics friction.`,
      weight: 0.32,
    });
  } else if (travelMins <= 15) {
    factors.push({
      name: 'Local Proximity',
      impact: 'decreases_risk',
      description: `Estimated travel duration is only ${Math.round(travelMins)} minutes, facilitating ease of arrival.`,
      weight: -0.18,
    });
  }

  // Factor 4: Clinical Visit Type
  if (apptType === 'Post-Operative') {
    factors.push({
      name: 'Critical Clinical Need',
      impact: 'decreases_risk',
      description: 'Post-operative recovery monitoring has high patient-perceived medical importance.',
      weight: -0.50,
    });
  } else if (apptType === 'Routine Checkup') {
    factors.push({
      name: 'Discretionary Preventive Visit',
      impact: 'increases_risk',
      description: 'Routine wellness checkups show higher postponement rates when conflicting events arise.',
      weight: 0.20,
    });
  }

  // Factor 5: Reminder Consent
  if (!params.hasReminderConsent) {
    factors.push({
      name: 'No Digital Reminder Consent',
      impact: 'increases_risk',
      description: 'Patient has opted out of automated SMS/WhatsApp alerts.',
      weight: 0.25,
    });
  } else {
    factors.push({
      name: 'Active Reminder Consent',
      impact: 'decreases_risk',
      description: 'Patient agreed to digital confirmation and reminder outreach.',
      weight: -0.22,
    });
  }

  // Explanation
  const explanationParts: string[] = [];
  if (riskLevel === 'High') {
    explanationParts.push(`Predicted no-show likelihood is elevated at ${riskScore}%.`);
    if (leadTime > 14) explanationParts.push(`The appointment is booked ${Math.round(leadTime)} days in advance,`);
    if (prevRatio > 0.2) explanationParts.push(`combined with prior missed visits (${prevNoShows} past no-shows).`);
    if (travelMins > 45) explanationParts.push(`Commute transit time of ${Math.round(travelMins)} mins adds friction.`);
    explanationParts.push('Proactive multi-channel reminder outreach is recommended.');
  } else if (riskLevel === 'Medium') {
    explanationParts.push(`Moderate risk calculated (${riskScore}% probability).`);
    explanationParts.push('Patient has general attendance capability, but schedule lag or transit may cause friction. A targeted reminder 48 hours prior is advised.');
  } else {
    explanationParts.push(`Low risk estimated (${riskScore}% probability).`);
    explanationParts.push('Favorable attendance indicators present (short lead time, local transit, or consistent historical attendance). Standard automated confirmation SMS is sufficient.');
  }

  // Recommendation
  let recommendation: ReminderRecommendation;
  if (riskLevel === 'High') {
    recommendation = {
      action: 'Prioritized Multi-Touch Outreach',
      priority: 'High',
      channels: ['Phone Call', 'WhatsApp Confirmation', 'Two-Way SMS'],
      timing: '48 hours and 24 hours prior',
      details: 'Schedule an interactive phone call by reception staff with instant 1-click WhatsApp reschedule/confirm link. Verify transit assistance if travel time exceeds 45 mins.',
    };
  } else if (riskLevel === 'Medium') {
    recommendation = {
      action: 'Proactive Digital Reminder',
      priority: 'Medium',
      channels: ['SMS with 1-Click Confirm', 'WhatsApp'],
      timing: '48 hours before + morning-of SMS',
      details: "Dispatch interactive SMS with confirmation keyword ('Reply C to Confirm or R to Reschedule') 48 hours before the slot.",
    };
  } else {
    recommendation = {
      action: 'Standard Automated Notification',
      priority: 'Standard',
      channels: ['Single Confirmation SMS', 'Email'],
      timing: '24 hours before appointment',
      details: 'Send standard calendar reminder SMS containing clinic address and arrival instructions.',
    };
  }

  return {
    riskScore,
    probability: Math.round(boundedProb * 1000) / 1000,
    riskLevel,
    factors,
    explanation: explanationParts.join(' '),
    recommendation,
    modelSource: 'calibrated_model_engine',
    nonSensitiveCompliance: true,
    timestamp: new Date().toISOString(),
  };
}

// Proxy function to Python FastAPI if running
async function queryFastApiIfAvailable(params: any): Promise<NoShowPrediction | null> {
  const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600); // quick timeout

    const res = await fetch(`${fastApiUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead_time_days: Number(params.leadTimeDays) || 0,
        day_of_week: params.dayOfWeek || 'Wednesday',
        scheduled_hour: Number(params.scheduledHour) || 10,
        appointment_type: params.appointmentType || 'New Consultation',
        previous_appointments: Number(params.previousAppointmentsCount) || 0,
        previous_no_shows: Number(params.previousNoShowsCount) || 0,
        estimated_travel_time_mins: Number(params.estimatedTravelTimeMins) || 20,
        has_reminder_consent: Boolean(params.hasReminderConsent),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as NoShowPrediction;
      return {
        ...data,
        modelSource: 'fastapi_microservice',
      };
    }
  } catch (err) {
    // FastAPI server not started or unreachable, fallback silently
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  // 1. Health & Status
  app.get('/api/health', (req: Request, res: Response) => {
    const artifacts = getModelArtifacts();
    res.json({
      status: 'healthy',
      service: 'book-a-doctor-mern-api',
      database: 'MongoDB In-Memory Document Store (Durable Mock)',
      modelReady: true,
      hasArtifacts: artifacts !== null,
      fastApiConfiguredUrl: process.env.FASTAPI_URL || 'http://localhost:8000',
    });
  });

  // 2. Doctors List
  app.get('/api/doctors', (req: Request, res: Response) => {
    res.json({ success: true, data: db.findDoctors() });
  });

  // 3. Appointments List
  app.get('/api/appointments', (req: Request, res: Response) => {
    const { riskLevel, doctorId } = req.query as { riskLevel?: string; doctorId?: string };
    const list = db.findAppointments({ riskLevel, doctorId });
    res.json({ success: true, data: list });
  });

  // 4. Create Appointment
  app.post('/api/appointments', async (req: Request, res: Response) => {
    try {
      const {
        patientName,
        patientPhone,
        patientEmail,
        doctorId,
        appointmentDate,
        appointmentTime,
        appointmentType,
        previousAppointmentsCount = 0,
        previousNoShowsCount = 0,
        estimatedTravelTimeMins = 20,
        ageCohort = '36-59',
        reminderConsent = true,
      } = req.body;

      if (!patientName || !patientPhone || !doctorId || !appointmentDate || !appointmentTime) {
        return res.status(400).json({ success: false, error: 'Missing required appointment fields.' });
      }

      const doctor = db.findDoctorById(doctorId);
      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found.' });
      }

      // Calculate lead time in days
      const targetDate = new Date(`${appointmentDate}T${appointmentTime}`);
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();
      const leadTimeDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

      // Day of week
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = days[targetDate.getDay()];
      const scheduledHour = targetDate.getHours() || 10;

      const predictionInput = {
        leadTimeDays,
        dayOfWeek,
        scheduledHour,
        appointmentType: appointmentType || 'New Consultation',
        previousAppointmentsCount: Number(previousAppointmentsCount) || 0,
        previousNoShowsCount: Number(previousNoShowsCount) || 0,
        estimatedTravelTimeMins: Number(estimatedTravelTimeMins) || 20,
        hasReminderConsent: Boolean(reminderConsent),
      };

      // Try FastAPI first; if not reachable, use calibrated local engine
      let prediction = await queryFastApiIfAvailable(predictionInput);
      if (!prediction) {
        prediction = calculateNoShowPrediction(predictionInput);
      }

      const newApt: Appointment = {
        id: `apt-${Date.now().toString().slice(-6)}`,
        patientName,
        patientPhone,
        patientEmail: patientEmail || '',
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        appointmentDate,
        appointmentTime,
        leadTimeDays,
        dayOfWeek,
        appointmentType: appointmentType || 'New Consultation',
        previousAppointmentsCount: Number(previousAppointmentsCount) || 0,
        previousNoShowsCount: Number(previousNoShowsCount) || 0,
        estimatedTravelTimeMins: Number(estimatedTravelTimeMins) || 20,
        ageCohort: ageCohort || '36-59',
        reminderConsent: Boolean(reminderConsent),
        status: 'Scheduled',
        reminderStatus: prediction.riskLevel === 'High' ? 'Recommended' : 'None',
        createdAt: new Date().toISOString(),
        prediction,
      };

      db.insertAppointment(newApt);
      res.status(201).json({ success: true, data: newApt });
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
  });

  // 5. Update Reminder Status
  app.patch('/api/appointments/:id/reminder', (req: Request, res: Response) => {
    const { id } = req.params;
    const { reminderStatus, reminderNotes } = req.body;

    const updated = db.updateAppointment(id, {
      reminderStatus,
      reminderNotes: reminderNotes ? reminderNotes : undefined,
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({ success: true, data: updated });
  });

  // 6. Update Appointment Status
  app.patch('/api/appointments/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const updated = db.updateAppointment(id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({ success: true, data: updated });
  });

  // 7. Interactive Standalone Prediction Endpoint
  app.post('/api/predict', async (req: Request, res: Response) => {
    try {
      const {
        leadTimeDays = 0,
        dayOfWeek = 'Wednesday',
        scheduledHour = 10,
        appointmentType = 'New Consultation',
        previousAppointmentsCount = 0,
        previousNoShowsCount = 0,
        estimatedTravelTimeMins = 20,
        hasReminderConsent = true,
      } = req.body;

      const predictionInput = {
        leadTimeDays: Number(leadTimeDays),
        dayOfWeek,
        scheduledHour: Number(scheduledHour),
        appointmentType,
        previousAppointmentsCount: Number(previousAppointmentsCount),
        previousNoShowsCount: Number(previousNoShowsCount),
        estimatedTravelTimeMins: Number(estimatedTravelTimeMins),
        hasReminderConsent: Boolean(hasReminderConsent),
      };

      let prediction = await queryFastApiIfAvailable(predictionInput);
      if (!prediction) {
        prediction = calculateNoShowPrediction(predictionInput);
      }

      res.json({ success: true, data: prediction });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to generate prediction' });
    }
  });

  // 8. Model Evaluation Metrics
  app.get('/api/model/metrics', (req: Request, res: Response) => {
    const artifacts = getModelArtifacts();
    if (!artifacts) {
      return res.status(500).json({ success: false, error: 'Model artifacts not found' });
    }
    res.json({
      success: true,
      data: {
        modelName: artifacts.modelName,
        datasetType: artifacts.datasetType,
        totalSamples: artifacts.totalSamples,
        testSamples: artifacts.testSamples,
        accuracy: artifacts.accuracy,
        precision: artifacts.precision,
        recall: artifacts.recall,
        f1Score: artifacts.f1Score,
        rocAuc: artifacts.rocAuc,
        brierScore: artifacts.brierScore,
        confusionMatrix: artifacts.confusionMatrix,
        calibrationBins: artifacts.calibrationBins,
        featureWeights: artifacts.featureWeights,
      },
    });
  });

  // 9. Fairness Evaluation
  app.get('/api/model/fairness', (req: Request, res: Response) => {
    const artifacts = getModelArtifacts();
    if (!artifacts || !artifacts.fairnessEvaluation) {
      return res.status(500).json({ success: false, error: 'Fairness audit not found' });
    }
    res.json({
      success: true,
      data: artifacts.fairnessEvaluation,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hospital MERN Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type AppointmentType =
  | 'New Consultation'
  | 'Follow-up'
  | 'Routine Checkup'
  | 'Post-Operative'
  | 'Specialist Consultation';

export type AppointmentStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled'
  | 'No-Show';

export type ReminderStatus =
  | 'None'
  | 'Recommended'
  | 'SMS Sent'
  | 'WhatsApp Sent'
  | 'Call Completed'
  | 'Confirmed by Patient';

export type AgeCohort = '18-35' | '36-59' | '60+';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  avatar: string;
  rating: number;
  availableDays: string[];
  hospitalClinic: string;
}

export interface FactorContribution {
  name: string;
  impact: 'increases_risk' | 'decreases_risk' | 'neutral';
  description: string;
  weight: number;
}

export interface ReminderRecommendation {
  action: string;
  priority: 'High' | 'Medium' | 'Standard';
  channels: string[];
  timing: string;
  details: string;
}

export interface NoShowPrediction {
  riskScore: number; // 0-100 integer
  probability: number; // 0.0 - 1.0
  riskLevel: RiskLevel;
  factors: FactorContribution[];
  explanation: string;
  recommendation: ReminderRecommendation;
  modelSource: 'fastapi_microservice' | 'calibrated_model_engine';
  nonSensitiveCompliance: boolean;
  timestamp: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  leadTimeDays: number;
  dayOfWeek: string; // Monday, Tuesday, etc.
  appointmentType: AppointmentType;
  previousAppointmentsCount: number;
  previousNoShowsCount: number;
  estimatedTravelTimeMins: number;
  ageCohort: AgeCohort;
  reminderConsent: boolean;
  status: AppointmentStatus;
  reminderStatus: ReminderStatus;
  reminderNotes?: string;
  createdAt: string;
  prediction: NoShowPrediction;
}

export interface ModelEvaluationMetrics {
  modelName: string;
  datasetType: string;
  totalSamples: number;
  testSamples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  brierScore: number;
  confusionMatrix: {
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
    truePositive: number;
  };
  calibrationBins: Array<{
    bin: string;
    meanPredictedProb: number;
    observedNoShowRate: number;
    sampleCount: number;
  }>;
  featureWeights: Array<{
    feature: string;
    coefficient: number;
    oddsRatio: number;
    impactDirection: string;
    description: string;
  }>;
}

export interface FairnessCohort {
  attribute: string;
  group: string;
  sampleSize: number;
  observedNoShowRate: number;
  predictedHighRiskRate: number;
  accuracy: number;
  truePositiveRate: number; // Sensitivity / Equal Opportunity
  falsePositiveRate: number; // Predictive Equality
  brierScore: number;
  disparateImpactRatio: number;
  parityStatus: 'Optimal' | 'Acceptable' | 'Needs Review';
}

export interface FairnessEvaluation {
  status: string;
  ethicalGuarantee: string;
  excludedSensitiveAttributes: string[];
  cohorts: FairnessCohort[];
  fairnessSummary: {
    overallVerdict: string;
    keyFindings: string[];
    demographicParityStatus: string;
    calibrationParityStatus: string;
  };
}

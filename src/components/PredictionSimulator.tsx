import React, { useState, useEffect } from 'react';
import {
  AppointmentType,
  NoShowPrediction,
} from '../types';
import { computeClientPrediction } from '../utils/predictionFallback';
import {
  Cpu,
  Sparkles,
  Sliders,
  ShieldCheck,
  Bell,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
  Car,
  RotateCcw,
} from 'lucide-react';

export const PredictionSimulator: React.FC = () => {
  const [leadTimeDays, setLeadTimeDays] = useState<number>(14);
  const [dayOfWeek, setDayOfWeek] = useState<string>('Friday');
  const [scheduledHour, setScheduledHour] = useState<number>(16);
  const [appointmentType, setAppointmentType] =
    useState<AppointmentType>('Routine Checkup');
  const [previousAppointmentsCount, setPreviousAppointmentsCount] =
    useState<number>(4);
  const [previousNoShowsCount, setPreviousNoShowsCount] = useState<number>(2);
  const [estimatedTravelTimeMins, setEstimatedTravelTimeMins] =
    useState<number>(45);
  const [hasReminderConsent, setHasReminderConsent] = useState<boolean>(true);

  const [prediction, setPrediction] = useState<NoShowPrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadTimeDays,
          dayOfWeek,
          scheduledHour,
          appointmentType,
          previousAppointmentsCount,
          previousNoShowsCount,
          estimatedTravelTimeMins,
          hasReminderConsent,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setPrediction(data.data);
          return;
        }
      }
      throw new Error('API unavailable, running client model');
    } catch {
      const fallback = computeClientPrediction({
        leadTimeDays,
        dayOfWeek,
        scheduledHour,
        appointmentType,
        previousAppointmentsCount,
        previousNoShowsCount,
        estimatedTravelTimeMins,
        hasReminderConsent,
      });
      setPrediction(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [
    leadTimeDays,
    dayOfWeek,
    scheduledHour,
    appointmentType,
    previousAppointmentsCount,
    previousNoShowsCount,
    estimatedTravelTimeMins,
    hasReminderConsent,
  ]);

  const handleResetToPresets = (preset: 'high' | 'medium' | 'low') => {
    if (preset === 'high') {
      setLeadTimeDays(24);
      setDayOfWeek('Friday');
      setScheduledHour(16);
      setAppointmentType('Routine Checkup');
      setPreviousAppointmentsCount(4);
      setPreviousNoShowsCount(2);
      setEstimatedTravelTimeMins(60);
      setHasReminderConsent(false);
    } else if (preset === 'medium') {
      setLeadTimeDays(10);
      setDayOfWeek('Monday');
      setScheduledHour(14);
      setAppointmentType('Follow-up');
      setPreviousAppointmentsCount(3);
      setPreviousNoShowsCount(1);
      setEstimatedTravelTimeMins(30);
      setHasReminderConsent(true);
    } else {
      setLeadTimeDays(2);
      setDayOfWeek('Wednesday');
      setScheduledHour(10);
      setAppointmentType('Post-Operative');
      setPreviousAppointmentsCount(5);
      setPreviousNoShowsCount(0);
      setEstimatedTravelTimeMins(12);
      setHasReminderConsent(true);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical No-Show Prediction Sandbox
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              Real-Time Inference
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate scenarios to observe how operational variables shift the attendance risk distribution.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Test Presets:</span>
          <button
            onClick={() => handleResetToPresets('high')}
            className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold cursor-pointer"
          >
            High Risk Case
          </button>
          <button
            onClick={() => handleResetToPresets('medium')}
            className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-semibold cursor-pointer"
          >
            Medium Risk Case
          </button>
          <button
            onClick={() => handleResetToPresets('low')}
            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold cursor-pointer"
          >
            Low Risk Case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Input Simulation Parameters</span>
            </h2>
            <span className="text-[11px] text-slate-500">
              Non-sensitive variables only
            </span>
          </div>

          {/* 1. Lead Time Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Lead Time (Booking Lag)
              </span>
              <span className="font-bold text-teal-700 text-sm">
                {leadTimeDays} days ahead
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Same-day (0d)</span>
              <span>1 week (7d)</span>
              <span>2 weeks (14d)</span>
              <span>1 month (30d+)</span>
            </div>
          </div>

          {/* 2. Day & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Monday">Monday (Start of week)</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday (Midweek stable)</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday (Late week)</option>
                <option value="Saturday">Saturday (Weekend clinic)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheduled Slot Hour
              </label>
              <select
                value={scheduledHour}
                onChange={(e) => setScheduledHour(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={9}>09:00 AM (Early Morning)</option>
                <option value={10}>10:00 AM (Mid Morning)</option>
                <option value={11}>11:00 AM (Late Morning)</option>
                <option value={14}>02:00 PM (Early Afternoon)</option>
                <option value={16}>04:00 PM (Late Afternoon)</option>
                <option value={17}>05:00 PM (Evening)</option>
              </select>
            </div>
          </div>

          {/* 3. Appointment Clinical Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Visit Classification
            </label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="New Consultation">New Consultation (Initial intake)</option>
              <option value="Follow-up">Follow-up (Ongoing care)</option>
              <option value="Routine Checkup">Routine Checkup (Preventive / Discretionary)</option>
              <option value="Post-Operative">Post-Operative (High Urgency / Surgical)</option>
              <option value="Specialist Consultation">Specialist Consultation (Complex)</option>
            </select>
          </div>

          {/* 4. Past Attendance Patterns */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Patient Attendance History
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-medium">
                  Past Scheduled Appointments
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={previousAppointmentsCount}
                  onChange={(e) =>
                    setPreviousAppointmentsCount(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-medium">
                  Past Unattended / No-Shows
                </label>
                <input
                  type="number"
                  min="0"
                  max={previousAppointmentsCount}
                  value={previousNoShowsCount}
                  onChange={(e) =>
                    setPreviousNoShowsCount(
                      Math.min(
                        previousAppointmentsCount,
                        Math.max(0, parseInt(e.target.value) || 0)
                      )
                    )
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
            {previousAppointmentsCount > 0 && (
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Historical Missed Ratio:</span>
                <span className="font-semibold text-slate-700">
                  {Math.round((previousNoShowsCount / previousAppointmentsCount) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* 5. Commute Travel Time Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-slate-500" />
                <span>Estimated One-Way Commute Duration</span>
              </span>
              <span className="font-bold text-teal-700 text-sm">
                {estimatedTravelTimeMins} mins
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={estimatedTravelTimeMins}
              onChange={(e) => setEstimatedTravelTimeMins(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Local (&le;15m)</span>
              <span>Moderate (30m)</span>
              <span>Long Commute (45m+)</span>
              <span>Distant (60m+)</span>
            </div>
          </div>

          {/* 6. Reminder Consent */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={hasReminderConsent}
                onChange={(e) => setHasReminderConsent(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
              <span>Patient opted-in to digital reminder notifications</span>
            </label>
          </div>
        </div>

        {/* Output Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {prediction ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Model Output Assessment
                </span>
                <span className="text-[11px] text-slate-400">
                  Calibrated Logistic Engine
                </span>
              </div>

              {/* Visual Score Gauge */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      stroke="#e2e8f0"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      stroke={
                        prediction.riskLevel === 'High'
                          ? '#e11d48'
                          : prediction.riskLevel === 'Medium'
                          ? '#d97706'
                          : '#059669'
                      }
                      strokeWidth="10"
                      strokeDasharray={314}
                      strokeDashoffset={314 - (314 * prediction.riskScore) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {prediction.riskScore}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Probability
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      prediction.riskLevel === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : prediction.riskLevel === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {prediction.riskLevel} No-Show Risk Tier
                  </span>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Plain-Language Assessment
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                  {prediction.explanation}
                </p>
              </div>

              {/* Factor Contributions */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Contributing Factors Breakdown
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {prediction.factors.map((f, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 ${
                        f.impact === 'increases_risk'
                          ? 'bg-rose-50/50 border-rose-200'
                          : f.impact === 'decreases_risk'
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {f.name}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {f.description}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                          f.impact === 'increases_risk'
                            ? 'bg-rose-200 text-rose-800'
                            : f.impact === 'decreases_risk'
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {f.impact === 'increases_risk'
                          ? '+ Risk'
                          : f.impact === 'decreases_risk'
                          ? '- Protective'
                          : 'Neutral'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Protocol */}
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-900">
                    Suggested Protocol:
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-teal-200/60 text-teal-800 px-2 py-0.5 rounded">
                    {prediction.recommendation.priority} Priority
                  </span>
                </div>
                <div className="font-semibold text-teal-800">
                  {prediction.recommendation.action}
                </div>
                <p className="text-teal-950 text-[11px] leading-relaxed">
                  {prediction.recommendation.details}
                </p>
                <div className="pt-1 text-[11px] text-teal-800 font-medium">
                  Channels: {prediction.recommendation.channels.join(', ')}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
              Calculating real-time prediction...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

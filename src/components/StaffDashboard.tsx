import React, { useState } from 'react';
import {
  Appointment,
  Doctor,
  RiskLevel,
} from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Bell,
  Sparkles,
  ChevronDown,
  Info,
  ExternalLink,
  ShieldCheck,
  Send,
  UserCheck,
  UserX,
  RefreshCw,
} from 'lucide-react';

interface StaffDashboardProps {
  appointments: Appointment[];
  doctors: Doctor[];
  onUpdateReminderStatus: (
    aptId: string,
    newStatus: string,
    notes?: string
  ) => Promise<void>;
  onUpdateAppointmentStatus: (aptId: string, newStatus: string) => Promise<void>;
  onRefresh: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  appointments,
  doctors,
  onUpdateReminderStatus,
  onUpdateAppointmentStatus,
  onRefresh,
}) => {
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [doctorFilter, setDoctorFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filtered Appointments
  const filtered = appointments.filter((apt) => {
    if (riskFilter !== 'All' && apt.prediction?.riskLevel !== riskFilter) {
      return false;
    }
    if (doctorFilter !== 'All' && apt.doctorId !== doctorFilter) {
      return false;
    }
    if (
      searchQuery.trim() &&
      !apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Calculate Aggregates
  const total = appointments.length;
  const highRisk = appointments.filter(
    (a) => a.prediction?.riskLevel === 'High'
  ).length;
  const mediumRisk = appointments.filter(
    (a) => a.prediction?.riskLevel === 'Medium'
  ).length;
  const lowRisk = appointments.filter(
    (a) => a.prediction?.riskLevel === 'Low'
  ).length;

  const remindersSentCount = appointments.filter(
    (a) =>
      a.reminderStatus === 'SMS Sent' ||
      a.reminderStatus === 'WhatsApp Sent' ||
      a.reminderStatus === 'Call Completed' ||
      a.reminderStatus === 'Confirmed by Patient'
  ).length;

  const avgAttendanceProb =
    total > 0
      ? Math.round(
          (appointments.reduce(
            (acc, a) => acc + (1 - (a.prediction?.probability || 0.2)),
            0
          ) /
            total) *
            100
        )
      : 80;

  const handleQuickSendReminder = async (apt: Appointment) => {
    setActionLoadingId(apt.id);
    setActionSuccessMsg(null);
    try {
      const channel =
        apt.prediction?.riskLevel === 'High'
          ? 'Call Completed'
          : 'SMS Sent';
      const notes =
        apt.prediction?.riskLevel === 'High'
          ? 'Staff completed priority telephone verification & sent WhatsApp confirmation.'
          : 'Automated 1-click attendance confirmation SMS dispatched.';

      await onUpdateReminderStatus(apt.id, channel, notes);
      setActionSuccessMsg(`Reminder protocol logged for ${apt.patientName}!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Failed to send reminder: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmAttendance = async (apt: Appointment) => {
    setActionLoadingId(apt.id);
    try {
      await onUpdateReminderStatus(
        apt.id,
        'Confirmed by Patient',
        'Patient acknowledged arrival via two-way digital confirmation.'
      );
      setActionSuccessMsg(`Patient ${apt.patientName} confirmed attendance!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hospital Staff Attendance Triage Dashboard
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predictive no-show probability triage, prioritized outreach queues, and reminder dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Total Booked</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {total}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Active appointments
          </span>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700 font-semibold">High Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-bold text-rose-800 mt-1 block">
            {highRisk}
          </span>
          <span className="text-[11px] text-rose-600 font-medium mt-0.5 block">
            &gt;50% probability
          </span>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs bg-amber-50/20">
          <span className="text-xs text-amber-700 font-semibold block">Medium Risk</span>
          <span className="text-2xl font-bold text-amber-800 mt-1 block">
            {mediumRisk}
          </span>
          <span className="text-[11px] text-amber-600 font-medium mt-0.5 block">
            25%–50% probability
          </span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs bg-emerald-50/20">
          <span className="text-xs text-emerald-700 font-semibold block">Low Risk</span>
          <span className="text-2xl font-bold text-emerald-800 mt-1 block">
            {lowRisk}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
            &lt;25% probability
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">
            Projected Attendance
          </span>
          <span className="text-2xl font-bold text-teal-700 mt-1 block">
            {avgAttendanceProb}%
          </span>
          <span className="text-[11px] text-teal-600 mt-0.5 block">
            Calibrated expectation
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">
            Reminders Logged
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {remindersSentCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Multi-touch outreach
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Risk Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium">Risk:</span>
            {['All', 'High', 'Medium', 'Low'].map((level) => (
              <button
                key={level}
                onClick={() => setRiskFilter(level)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  riskFilter === level
                    ? level === 'High'
                      ? 'bg-rose-600 text-white'
                      : level === 'Medium'
                      ? 'bg-amber-600 text-white'
                      : level === 'Low'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Doctor Selector Filter */}
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All Physicians</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialty.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointment Queue Table & Cards */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-sm">
              Appointment Attendance Triage List
            </h2>
            <span className="text-xs text-slate-500">
              ({filtered.length} matching)
            </span>
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Strictly non-punitive resource allocation</span>
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No appointments match the selected filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((apt) => {
              const risk = apt.prediction?.riskLevel || 'Low';
              const isHigh = risk === 'High';
              const isMedium = risk === 'Medium';
              const isLow = risk === 'Low';

              return (
                <div
                  key={apt.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Column 1: Patient & Doctor Info */}
                  <div className="space-y-1 sm:w-72">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {apt.patientName}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {apt.appointmentType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <span>{apt.doctorName}</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-teal-700 font-medium">
                        {apt.doctorSpecialty}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {apt.appointmentDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {apt.appointmentTime}
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-[11px] font-medium text-slate-600">
                        {apt.leadTimeDays}d lead
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Risk Probability & Key Factor Badges */}
                  <div className="space-y-1.5 flex-1 max-w-lg">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isHigh
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isMedium
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {apt.prediction?.riskScore}% No-Show Risk ({risk})
                      </span>

                      {/* Reminder status badge */}
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          apt.reminderStatus === 'Confirmed by Patient'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.reminderStatus === 'Call Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : apt.reminderStatus === 'SMS Sent'
                            ? 'bg-purple-100 text-purple-800'
                            : apt.reminderStatus === 'Recommended'
                            ? 'bg-amber-100 text-amber-800 font-semibold'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Status: {apt.reminderStatus}
                      </span>
                    </div>

                    {/* Contributing Factor Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {apt.prediction?.factors.slice(0, 3).map((f, i) => (
                        <span
                          key={i}
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            f.impact === 'increases_risk'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : f.impact === 'decreases_risk'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {apt.prediction?.explanation}
                    </p>
                  </div>

                  {/* Column 3: Recommended Action & Staff Trigger Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 lg:justify-end">
                    <button
                      onClick={() => setSelectedAppointment(apt)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Audit Details
                    </button>

                    {apt.reminderStatus !== 'Confirmed by Patient' ? (
                      <>
                        <button
                          id={`btn-send-reminder-${apt.id}`}
                          disabled={actionLoadingId === apt.id}
                          onClick={() => handleQuickSendReminder(apt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5 text-white ${
                            isHigh
                              ? 'bg-rose-600 hover:bg-rose-700'
                              : isMedium
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-teal-600 hover:bg-teal-700'
                          }`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>
                            {isHigh ? 'Call & SMS Protocol' : 'Send Reminder'}
                          </span>
                        </button>

                        <button
                          onClick={() => handleConfirmAttendance(apt)}
                          className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 cursor-pointer"
                          title="Mark confirmed by patient"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed Attending</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal / Drawer for Selected Appointment */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  Clinical Triage Record #{selectedAppointment.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedAppointment.patientName} &bull; {selectedAppointment.doctorName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 cursor-pointer"
              >
                &times; Close
              </button>
            </div>

            {/* Risk and Explanation Overview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Predicted No-Show Likelihood
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedAppointment.prediction?.riskLevel === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedAppointment.prediction?.riskLevel === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedAppointment.prediction?.riskScore}% ({selectedAppointment.prediction?.riskLevel} Risk)
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedAppointment.prediction?.explanation}
              </p>
            </div>

            {/* Contributing Non-Sensitive Factors */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                Model Feature Breakdown
              </h4>
              <div className="space-y-2">
                {selectedAppointment.prediction?.factors.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border text-xs flex items-start justify-between gap-3 bg-white"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {f.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            f.impact === 'increases_risk'
                              ? 'bg-rose-100 text-rose-800'
                              : f.impact === 'decreases_risk'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {f.impact === 'increases_risk'
                            ? '+ Risk Driver'
                            : f.impact === 'decreases_risk'
                            ? '- Protective Driver'
                            : 'Neutral'}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Reminder Protocol */}
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900">
                  Recommended Protocol: {selectedAppointment.prediction?.recommendation.action}
                </span>
                <span className="text-[11px] text-teal-800 font-semibold bg-teal-200/50 px-2 py-0.5 rounded">
                  Timing: {selectedAppointment.prediction?.recommendation.timing}
                </span>
              </div>
              <p className="text-teal-950">
                {selectedAppointment.prediction?.recommendation.details}
              </p>
              <div className="pt-1 text-teal-900 font-medium">
                Active Channels: {selectedAppointment.prediction?.recommendation.channels.join(', ')}
              </div>
            </div>

            {/* Non-Sensitive Compliance Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Compliance Verification: Zero demographic variables (religion, caste, gender) were passed to model weights. Non-punitive operational use only.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

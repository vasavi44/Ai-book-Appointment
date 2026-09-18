import React, { useState } from 'react';
import {
  Doctor,
  Appointment,
  AppointmentType,
  AgeCohort,
} from '../types';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Bell,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

interface BookDoctorViewProps {
  doctors: Doctor[];
  onAppointmentCreated: (newApt: Appointment) => void;
  onNavigateToDashboard: () => void;
}

export const BookDoctorView: React.FC<BookDoctorViewProps> = ({
  doctors,
  onAppointmentCreated,
  onNavigateToDashboard,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [appointmentType, setAppointmentType] =
    useState<AppointmentType>('New Consultation');
  const [previousAppointmentsCount, setPreviousAppointmentsCount] = useState(1);
  const [previousNoShowsCount, setPreviousNoShowsCount] = useState(0);
  const [estimatedTravelTimeMins, setEstimatedTravelTimeMins] = useState(25);
  const [ageCohort, setAgeCohort] = useState<AgeCohort>('36-59');
  const [reminderConsent, setReminderConsent] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] =
    useState<Appointment | null>(null);

  const specialties = [
    'All',
    'Cardiology',
    'Orthopedics & Sports Medicine',
    'Pediatrics & Adolescent Care',
    'Neurology',
    'Internal & General Medicine',
  ];

  const filteredDoctors =
    selectedSpecialty === 'All'
      ? doctors
      : doctors.filter((d) => d.specialty.includes(selectedSpecialty));

  const handleSelectDoctor = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setCreatedAppointment(null);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) {
      setError('Please select a doctor first.');
      return;
    }
    if (!patientName.trim() || !patientPhone.trim()) {
      setError('Please enter patient name and contact phone number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientPhone,
          patientEmail,
          doctorId: selectedDoctor.id,
          appointmentDate,
          appointmentTime,
          appointmentType,
          previousAppointmentsCount: Number(previousAppointmentsCount),
          previousNoShowsCount: Number(previousNoShowsCount),
          estimatedTravelTimeMins: Number(estimatedTravelTimeMins),
          ageCohort,
          reminderConsent,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to book appointment');
      }

      setCreatedAppointment(json.data);
      onAppointmentCreated(json.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedDoctor(null);
    setCreatedAppointment(null);
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Introduction Header */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MERN Hospital Clinical Scheduling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Book a Specialist Consultation
          </h1>
          <p className="mt-2 text-sm sm:text-base text-teal-100/90 leading-relaxed">
            Schedule an appointment with board-certified physicians. Our integrated AI engine simultaneously evaluates attendance feasibility using non-sensitive clinical parameters to orchestrate proactive patient support and reminders.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Stethoscope className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Confirmation View after successful booking */}
      {createdAppointment && (
        <div className="bg-white border border-teal-200 rounded-2xl p-6 sm:p-8 shadow-sm transition-all animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  Appointment Confirmed
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  Booking #{createdAppointment.id}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                id="btn-book-another"
                onClick={handleReset}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Book Another Appointment
              </button>
              <button
                id="btn-go-staff-dashboard"
                onClick={onNavigateToDashboard}
                className="px-4 py-2 bg-teal-600 rounded-lg text-sm font-medium text-white hover:bg-teal-700 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>View in Staff Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Appointment Details */}
            <div className="lg:col-span-1 bg-slate-50/70 rounded-xl p-5 border border-slate-200">
              <h3 className="font-semibold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Visit Details</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Patient</span>
                  <span className="font-medium text-slate-900">
                    {createdAppointment.patientName}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Contact</span>
                  <span className="text-slate-800">
                    {createdAppointment.patientPhone}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Physician</span>
                  <span className="font-medium text-slate-900">
                    {createdAppointment.doctorName}
                  </span>
                  <span className="text-xs text-slate-600 block">
                    {createdAppointment.doctorSpecialty}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Date & Time</span>
                  <span className="font-semibold text-slate-900">
                    {createdAppointment.appointmentDate} at {createdAppointment.appointmentTime} ({createdAppointment.dayOfWeek})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Lead Time</span>
                  <span className="text-slate-800">
                    {createdAppointment.leadTimeDays} days prior to visit
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Visit Classification</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-800 mt-1">
                    {createdAppointment.appointmentType}
                  </span>
                </div>
              </div>
            </div>

            {/* AI No-Show Risk & Factor Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="font-semibold text-slate-900 text-sm">
                      AI Attendance Feasibility Assessment
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Risk Score:</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        createdAppointment.prediction.riskLevel === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : createdAppointment.prediction.riskLevel === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {createdAppointment.prediction.riskScore}% &bull; {createdAppointment.prediction.riskLevel} Risk
                    </span>
                  </div>
                </div>

                {/* Plain Explanation */}
                <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                  {createdAppointment.prediction.explanation}
                </p>

                {/* Factors Considered */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                    Non-Sensitive Factors Influencing Prediction
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {createdAppointment.prediction.factors.map((factor, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs ${
                          factor.impact === 'increases_risk'
                            ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                            : factor.impact === 'decreases_risk'
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold mb-1">
                          <span>{factor.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              factor.impact === 'increases_risk'
                                ? 'bg-rose-200/80 text-rose-800'
                                : factor.impact === 'decreases_risk'
                                ? 'bg-emerald-200/80 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {factor.impact === 'increases_risk'
                              ? '+ Elevates Risk'
                              : factor.impact === 'decreases_risk'
                              ? '- Lowers Risk'
                              : 'Neutral'}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-normal">
                          {factor.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reminder Protocol Recommendation */}
                <div className="mt-4 p-4 rounded-xl bg-teal-50/80 border border-teal-200">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-900 text-sm">
                          Suggested Reminder Protocol:
                        </span>
                        <span className="font-semibold text-teal-800 bg-teal-200/60 px-2 py-0.5 rounded">
                          {createdAppointment.prediction.recommendation.action}
                        </span>
                      </div>
                      <p className="text-teal-950 leading-relaxed">
                        {createdAppointment.prediction.recommendation.details}
                      </p>
                      <div className="pt-1 text-teal-800 font-medium flex items-center gap-4">
                        <span>Channels: {createdAppointment.prediction.recommendation.channels.join(', ')}</span>
                        <span>Timing: {createdAppointment.prediction.recommendation.timing}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Doctor Selection */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>1. Select a Physician</span>
              {selectedDoctor && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Selected: {selectedDoctor.name}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Choose from our hospital departments and outpatient specialists
            </p>
          </div>

          {/* Specialty Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedSpecialty === spec
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doc) => {
            const isSelected = selectedDoctor?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => handleSelectDoctor(doc)}
                className={`border rounded-xl p-4 transition-all cursor-pointer relative bg-white ${
                  isSelected
                    ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-teal-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                    <p className="text-xs font-medium text-teal-700">
                      {doc.specialty}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {doc.qualification} &bull; {doc.experienceYears} yrs exp.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{doc.rating}</span>
                  </div>
                  <div className="font-medium text-slate-900">
                    ${doc.consultationFee} <span className="text-[11px] text-slate-500 font-normal">consultation</span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{doc.hospitalClinic}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Appointment & Patient Details Form */}
      {selectedDoctor && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs transition-all">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>2. Appointment & Attendance Factors</span>
                <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold">
                  Dr. {selectedDoctor.name.replace('Dr. ', '')}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Provide scheduling and transit parameters. Features used for attendance modeling are strictly non-sensitive.
              </p>
            </div>
            <button
              onClick={() => setSelectedDoctor(null)}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Doctor</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitBooking} className="space-y-6">
            {/* Section A: Patient Identity */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Patient Identification</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    id="input-patient-name"
                    required
                    placeholder="e.g. Johnathan Doe"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (for SMS confirmation) *
                  </label>
                  <input
                    type="tel"
                    id="input-patient-phone"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (optional)
                  </label>
                  <input
                    type="email"
                    id="input-patient-email"
                    placeholder="patient@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Clinical Schedule */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule & Visit Type</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    id="input-appointment-date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Calculates lead time relative to today
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Time Slot *
                  </label>
                  <select
                    id="select-appointment-time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                  >
                    <option value="09:00">09:00 AM (Morning Clinic)</option>
                    <option value="10:00">10:00 AM (Morning Clinic)</option>
                    <option value="11:15">11:15 AM (Morning Clinic)</option>
                    <option value="13:30">01:30 PM (Early Afternoon)</option>
                    <option value="14:45">02:45 PM (Afternoon Clinic)</option>
                    <option value="16:00">04:00 PM (Late Afternoon)</option>
                    <option value="17:15">05:15 PM (Evening Clinic)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Visit Classification *
                  </label>
                  <select
                    id="select-appointment-type"
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                  >
                    <option value="New Consultation">New Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Routine Checkup">Routine Checkup</option>
                    <option value="Post-Operative">Post-Operative (High Urgency)</option>
                    <option value="Specialist Consultation">Specialist Consultation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section C: Non-Sensitive Operational Feasibility Factors */}
            <div className="bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Attendance Feasibility Modeling Variables</span>
                </h3>
                <span className="text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-medium border border-teal-200">
                  Ethically Audited Inputs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Past Appointments at Health System
                  </label>
                  <input
                    type="number"
                    id="input-prev-appts"
                    min="0"
                    max="100"
                    value={previousAppointmentsCount}
                    onChange={(e) => setPreviousAppointmentsCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    0 if first-time visitor
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Past Unattended / No-Shows
                  </label>
                  <input
                    type="number"
                    id="input-prev-noshows"
                    min="0"
                    max={previousAppointmentsCount}
                    value={previousNoShowsCount}
                    onChange={(e) => setPreviousNoShowsCount(Math.min(previousAppointmentsCount, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Historical absences recorded
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Commute Travel Time (mins)
                  </label>
                  <input
                    type="number"
                    id="input-travel-time"
                    min="5"
                    max="180"
                    step="5"
                    value={estimatedTravelTimeMins}
                    onChange={(e) => setEstimatedTravelTimeMins(Math.max(5, parseInt(e.target.value) || 20))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Estimated one-way travel duration
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age Cohort (for fairness auditing only)
                  </label>
                  <select
                    id="select-age-cohort"
                    value={ageCohort}
                    onChange={(e) => setAgeCohort(e.target.value as AgeCohort)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                  >
                    <option value="18-35">18–35 (Young Adult)</option>
                    <option value="36-59">36–59 (Adult)</option>
                    <option value="60+">60+ (Older Adult)</option>
                  </select>
                </div>

                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      id="checkbox-reminder-consent"
                      checked={reminderConsent}
                      onChange={(e) => setReminderConsent(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                    />
                    <span>Patient consents to multi-channel digital appointment reminders (SMS / WhatsApp)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submission buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-appointment"
                disabled={loading}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Feasibility & Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Confirm Booking & Predict Risk</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

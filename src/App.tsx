import React, { useState, useEffect } from 'react';
import { Doctor, Appointment } from './types';
import { Navbar } from './components/Navbar';
import { BookDoctorView } from './components/BookDoctorView';
import { StaffDashboard } from './components/StaffDashboard';
import { PredictionSimulator } from './components/PredictionSimulator';
import { ModelPerformanceView } from './components/ModelPerformanceView';
import { FairnessAuditView } from './components/FairnessAuditView';
import { SetupGuideView } from './components/SetupGuideView';
import { ShieldCheck, Heart, Stethoscope } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('book');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Doctors and Appointments on initial load
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [docRes, aptRes] = await Promise.all([
        fetch('/api/doctors'),
        fetch('/api/appointments'),
      ]);

      const docJson = await docRes.json();
      const aptJson = await aptRes.json();

      if (docJson.success) setDoctors(docJson.data);
      if (aptJson.success) setAppointments(aptJson.data);
    } catch (err) {
      console.error('Failed to load initial hospital data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleAppointmentCreated = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  const handleUpdateReminderStatus = async (
    aptId: string,
    newStatus: string,
    notes?: string
  ) => {
    const res = await fetch(`/api/appointments/${aptId}/reminder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reminderStatus: newStatus, reminderNotes: notes }),
    });
    const json = await res.json();
    if (json.success) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === aptId ? json.data : a))
      );
    }
  };

  const handleUpdateAppointmentStatus = async (
    aptId: string,
    newStatus: string
  ) => {
    const res = await fetch(`/api/appointments/${aptId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    if (json.success) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === aptId ? json.data : a))
      );
    }
  };

  const highRiskCount = appointments.filter(
    (a) =>
      a.prediction?.riskLevel === 'High' &&
      a.reminderStatus !== 'Confirmed by Patient'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Navigation and Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        highRiskCount={highRiskCount}
      />

      {/* Main View Body */}
      <main className="flex-1">
        {loading && doctors.length === 0 ? (
          <div className="py-24 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Connecting to Hospital MERN Service...</span>
          </div>
        ) : (
          <>
            {activeTab === 'book' && (
              <BookDoctorView
                doctors={doctors}
                onAppointmentCreated={handleAppointmentCreated}
                onNavigateToDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'dashboard' && (
              <StaffDashboard
                appointments={appointments}
                doctors={doctors}
                onUpdateReminderStatus={handleUpdateReminderStatus}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                onRefresh={loadInitialData}
              />
            )}

            {activeTab === 'simulator' && <PredictionSimulator />}

            {activeTab === 'metrics' && <ModelPerformanceView />}

            {activeTab === 'fairness' && <FairnessAuditView />}

            {activeTab === 'guide' && <SetupGuideView />}
          </>
        )}
      </main>

      {/* Hospital System Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-700">
              MediCare Connect MERN Health Systems
            </span>
            <span>&bull; AI Appointment No-Show Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ethical AI Compliance: Verified</span>
            </span>
            <span>FastAPI & Scikit-Learn Microservice Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import {
  Calendar,
  LayoutDashboard,
  Cpu,
  BarChart3,
  Scale,
  BookOpen,
  ShieldCheck,
  Activity,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  highRiskCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  highRiskCount,
}) => {
  const tabs = [
    { id: 'book', label: 'Book Doctor', icon: Calendar },
    {
      id: 'dashboard',
      label: 'Staff Dashboard',
      icon: LayoutDashboard,
      badge: highRiskCount > 0 ? highRiskCount : undefined,
    },
    { id: 'simulator', label: 'Prediction Simulator', icon: Cpu },
    { id: 'metrics', label: 'Model & Calibration', icon: BarChart3 },
    { id: 'fairness', label: 'Fairness & Ethics', icon: Scale },
    { id: 'guide', label: 'Setup & API Guide', icon: BookOpen },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  MediCare Connect
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                  AI No-Show Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Hospital Appointment Booking & Calibrated Attendance Intelligence
              </p>
            </div>
          </div>

          {/* Ethical AI Compliance Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Non-Sensitive Factors Only &bull; Ethical AI Guardrails</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-white text-teal-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mandatory Ethical & Clinical Notice Banner */}
      <div className="bg-amber-50/90 border-t border-b border-amber-200/80 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
              Clinical Guardrail
            </span>
            <span>
              Predictions are statistical estimates designed solely for reminder prioritization and resource planning. They must <strong>never</strong> be used to deny care or penalize patients.
            </span>
          </div>
          <span className="text-[11px] text-amber-700 hidden md:inline">
            Zero caste/religion/gender features
          </span>
        </div>
      </div>
    </header>
  );
};

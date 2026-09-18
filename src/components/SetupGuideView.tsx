import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Copy,
  Check,
  Server,
  Database,
  Cpu,
  Play,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const SetupGuideView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const steps = [
    {
      id: 'step1',
      title: '1. Installing Dependencies (Python ML & Node.js MERN)',
      description:
        'Set up the Python virtual environment for Scikit-Learn/FastAPI and install Node.js dependencies.',
      code: `# Setup Python Virtual Environment and Install ML requirements
python3 -m venv venv
source venv/bin/activate   # On Windows use: venv\\Scripts\\activate
pip install -r ml_service/requirements.txt

# Install Node.js dependencies for MERN application
npm install`,
    },
    {
      id: 'step2',
      title: '2. Preparing the Dataset (Realistic Synthetic Data)',
      description:
        'Per Requirement 4, generate realistic synthetic outpatient records with ground truth probabilities and calibration labels.',
      code: `# Generate 3,500 synthetic outpatient appointment records
python3 ml_service/generate_dataset.py

# Output created at: ml_service/synthetic_appointment_dataset.csv
# Labeled: [SYNTHETIC DATASET - FOR DEVELOPMENT & BENCHMARKING ONLY]`,
    },
    {
      id: 'step3',
      title: '3. Training the ML Model & Generating Artifacts',
      description:
        'Train the Logistic Regression classifier with Scikit-learn, calculate metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Brier score), and export model_artifacts.json.',
      code: `# Run training and calibration pipeline
python3 ml_service/train_model.py

# Expected test benchmarks:
# Accuracy: ~81.4%, Precision: ~52.1%, Recall: ~28.6%, ROC-AUC: 0.877, Brier: 0.130`,
    },
    {
      id: 'step4',
      title: '4. Starting the Python FastAPI Microservice',
      description:
        'Launch the FastAPI server on port 8000 with interactive OpenAPI/Swagger docs.',
      code: `# Launch FastAPI Microservice
uvicorn ml_service.app:app --host 0.0.0.0 --port 8000 --reload

# Interactive Swagger Documentation available at:
# http://localhost:8000/docs`,
    },
    {
      id: 'step5',
      title: '5. Running the Full-Stack MERN Application',
      description:
        'Start the Express backend and React Vite frontend. The Express server connects to FastAPI or runs the calibrated model natively.',
      code: `# Run Full-Stack Express + React Vite dev server (binds to port 3000)
npm run dev

# Open application in browser:
# http://localhost:3000`,
    },
    {
      id: 'step6',
      title: '6. Testing the Prediction Feature (cURL & API)',
      description:
        'Validate prediction scoring, risk tier assignment, factor explanations, and reminder recommendations via cURL.',
      code: `# Test prediction endpoint with sample patient scenario
curl -X POST "http://localhost:3000/api/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
    "leadTimeDays": 18,
    "dayOfWeek": "Friday",
    "scheduledHour": 16,
    "appointmentType": "Routine Checkup",
    "previousAppointmentsCount": 4,
    "previousNoShowsCount": 2,
    "estimatedTravelTimeMins": 55,
    "hasReminderConsent": false
  }'`,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Developer & Deployment Operations Guide
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
            Architecture Specs
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Complete instructions for reproducing the Scikit-learn model training, running the FastAPI service, and linking with the MERN backend.
        </p>
      </div>

      {/* Architecture Overview Diagram Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Integrated Multi-Tier Architecture Workflow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">React 19 Frontend</span>
            <span className="text-slate-500 text-[11px] block">
              Patient booking, staff triage, simulator, fairness audit
            </span>
          </div>
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
            <span className="font-bold text-teal-900 block">Node & Express API</span>
            <span className="text-teal-700 text-[11px] block">
              RESTful routes, MongoDB persistence, proxy router
            </span>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
            <span className="font-bold text-indigo-900 block">FastAPI ML Service</span>
            <span className="text-indigo-700 text-[11px] block">
              Python microservice on port 8000 (/predict, /metrics)
            </span>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-900 block">Scikit-Learn Model</span>
            <span className="text-emerald-700 text-[11px] block">
              Calibrated Logistic Regression on non-sensitive features
            </span>
          </div>
        </div>
      </div>

      {/* Step by Step Instructions */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {step.description}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(step.code, step.id)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
              >
                {copiedSection === step.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Commands</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
              <pre>{step.code}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

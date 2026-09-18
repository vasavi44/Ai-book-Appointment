import React, { useState, useEffect } from 'react';
import { ModelEvaluationMetrics } from '../types';
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Target,
  Layers,
  HelpCircle,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

export const ModelPerformanceView: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelEvaluationMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/model/metrics');
        const json = await res.json();
        if (json.success) {
          setMetrics(json.data);
        } else {
          setError(json.error || 'Failed to load model metrics');
        }
      } catch (e: any) {
        setError(e.message || 'Error fetching metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading model evaluation metrics and calibration curves...</span>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <p className="text-slate-800 font-semibold">{error || 'Model metrics unavailable.'}</p>
        <p className="text-xs text-slate-500 mt-1">
          Ensure train_model.py has been executed to export model_artifacts.json.
        </p>
      </div>
    );
  }

  const { confusionMatrix } = metrics;
  const totalTest =
    confusionMatrix.trueNegative +
    confusionMatrix.falsePositive +
    confusionMatrix.falseNegative +
    confusionMatrix.truePositive;

  const specificity =
    confusionMatrix.trueNegative /
    (confusionMatrix.trueNegative + confusionMatrix.falsePositive);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Synthetic Dataset Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <FileSpreadsheet className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">
            Evaluation Benchmark Dataset: [SYNTHETIC CLINICAL DATASET - DEV V1]
          </span>
          <p className="text-amber-800 leading-relaxed">
            Per Requirement 4, this model was trained on 3,500 synthetic outpatient appointment encounters simulating empirical healthcare attendance patterns. Ground truth no-show outcomes were generated via established healthcare scheduling research distributions.
          </p>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Model Architecture & Calibration Evaluation</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
            {metrics.modelName}
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Evaluation benchmarks on held-out test sample ({metrics.testSamples} appointments, 80/20 stratified split).
        </p>
      </div>

      {/* Key Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Test Accuracy</span>
          <span className="text-2xl font-bold text-teal-700 mt-1 block">
            {(metrics.accuracy * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Overall classification</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Precision</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {(metrics.precision * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">True pos / predicted pos</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Recall (Sensitivity)</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {(metrics.recall * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">No-shows flagged</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">F1-Score</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {(metrics.f1Score * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Harmonic mean</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">ROC-AUC</span>
          <span className="text-2xl font-bold text-indigo-600 mt-1 block">
            {metrics.rocAuc.toFixed(3)}
          </span>
          <span className="text-[11px] text-indigo-500 mt-0.5 block">High discrimination</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Brier Score</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {metrics.brierScore.toFixed(4)}
          </span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Near-zero error</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Confusion Matrix Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Confusion Matrix & Operating Point
              </h2>
              <p className="text-[11px] text-slate-500">
                Decision threshold calibrated at 0.35 probability for clinical reminder sensitivity
              </p>
            </div>
            <span className="text-xs text-slate-500">n = {totalTest}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            {/* True Negative */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] uppercase font-bold text-emerald-700 block">
                True Negative (Attended)
              </span>
              <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">
                {confusionMatrix.trueNegative}
              </span>
              <span className="text-[10px] text-emerald-600">
                Correctly predicted to attend
              </span>
            </div>

            {/* False Positive */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] uppercase font-bold text-slate-600 block">
                False Positive (Attended)
              </span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
                {confusionMatrix.falsePositive}
              </span>
              <span className="text-[10px] text-slate-500">
                Flagged for reminder, attended
              </span>
            </div>

            {/* False Negative */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] uppercase font-bold text-slate-600 block">
                False Negative (Missed)
              </span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
                {confusionMatrix.falseNegative}
              </span>
              <span className="text-[10px] text-slate-500">
                Missed without high-risk flag
              </span>
            </div>

            {/* True Positive */}
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200">
              <span className="text-[11px] uppercase font-bold text-teal-700 block">
                True Positive (No-Show)
              </span>
              <span className="text-2xl font-extrabold text-teal-900 mt-1 block">
                {confusionMatrix.truePositive}
              </span>
              <span className="text-[10px] text-teal-600">
                Correctly flagged no-shows
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span>
              Specificity (True Neg Rate):{' '}
              <strong>{(specificity * 100).toFixed(1)}%</strong>
            </span>
            <span>
              Sensitivity (Recall):{' '}
              <strong>{(metrics.recall * 100).toFixed(1)}%</strong>
            </span>
          </div>
        </div>

        {/* 2. Probability Calibration Curve */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Calibration Reliability Curve
              </h2>
              <p className="text-[11px] text-slate-500">
                Comparing predicted risk score vs. actual observed empirical no-show frequency
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Brier: {metrics.brierScore.toFixed(3)}
            </span>
          </div>

          {/* Deciles Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2">Risk Interval</th>
                  <th className="py-2">Mean Pred. Prob</th>
                  <th className="py-2">Empirical Observed</th>
                  <th className="py-2">Cohort Size</th>
                  <th className="py-2 text-right">Calibration Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.calibrationBins.map((bin, i) => {
                  const errorDelta = Math.abs(
                    bin.meanPredictedProb - bin.observedNoShowRate
                  );
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-1.5 font-semibold text-slate-800">
                        {bin.bin}
                      </td>
                      <td className="py-1.5 text-slate-600">
                        {(bin.meanPredictedProb * 100).toFixed(1)}%
                      </td>
                      <td className="py-1.5 font-bold text-teal-700">
                        {(bin.observedNoShowRate * 100).toFixed(1)}%
                      </td>
                      <td className="py-1.5 text-slate-500">{bin.sampleCount}</td>
                      <td className="py-1.5 text-right font-mono text-[11px] text-emerald-700">
                        {bin.sampleCount > 0 ? `±${(errorDelta * 100).toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            * Well-calibrated probabilities ensure a predicted 40% risk corresponds faithfully to approximately 4 out of 10 real-world patients failing to attend.
          </p>
        </div>
      </div>

      {/* Feature Odds Ratios / Coefficients Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Logistic Regression Feature Weights & Odds Ratios
            </h2>
            <p className="text-[11px] text-slate-500">
              Learned model coefficients indicate directional impact on patient attendance
            </p>
          </div>
          <span className="text-xs text-teal-700 font-medium">
            Zero demographic attributes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Feature Name</th>
                <th className="py-2.5">Clinical Meaning</th>
                <th className="py-2.5">Coefficient (&beta;)</th>
                <th className="py-2.5">Odds Ratio (e^&beta;)</th>
                <th className="py-2.5 text-right">Directional Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.featureWeights.map((fw, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2 font-semibold text-slate-900 font-mono text-[11px]">
                    {fw.feature}
                  </td>
                  <td className="py-2 text-slate-600 max-w-sm">
                    {fw.description}
                  </td>
                  <td className="py-2 font-mono text-slate-800">
                    {fw.coefficient > 0 ? `+${fw.coefficient}` : fw.coefficient}
                  </td>
                  <td className="py-2 font-mono font-bold text-slate-900">
                    {fw.oddsRatio}x
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        fw.impactDirection === 'increases_risk'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {fw.impactDirection === 'increases_risk'
                        ? 'Elevates Risk'
                        : 'Protective'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

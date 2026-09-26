import React, { useState, useMemo } from 'react';
import {
  Sliders,
  CheckCircle2,
  HelpCircle,
  Database,
  TrendingDown,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { runHistoricalCalibration } from '../simulation/historicalCalibration/calibrationEngine';
import {
  getActiveModelMode,
  setActiveModelMode,
} from '../simulation/historicalCalibration/parameterRegistry';
import type { ModelMode } from '../simulation/historicalCalibration/types';

export const HistoricalCalibrationPage: React.FC = () => {
  const [modelMode, setModelMode] = useState<ModelMode>(getActiveModelMode());

  const calibrationReport = useMemo(() => {
    return runHistoricalCalibration();
  }, []);

  const handleModeChange = (newMode: ModelMode) => {
    setActiveModelMode(newMode);
    setModelMode(newMode);
  };

  const { summary, parameters, sensitivityResults, observations } = calibrationReport;

  const validObsCount = observations.filter((o) => o.observedValue !== null).length;
  const excludedObsCount = observations.length - validObsCount;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                  STEP 5.2 — HISTORICAL CALIBRATION & PARAMETER TUNING
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Baghewala Heavy-Oil Field Data Calibration Engine (SPE 100642 & Appraisal Records)
                </p>
              </div>
            </div>
          </div>

          {/* Model Mode Toggle */}
          <div className="flex items-center gap-3 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <span className="text-xs font-mono text-slate-400 pl-2">ACTIVE MODEL:</span>
            <button
              onClick={() => handleModeChange('BASELINE')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                modelMode === 'BASELINE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BASELINE (Uncalibrated)
            </button>
            <button
              onClick={() => handleModeChange('CALIBRATED')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                modelMode === 'CALIBRATED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CALIBRATED (Data-Fitted)
            </button>
          </div>
        </div>

        {/* Disclaimer Card */}
        <div className="mt-4 p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg flex items-start gap-3 text-xs text-indigo-300 font-mono">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>{summary.disclaimer}</p>
        </div>
      </div>

      {/* Section A: Dataset & Calibration Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>HISTORICAL OBSERVATIONS</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            {validObsCount} <span className="text-xs text-slate-500 font-normal">/ {observations.length}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {excludedObsCount} unmeasured (Insufficient Data)
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>BASELINE ERROR (MAE)</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {summary.baselineMetrics.mae}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            RMSE: {summary.baselineMetrics.rmse} | MAPE: {summary.baselineMetrics.mape}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>CALIBRATED ERROR (MAE)</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {summary.calibratedMetrics.mae}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            RMSE: {summary.calibratedMetrics.rmse} | MAPE: {summary.calibratedMetrics.mape}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>OVERALL ERROR REDUCTION</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300 mt-2">
            -{summary.overallImprovementPercent.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {summary.calibratedParametersCount} parameter calibrated
          </p>
        </div>
      </div>

      {/* Section B & C: Calibratable Parameters Registry */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Baghewala Candidate Parameter Calibration Registry
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="p-3">PARAMETER</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3 text-right">BASELINE</th>
                <th className="p-3 text-right">CALIBRATED</th>
                <th className="p-3 text-center">STATUS</th>
                <th className="p-3 text-center">PROVENANCE</th>
                <th className="p-3">DESCRIPTION / REASON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {parameters.map((param) => {
                const isCalibrated = param.calibrationStatus === 'CALIBRATED';
                const isInsufficient =
                  param.calibrationStatus === 'NOT_CALIBRATABLE' ||
                  param.calibrationStatus === 'INSUFFICIENT_DATA';

                return (
                  <tr key={param.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-semibold text-slate-100">{param.name}</td>
                    <td className="p-3 uppercase text-[10px] text-slate-400">{param.category}</td>
                    <td className="p-3 text-right text-slate-400 font-mono">
                      {param.previousValue} {param.unit}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {param.value} {param.unit}
                    </td>
                    <td className="p-3 text-center">
                      {isCalibrated ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          CALIBRATED
                        </span>
                      ) : isInsufficient ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          INSUFFICIENT DATA
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          DOCUMENTED
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          param.sourceType === 'calibrated'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : param.sourceType === 'documented'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {param.sourceType}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px] max-w-xs truncate">
                      {param.calibratableReason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section D: Sensitivity Analysis Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Parameter Sensitivity Analysis (-20% to +20% Perturbations)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sensitivityResults.map((sens) => (
            <div key={sens.parameterId} className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-200">
                  {sens.parameterName}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    sens.isSensitive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {sens.isSensitive ? 'SENSITIVE' : 'INSENSITIVE / UNMEASURED'}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1 text-center font-mono text-[11px] mt-3">
                {sens.steps.map((step) => (
                  <div
                    key={step.perturbationPercent}
                    className={`p-2 rounded border ${
                      step.perturbationPercent === 0
                        ? 'bg-slate-900 border-slate-700 text-slate-300'
                        : step.improvementPercent > 0
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-900/50 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">
                      {step.perturbationPercent > 0 ? `+${step.perturbationPercent}%` : `${step.perturbationPercent}%`}
                    </div>
                    <div className="font-semibold mt-0.5">{step.parameterValue}</div>
                    <div className="text-[9px] text-slate-500 mt-1">MAE: {step.mae}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section E: Before vs After Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Historical Observations vs Baseline & Calibrated Model Predictions
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="p-3">YEAR / PERIOD</th>
                <th className="p-3">PARAMETER</th>
                <th className="p-3 text-right">HISTORICAL OBSERVED</th>
                <th className="p-3 text-right">BASELINE PRED</th>
                <th className="p-3 text-right">CALIBRATED PRED</th>
                <th className="p-3 text-right">BASELINE ERR</th>
                <th className="p-3 text-right">CALIBRATED ERR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {observations.map((obs) => {
                const hasObs = obs.observedValue !== null;

                return (
                  <tr key={obs.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-slate-400">{obs.dateOrYear}</td>
                    <td className="p-3 font-semibold text-slate-100">{obs.parameter}</td>
                    <td className="p-3 text-right font-bold text-cyan-300 font-mono">
                      {hasObs ? `${obs.observedValue} ${obs.unit}` : 'N/A (Unmeasured)'}
                    </td>
                    <td className="p-3 text-right text-slate-400 font-mono">
                      {obs.baselinePredictedValue !== null
                        ? `${obs.baselinePredictedValue} ${obs.unit}`
                        : '—'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {obs.calibratedPredictedValue !== null
                        ? `${obs.calibratedPredictedValue} ${obs.unit}`
                        : '—'}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-400">
                      {obs.baselineAbsoluteError !== null ? `±${obs.baselineAbsoluteError}` : '—'}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400 font-bold">
                      {obs.calibratedAbsoluteError !== null ? `±${obs.calibratedAbsoluteError}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

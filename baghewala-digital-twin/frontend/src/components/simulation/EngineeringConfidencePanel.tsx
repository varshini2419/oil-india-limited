import React, { useState, useMemo } from 'react';
import { Panel } from '../ui/Panel';
import { useScenarioStore } from '../../simulation/scenario';
import { runHistoricalValidation, evaluateEngineeringConfidence } from '../../simulation/historicalValidation';
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

export const EngineeringConfidencePanel: React.FC = () => {
  const { activeScenario } = useScenarioStore();
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const committedInputs = activeScenario.inputs;

  const valResult = useMemo(() => {
    if (!hasExecuted) {
      return null;
    }
    return runHistoricalValidation(committedInputs);
  }, [hasExecuted, committedInputs]);

  const confidence = useMemo(() => {
    if (!hasExecuted || !valResult) {
      return null;
    }
    const t0 = performance.now();
    const res = evaluateEngineeringConfidence(
      valResult.topMatch,
      valResult.mape,
      committedInputs,
      valResult.validationStatus
    );
    console.log(`[SIM-PERF] Phase 5 Engineering confidence evaluated in ${(performance.now() - t0).toFixed(2)} ms`);
    return res;
  }, [hasExecuted, valResult, committedInputs]);

  if (!hasExecuted || !valResult || !confidence) {
    return (
      <Panel className="bg-sky-50/40 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/40" title="Engineering Confidence & Advisory Classification">
        <div className="p-6 bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-800/60 rounded-2xl shadow-sm space-y-6 font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-sky-100 dark:border-sky-800/60 pb-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-500" />
                Engineering Confidence Classification
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Evaluates historical calibration quality, parameter operating envelope compliance, and confidence supporting factors.
              </p>
            </div>

            <button
              onClick={() => setHasExecuted(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex-shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>EVALUATE CONFIDENCE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400 text-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">1. Historical Calibration Index</span>
              Scores model confidence (HIGH / MODERATE / LOW) against matched historical field records.
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">2. Operating Envelope Compliance</span>
              Flags whether reservoir temperature, steam rate, and VFD settings remain inside calibrated boundaries.
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-sky-500" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            ENGINEERING CONFIDENCE & ADVISORY CLASSIFICATION
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono">
          <span
            className={`px-4 py-2 rounded-lg font-bold text-xs shadow-sm ${
              confidence.level === 'HIGH'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80'
                : confidence.level === 'MODERATE'
                ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80'
                : 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80'
            }`}
          >
            CONFIDENCE: {confidence.level} ({confidence.score}/100)
          </span>
          <span
            className={`px-4 py-2 rounded-lg font-bold text-xs shadow-sm ${
              confidence.isWithinOperatingEnvelope
                ? 'bg-slate-100 text-emerald-600 border border-slate-200 dark:bg-slate-900 dark:text-emerald-400 dark:border-slate-800'
                : 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80'
            }`}
          >
            {confidence.isWithinOperatingEnvelope ? 'INSIDE HISTORICAL ENVELOPE' : 'OUTSIDE ENVELOPE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Engineering Factors */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>CONFIDENCE SUPPORTING FACTORS</span>
          </h3>
          {confidence.positiveReasons.length > 0 ? (
            <ul className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
              {confidence.positiveReasons.map((reason, idx) => (
                <li key={`pos-${idx}`} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 italic text-sm">No strong supporting historical factors identified.</p>
          )}
        </div>

        {/* Warning & Risk Factors */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>ENGINEERING UNCERTAINTY & RISK FACTORS</span>
          </h3>
          {confidence.warningReasons.length > 0 ? (
            <ul className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
              {confidence.warningReasons.map((reason, idx) => (
                <li key={`warn-${idx}`} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">⚠</span>
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 italic text-sm">Operating within calibrated historical parameters.</p>
          )}
        </div>
      </div>
    </Panel>
  );
};

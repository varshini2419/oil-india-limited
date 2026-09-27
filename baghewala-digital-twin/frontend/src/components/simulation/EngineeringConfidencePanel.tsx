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
      <Panel title="Phase 5 — Engineering Confidence & Advisory Classification">
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Engineering Confidence Classification (On-Demand Analysis)
              </h3>
              <p className="text-slate-400 text-[11px]">
                Evaluates historical calibration quality, parameter operating envelope compliance, and confidence supporting factors.
              </p>
            </div>

            <button
              onClick={() => setHasExecuted(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg cursor-pointer flex-shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>EVALUATE CONFIDENCE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400 text-[11px]">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-200 block mb-1">1. Historical Calibration Index</span>
              Scores model confidence (HIGH / MODERATE / LOW) against matched historical field records.
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-200 block mb-1">2. Operating Envelope Compliance</span>
              Flags whether reservoir temperature, steam rate, and VFD settings remain inside calibrated boundaries.
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="space-y-4 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-slate-100">
            ENGINEERING CONFIDENCE & ADVISORY CLASSIFICATION
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded font-bold text-xs ${
              confidence.level === 'HIGH'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : confidence.level === 'MODERATE'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-red-950 text-red-300 border border-red-800'
            }`}
          >
            CONFIDENCE: {confidence.level} ({confidence.score}/100)
          </span>
          <span
            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
              confidence.isWithinOperatingEnvelope
                ? 'bg-slate-900 text-emerald-400 border border-slate-700'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}
          >
            {confidence.isWithinOperatingEnvelope ? 'INSIDE HISTORICAL ENVELOPE' : 'OUTSIDE ENVELOPE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positive Engineering Factors */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <h3 className="font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>CONFIDENCE SUPPORTING FACTORS</span>
          </h3>
          {confidence.positiveReasons.length > 0 ? (
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {confidence.positiveReasons.map((reason, idx) => (
                <li key={`pos-${idx}`} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic text-[11px]">No strong supporting historical factors identified.</p>
          )}
        </div>

        {/* Warning & Risk Factors */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <h3 className="font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>ENGINEERING UNCERTAINTY & RISK FACTORS</span>
          </h3>
          {confidence.warningReasons.length > 0 ? (
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {confidence.warningReasons.map((reason, idx) => (
                <li key={`warn-${idx}`} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">⚠</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 italic text-[11px]">Operating within calibrated historical parameters.</p>
          )}
        </div>
      </div>
    </Panel>
  );
};

import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Sliders, ArrowRight } from 'lucide-react';

export const SPMCandidatePanel: React.FC = () => {
  const { srpOptimizationResult, committedSimulationResult, updateInput } = useScenarioStore();
  const { currentCandidate, optimalCandidate, candidates, isOptimized, productionDeltaBopd, productionDeltaPercent } = srpOptimizationResult;

  const inputs = committedSimulationResult.inputs;

  // Filter top representative candidates across operating grid (including current, optimal, caution & rejected)
  const sortedCandidates = [...candidates].sort((a, b) => b.efficiencyIndex - a.efficiencyIndex);
  
  // Select top 8 candidates to show in table
  const displayCandidates = sortedCandidates.slice(0, 8);

  // Check if current is already in list, if not add
  const hasCurrent = displayCandidates.some(
    (c) => c.vfdFrequencyHz === inputs.vfdFrequencyHz && c.spm === inputs.spm && c.strokeLengthM === inputs.strokeLengthMeters
  );
  if (!hasCurrent) {
    displayCandidates.unshift(currentCandidate);
  }

  const applyRecommended = () => {
    updateInput('spm', optimalCandidate.spm);
    updateInput('strokeLengthMeters', optimalCandidate.strokeLengthM);
    updateInput('vfdFrequencyHz', optimalCandidate.vfdFrequencyHz);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 font-mono shadow-sm space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300 text-xs">
          <Sliders className="w-4 h-4 text-sky-500" />
          <span>SPM OPTIMIZATION CANDIDATES & PARETO SCREENING</span>
        </div>

        {isOptimized && (
          <button
            onClick={applyRecommended}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>APPLY RECOMMENDED ({optimalCandidate.spm} SPM, {optimalCandidate.vfdFrequencyHz} Hz)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Recommended Banner */}
      {isOptimized ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              PARETO OPTIMAL CANDIDATE FOUND: {optimalCandidate.spm} SPM @ {optimalCandidate.vfdFrequencyHz} Hz ({optimalCandidate.strokeLengthM}m stroke)
            </span>
          </div>
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            Gain: +{productionDeltaBopd} BOPD (+{productionDeltaPercent}%) | Load Index: {optimalCandidate.loadIndex}/100
          </div>
        </div>
      ) : (
        <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl p-3 text-xs text-sky-800 dark:text-sky-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sky-500" />
          <span>CURRENT OPERATING POINT IS ALREADY PARETO OPTIMAL ({inputs.spm} SPM @ {inputs.vfdFrequencyHz} Hz).</span>
        </div>
      )}

      {/* Candidate Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3">CANDIDATE ROLE</th>
              <th className="py-2.5 px-3">SPM</th>
              <th className="py-2.5 px-3">STROKE (m)</th>
              <th className="py-2.5 px-3">VFD (Hz)</th>
              <th className="py-2.5 px-3">PREDICTED BOPD</th>
              <th className="py-2.5 px-3">LOAD INDEX</th>
              <th className="py-2.5 px-3">EFFICIENCY</th>
              <th className="py-2.5 px-3">SAFETY STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-950">
            {displayCandidates.map((c, idx) => {
              const isCurrent =
                c.vfdFrequencyHz === inputs.vfdFrequencyHz &&
                c.spm === inputs.spm &&
                c.strokeLengthM === inputs.strokeLengthMeters;

              const isOptimal =
                c.vfdFrequencyHz === optimalCandidate.vfdFrequencyHz &&
                c.spm === optimalCandidate.spm &&
                c.strokeLengthM === optimalCandidate.strokeLengthM;

              const isRejected = !c.isValid || c.loadIndex > 85.0;

              return (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                    isCurrent ? 'bg-sky-50/60 dark:bg-sky-950/30 font-bold' : isOptimal ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-[10px] font-bold mr-1">
                        CURRENT
                      </span>
                    )}
                    {isOptimal && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                        RECOMMENDED
                      </span>
                    )}
                    {!isCurrent && !isOptimal && isRejected && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] font-bold">
                        REJECTED
                      </span>
                    )}
                    {!isCurrent && !isOptimal && !isRejected && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                        CANDIDATE #{idx + 1}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-sky-600 dark:text-sky-400">{c.spm.toFixed(1)}</td>
                  <td className="py-2.5 px-3">{c.strokeLengthM.toFixed(1)}</td>
                  <td className="py-2.5 px-3">{c.vfdFrequencyHz.toFixed(0)}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">{c.estimatedProductionBopd.toFixed(1)} BOPD</td>
                  <td className="py-2.5 px-3 font-bold">{c.loadIndex.toFixed(0)} / 100</td>
                  <td className="py-2.5 px-3">{c.efficiencyIndex.toFixed(3)}</td>
                  <td className="py-2.5 px-3">
                    {c.status === 'NORMAL' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10.5px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> NORMAL
                      </span>
                    ) : c.status === 'CAUTION' ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[10.5px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> CAUTION
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-[10.5px]">
                        <XCircle className="w-3.5 h-3.5" /> HIGH LOAD (REJECTED)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Panel } from '../ui/Panel';
import { useScenarioStore } from '../../simulation/scenario';
import { runCommittedScenarioUncertaintyAnalysis } from '../../simulation/uncertaintyAnalysis';
import { Activity, Info, BarChart2 } from 'lucide-react';

export const UncertaintyAnalysisPanel: React.FC = () => {
  const { activeScenario } = useScenarioStore();
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const committedInputs = activeScenario.inputs;

  const uncertaintyResult = useMemo(() => {
    if (!hasExecuted) {
      return null;
    }
    const t0 = performance.now();
    const result = runCommittedScenarioUncertaintyAnalysis(committedInputs);
    console.log(`[SIM-PERF] Phase 5 Uncertainty analysis sweep executed in ${(performance.now() - t0).toFixed(2)} ms`);
    return result;
  }, [hasExecuted, committedInputs]);

  if (!hasExecuted || !uncertaintyResult) {
    return (
      <Panel className="bg-sky-50/40 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/40" title="Uncertainty & Sensitivity Analysis">
        <div className="p-6 bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-800/60 rounded-2xl shadow-sm space-y-6 font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-sky-100 dark:border-sky-800/60 pb-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-500" />
                Uncertainty & Sensitivity Sweep
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Executes parameter perturbation sweeps across all 14 boundary inputs to calculate P10, P50, P90 confidence bounds and dynamic sensitivity rankings.
              </p>
            </div>

            <button
              onClick={() => setHasExecuted(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex-shrink-0"
            >
              <Activity className="w-4 h-4" />
              <span>RUN SENSITIVITY SWEEP</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 dark:text-slate-400 text-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">1. Sensitivity Perturbations</span>
              Perturbs reservoir temperature, steam rate, SPM, and pressure by ±10% to measure output elasticity.
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">2. P10 / P50 / P90 Bounds</span>
              Establishes statistical production confidence intervals based on underlying physics models.
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">3. Dynamic Parameter Ranking</span>
              Ranks key operational drivers by percentage contribution to production rate variance.
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
          <Activity className="w-6 h-6 text-sky-500" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            UNCERTAINTY & SENSITIVITY ANALYSIS
          </h2>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold text-xs shadow-sm font-mono tracking-wide">
          BOUNDS: {uncertaintyResult.boundsTypeLabel.toUpperCase()}
        </span>
      </div>

      {/* Range Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Baseline Output</span>
          <div className="text-lg font-bold text-slate-700 dark:text-slate-200">
            {uncertaintyResult.baselineProductionBopd.toFixed(2)} <span className="text-sm">BOPD</span>
          </div>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">P10 Bound</span>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {uncertaintyResult.p10.toFixed(2)} <span className="text-sm">BOPD</span>
          </div>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">P50 Bound</span>
          <div className="text-lg font-bold text-sky-600 dark:text-sky-400">
            {uncertaintyResult.p50.toFixed(2)} <span className="text-sm">BOPD</span>
          </div>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">P90 Bound</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {uncertaintyResult.p90.toFixed(2)} <span className="text-sm">BOPD</span>
          </div>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Production Range</span>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {uncertaintyResult.productionRangeBopd.toFixed(2)} <span className="text-sm">BOPD</span>
          </div>
        </div>
      </div>

      {/* Dynamic Sensitivity Ranking Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-sky-500" />
            <span>DYNAMIC PARAMETER SENSITIVITY RANKING (±10% PERTURBATION)</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">Live Physics Solvers</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Parameter Name</th>
                <th className="p-4">Low (-10%)</th>
                <th className="p-4">Baseline</th>
                <th className="p-4">High (+10%)</th>
                <th className="p-4">Δ Production</th>
                <th className="p-4">Sensitivity Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {uncertaintyResult.sensitivityRanking.map((entry) => {
                const contrib = uncertaintyResult.parameterContributions.find(
                  (c) => c.parameterName === entry.parameterName
                );
                return (
                  <tr key={entry.parameterId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-sky-600 dark:text-sky-400">#{entry.rank}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{entry.parameterName}</td>
                    <td className="p-4 font-mono text-xs">
                      {entry.lowValue} {entry.unit} <span className="text-slate-400">({entry.lowProductionBopd.toFixed(2)} BOPD)</span>
                    </td>
                    <td className="p-4 font-bold font-mono text-xs text-slate-900 dark:text-white">
                      {entry.baselineValue} {entry.unit}
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {entry.highValue} {entry.unit} <span className="text-slate-400">({entry.highProductionBopd.toFixed(2)} BOPD)</span>
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                      ±{entry.productionDeltaBopd.toFixed(2)} BOPD
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-500 h-full rounded-full"
                            style={{ width: `${contrib?.contributionPercent ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-8">
                          {contrib?.contributionPercent ?? 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 italic flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">{uncertaintyResult.disclaimer}</span>
      </div>
    </Panel>
  );
};

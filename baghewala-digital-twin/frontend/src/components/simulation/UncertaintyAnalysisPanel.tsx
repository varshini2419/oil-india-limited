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
      <Panel title="Phase 5 — Uncertainty & Sensitivity Analysis">
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                Uncertainty & Sensitivity Sweep (On-Demand Sweep)
              </h3>
              <p className="text-slate-400 text-[11px]">
                Executes parameter perturbation sweeps across all 14 boundary inputs to calculate P10, P50, P90 confidence bounds and dynamic sensitivity rankings.
              </p>
            </div>

            <button
              onClick={() => setHasExecuted(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg cursor-pointer flex-shrink-0"
            >
              <Activity className="w-4 h-4" />
              <span>RUN SENSITIVITY SWEEP</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-400 text-[11px]">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-200 block mb-1">1. Sensitivity Perturbations</span>
              Perturbs reservoir temperature, steam rate, SPM, and pressure by ±10% to measure output elasticity.
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-200 block mb-1">2. P10 / P50 / P90 Bounds</span>
              Establishes statistical production confidence intervals based on underlying physics models.
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-200 block mb-1">3. Dynamic Parameter Ranking</span>
              Ranks key operational drivers by percentage contribution to production rate variance.
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
          <Activity className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-slate-100">
            UNCERTAINTY & SENSITIVITY ANALYSIS
          </h2>
        </div>

        <span className="px-2.5 py-1 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold text-[10px]">
          BOUNDS: {uncertaintyResult.boundsTypeLabel.toUpperCase()}
        </span>
      </div>

      {/* Range Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
        <div>
          <span className="text-slate-400 text-[10px]">Baseline Output:</span>
          <div className="text-sm font-bold text-slate-200">
            {uncertaintyResult.baselineProductionBopd.toFixed(2)} BOPD
          </div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px]">P10 Sensitivity Bound:</span>
          <div className="text-sm font-bold text-amber-300">
            {uncertaintyResult.p10.toFixed(2)} BOPD
          </div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px]">P50 Sensitivity Bound:</span>
          <div className="text-sm font-bold text-sky-300">
            {uncertaintyResult.p50.toFixed(2)} BOPD
          </div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px]">P90 Sensitivity Bound:</span>
          <div className="text-sm font-bold text-emerald-400">
            {uncertaintyResult.p90.toFixed(2)} BOPD
          </div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px]">Production Range:</span>
          <div className="text-sm font-bold text-sky-400">
            {uncertaintyResult.productionRangeBopd.toFixed(2)} BOPD
          </div>
        </div>
      </div>

      {/* Dynamic Sensitivity Ranking Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-sky-400" />
            <span>DYNAMIC PARAMETER SENSITIVITY RANKING (±10% PERTURBATION)</span>
          </h3>
          <span className="text-[10px] text-slate-400">Calculated from Live Physics Solvers</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-2.5">Rank</th>
                <th className="p-2.5">Parameter Name</th>
                <th className="p-2.5">Low (-10%)</th>
                <th className="p-2.5">Baseline</th>
                <th className="p-2.5">High (+10%)</th>
                <th className="p-2.5">Δ Production BOPD</th>
                <th className="p-2.5">Sensitivity Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {uncertaintyResult.sensitivityRanking.map((entry) => {
                const contrib = uncertaintyResult.parameterContributions.find(
                  (c) => c.parameterName === entry.parameterName
                );
                return (
                  <tr key={entry.parameterId} className="hover:bg-slate-900/60">
                    <td className="p-2.5 font-bold text-sky-400">#{entry.rank}</td>
                    <td className="p-2.5 font-bold text-slate-200">{entry.parameterName}</td>
                    <td className="p-2.5">
                      {entry.lowValue} {entry.unit} ({entry.lowProductionBopd.toFixed(2)} BOPD)
                    </td>
                    <td className="p-2.5 font-bold">
                      {entry.baselineValue} {entry.unit}
                    </td>
                    <td className="p-2.5">
                      {entry.highValue} {entry.unit} ({entry.highProductionBopd.toFixed(2)} BOPD)
                    </td>
                    <td className="p-2.5 font-bold text-emerald-400">
                      ±{entry.productionDeltaBopd.toFixed(2)} BOPD
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-400 h-full rounded-full"
                            style={{ width: `${contrib?.contributionPercent ?? 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-300">
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

      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[10px] text-slate-400 italic flex items-start gap-2">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
        <span>{uncertaintyResult.disclaimer}</span>
      </div>
    </Panel>
  );
};

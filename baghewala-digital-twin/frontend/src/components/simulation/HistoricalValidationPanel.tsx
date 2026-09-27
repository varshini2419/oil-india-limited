import React, { useState, useMemo } from 'react';
import { Panel } from '../ui/Panel';
import { useScenarioStore } from '../../simulation/scenario';
import { runHistoricalValidation } from '../../simulation/historicalValidation';
import { Database, AlertTriangle, FileSpreadsheet, ShieldAlert } from 'lucide-react';

export const HistoricalValidationPanel: React.FC = () => {
  const { activeScenario, isStale } = useScenarioStore();
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const committedInputs = activeScenario.inputs;

  const validationResult = useMemo(() => {
    if (!hasExecuted) {
      return null;
    }
    const t0 = performance.now();
    const result = runHistoricalValidation(committedInputs);
    console.log(`[SIM-PERF] Phase 5 Historical validation executed in ${(performance.now() - t0).toFixed(2)} ms`);
    return result;
  }, [hasExecuted, committedInputs]);

  if (!hasExecuted || !validationResult) {
    return (
      <Panel title="Phase 5 — Historical Validation Engine">
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" />
                Historical Validation Engine (On-Demand Data Matching)
              </h3>
              <p className="text-slate-400 text-[11px]">
                Compares current committed simulation parameters against historical Baghewala production data, calculating MAE, MAPE, RMSE, and bias.
              </p>
            </div>

            <button
              onClick={() => setHasExecuted(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg cursor-pointer flex-shrink-0"
            >
              <Database className="w-4 h-4" />
              <span>RUN HISTORICAL MATCHING</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-400 text-[11px]">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-200 block mb-1">1. Distance Metric Matching</span>
              Finds nearest historical well tests using normalized Euclidean distance over thermal & rate inputs.
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-200 block mb-1">2. Error Metrics</span>
              Calculates MAE, MAPE, RMSE, and bias against observed Jodhpur Sandstone production datasets.
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-200 block mb-1">3. Data Provenance</span>
              Labels dataset source (synthetic vs calibrated field tests) with full auditing trace.
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
          <Database className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-slate-100">
            HISTORICAL VALIDATION ENGINE
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
              validationResult.validationStatus === 'VALIDATED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : validationResult.validationStatus === 'LIMITED_DATA'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-red-950 text-red-300 border border-red-800'
            }`}
          >
            STATUS: {validationResult.validationStatus}
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
            {validationResult.dataProvenanceLabel}
          </span>
        </div>
      </div>

      {isStale && (
        <div className="bg-amber-950/40 border border-amber-800/80 p-2.5 rounded-lg flex items-center gap-2 text-amber-300 text-[11px]">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Slider parameters edited. Click <strong className="text-sky-300">RUN SIMULATION</strong> to update committed historical validation metrics.
          </span>
        </div>
      )}

      {/* Current Scenario Comparison Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
        <div>
          <span className="text-slate-400 text-[10px]">Simulated Production:</span>
          <div className="text-sm font-bold text-emerald-400">
            {validationResult.predictedProductionBopd.toFixed(2)} BOPD
          </div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px]">Historical Comparable:</span>
          <div className="text-sm font-bold text-sky-300">
            {validationResult.observedProductionBopd.toFixed(2)} BOPD
          </div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px]">Absolute Error / %:</span>
          <div className="text-sm font-bold text-amber-300">
            {validationResult.absoluteErrorBopd.toFixed(2)} BOPD ({validationResult.absolutePercentageError.toFixed(1)}%)
          </div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px]">Dataset MAE / MAPE:</span>
          <div className="text-sm font-bold text-slate-200">
            {validationResult.mae.toFixed(2)} BOPD / {validationResult.mape.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Historical Matches Table */}
      <div className="space-y-2">
        <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-sky-400" />
          <span>TOP HISTORICAL OPERATING MATCHES</span>
        </h3>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-2.5">Record ID</th>
                <th className="p-2.5">Date / Well</th>
                <th className="p-2.5">Observed BOPD</th>
                <th className="p-2.5">Simulated BOPD</th>
                <th className="p-2.5">Error</th>
                <th className="p-2.5">Match %</th>
                <th className="p-2.5">Data Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {validationResult.matchedRecords.map((m, idx) => {
                const err = Math.abs(validationResult.predictedProductionBopd - m.record.observedProductionBopd);
                return (
                  <tr key={m.record.id} className={idx === 0 ? 'bg-sky-950/40 font-bold' : ''}>
                    <td className="p-2.5 text-sky-300">{m.record.id}</td>
                    <td className="p-2.5">{m.record.date} ({m.record.wellId})</td>
                    <td className="p-2.5 text-emerald-400">{m.record.observedProductionBopd.toFixed(2)} BOPD</td>
                    <td className="p-2.5">{validationResult.predictedProductionBopd.toFixed(2)} BOPD</td>
                    <td className="p-2.5 text-amber-300">{err.toFixed(2)} BOPD</td>
                    <td className="p-2.5 font-bold text-sky-400">{m.matchQualityPercent}%</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-400">
                        {m.record.source}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[10px] text-slate-400 italic flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>{validationResult.disclaimer}</span>
      </div>
    </Panel>
  );
};

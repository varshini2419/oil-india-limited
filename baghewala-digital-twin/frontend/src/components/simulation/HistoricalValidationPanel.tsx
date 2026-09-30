import React, { useState, useMemo } from 'react';
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
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Historical Validation Engine</h3>
        </div>
        <div className="p-6 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-sm space-y-6 font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-sky-100 dark:border-sky-800/60 pb-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-sky-500" />
                Historical Validation Engine
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Compares current committed simulation parameters against historical Baghewala production data, calculating MAE, MAPE, RMSE, and bias.
              </p>
            </div>

            <button
              onClick={() => setHasExecuted(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex-shrink-0"
            >
              <Database className="w-4 h-4" />
              <span>RUN HISTORICAL MATCHING</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 dark:text-slate-400 text-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">1. Distance Metric Matching</span>
              Finds nearest historical well tests using normalized Euclidean distance over thermal & rate inputs.
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">2. Error Metrics</span>
              Calculates MAE, MAPE, RMSE, and bias against observed Jodhpur Sandstone production datasets.
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">3. Data Provenance</span>
              Labels dataset source (synthetic vs calibrated field tests) with full auditing trace.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-sky-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            HISTORICAL VALIDATION ENGINE
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span
            className={`px-3 py-1.5 rounded-md text-xs font-bold shadow-sm ${
              validationResult.validationStatus === 'VALIDATED'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80'
                : validationResult.validationStatus === 'LIMITED_DATA'
                ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80'
                : 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80'
            }`}
          >
            STATUS: {validationResult.validationStatus}
          </span>
          <span className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 text-xs shadow-sm">
            {validationResult.dataProvenanceLabel}
          </span>
        </div>
      </div>

      {isStale && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-4 rounded-xl flex items-center gap-3 text-amber-700 dark:text-amber-300 text-sm shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>
            Slider parameters edited. Click <strong className="text-sky-600 dark:text-sky-300">RUN SIMULATION</strong> to update committed historical validation metrics.
          </span>
        </div>
      )}

      {/* Current Scenario Comparison Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Simulated Production</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {validationResult.predictedProductionBopd.toFixed(2)} <span className="text-sm">BOPD</span>
          </div>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Historical Comparable</span>
          <div className="text-lg font-bold text-sky-600 dark:text-sky-400">
            {validationResult.observedProductionBopd.toFixed(2)} <span className="text-sm">BOPD</span>
          </div>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Absolute Error / %</span>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {validationResult.absoluteErrorBopd.toFixed(2)} <span className="text-sm">BOPD ({validationResult.absolutePercentageError.toFixed(1)}%)</span>
          </div>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Dataset MAE / MAPE</span>
          <div className="text-lg font-bold text-slate-700 dark:text-slate-200">
            {validationResult.mae.toFixed(2)} <span className="text-sm">BOPD / {validationResult.mape.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Historical Matches Table */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-sky-500" />
          <span>TOP HISTORICAL OPERATING MATCHES</span>
        </h3>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4">Record ID</th>
                <th className="p-4">Date / Well</th>
                <th className="p-4">Observed BOPD</th>
                <th className="p-4">Simulated BOPD</th>
                <th className="p-4">Error</th>
                <th className="p-4">Match %</th>
                <th className="p-4">Data Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {validationResult.matchedRecords.map((m, idx) => {
                const err = Math.abs(validationResult.predictedProductionBopd - m.record.observedProductionBopd);
                return (
                  <tr key={m.record.id} className={idx === 0 ? 'bg-sky-50/50 dark:bg-sky-950/20 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors'}>
                    <td className="p-4 text-sky-600 dark:text-sky-400 font-mono text-xs">{m.record.id}</td>
                    <td className="p-4">{m.record.date} ({m.record.wellId})</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">{m.record.observedProductionBopd.toFixed(2)} BOPD</td>
                    <td className="p-4 font-bold">{validationResult.predictedProductionBopd.toFixed(2)} BOPD</td>
                    <td className="p-4 text-amber-600 dark:text-amber-400 font-bold">{err.toFixed(2)} BOPD</td>
                    <td className="p-4 font-bold text-sky-600 dark:text-sky-400">{m.matchQualityPercent}%</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-mono shadow-sm">
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

      <div className="p-5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 italic flex items-start gap-3 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed font-medium">{validationResult.disclaimer}</span>
      </div>
    </div>
  );
};

import React from 'react';
import type { PilotState } from '../../simulation/productionPilot/types';
import { TrendingUp, AlertTriangle, ArrowRightLeft } from 'lucide-react';

interface Props {
  pilotState: PilotState;
}

export const ActualVsPredictedPanel: React.FC<Props> = ({ pilotState }) => {
  const comparison = pilotState.lastComparison;
  const history = pilotState.comparisonHistory;

  if (!comparison) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-500 dark:text-slate-400 text-sm shadow-sm font-sans">
        No actual-vs-predicted comparison available yet. Valid telemetry required.
      </div>
    );
  }

  const isHighError = comparison.productionErrorPct >= 20.0;
  const isModError = comparison.productionErrorPct >= 10.0;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-100 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-800/80 rounded-xl text-purple-600 dark:text-purple-400 shadow-sm">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">ACTUAL VS PREDICTED PRODUCTION COMPARISON</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Continuous Real-Time Physical Prediction Error Benchmarking</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Absolute Error</div>
            <div className="text-lg font-bold text-slate-700 dark:text-slate-200 font-mono">{comparison.productionErrorBOPD} <span className="text-sm font-sans text-slate-500 dark:text-slate-400">BOPD</span></div>
          </div>
          <div className={`px-4 py-2 rounded-xl border text-sm font-bold font-mono shadow-sm flex items-center gap-2 ${
            isHighError 
              ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/80' 
              : isModError 
              ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/80' 
              : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/80'
          }`}>
            {isHighError || isModError ? <AlertTriangle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            ERROR: {comparison.productionErrorPct}%
          </div>
        </div>
      </div>

      {/* Comparison Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Crude Oil Production</div>
          <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Actual Field:</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">{comparison.actualProductionBOPD} <span className="text-xs">BOPD</span></span>
          </div>
          <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Physics Predicted:</span>
            <span className="text-base font-bold text-sky-600 dark:text-sky-400 font-mono">{comparison.predictedProductionBOPD} <span className="text-xs">BOPD</span></span>
          </div>
          <div className="pt-1 flex justify-between items-center text-sm font-medium">
            <span className="text-slate-600 dark:text-slate-400">Production Delta:</span>
            <span className={`font-mono font-bold ${comparison.actualProductionBOPD >= comparison.predictedProductionBOPD ? 'text-emerald-500' : 'text-amber-500'}`}>
              {(comparison.actualProductionBOPD - comparison.predictedProductionBOPD).toFixed(2)} BOPD
            </span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Reservoir Pressure Response</div>
          <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Actual Pressure:</span>
            <span className="text-base font-bold text-slate-700 dark:text-slate-200 font-mono">{comparison.actualPressureBar} <span className="text-xs">bar</span></span>
          </div>
          <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Predicted Baseline:</span>
            <span className="text-base font-bold text-slate-500 dark:text-slate-400 font-mono">{comparison.predictedPressureBar} <span className="text-xs">bar</span></span>
          </div>
          <div className="pt-1 flex justify-between items-center text-sm font-medium">
            <span className="text-slate-600 dark:text-slate-400">Pressure Deviation:</span>
            <span className={`font-mono font-bold ${Math.abs(comparison.pressureDeviationBar) > 5.0 ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}>
              {comparison.pressureDeviationBar} bar
            </span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Reservoir Thermal & Water Response</div>
          <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Temp Deviation:</span>
            <span className="text-base font-bold text-slate-700 dark:text-slate-200 font-mono">{comparison.temperatureDeviationC} <span className="text-xs">°C</span></span>
          </div>
          <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Water-Cut Deviation:</span>
            <span className="text-base font-bold text-slate-700 dark:text-slate-200 font-mono">{comparison.waterCutDeviationPct} <span className="text-xs">pts</span></span>
          </div>
          <div className="pt-1 flex justify-between items-center text-sm font-medium">
            <span className="text-slate-600 dark:text-slate-400">Steam Response Dev:</span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{comparison.steamResponseDeviation} °C</span>
          </div>
        </div>
      </div>

      {/* Comparison History Log */}
      {history.length > 0 && (
        <div className="mt-6">
          <div className="text-sm text-slate-700 dark:text-slate-300 font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            Comparison History Trajectory
          </div>
          <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/40 shadow-inner">
            <table className="w-full text-left text-sm font-mono text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 sticky top-0 uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actual BOPD</th>
                  <th className="p-3">Predicted BOPD</th>
                  <th className="p-3">Error BOPD</th>
                  <th className="p-3">Error %</th>
                  <th className="p-3">Press Dev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {history.slice(-8).reverse().map((pt, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 text-slate-500 dark:text-slate-500 text-xs">{new Date(pt.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{pt.actualProductionBOPD}</td>
                    <td className="p-3 font-bold text-sky-600 dark:text-sky-400">{pt.predictedProductionBOPD}</td>
                    <td className="p-3 font-medium">{pt.productionErrorBOPD}</td>
                    <td className={`p-3 font-bold ${pt.productionErrorPct >= 20 ? 'text-rose-600 dark:text-red-400' : pt.productionErrorPct >= 10 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {pt.productionErrorPct}%
                    </td>
                    <td className="p-3 font-medium text-slate-500 dark:text-slate-400">{pt.pressureDeviationBar} bar</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

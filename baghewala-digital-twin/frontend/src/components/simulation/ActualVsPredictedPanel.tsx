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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-400 text-sm">
        No actual-vs-predicted comparison available yet. Valid telemetry required.
      </div>
    );
  }

  const isHighError = comparison.productionErrorPct >= 20.0;
  const isModError = comparison.productionErrorPct >= 10.0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">ACTUAL VS PREDICTED PRODUCTION COMPARISON</h3>
            <p className="text-xs text-slate-400">Continuous Real-Time Physical Prediction Error Benchmarking</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Absolute Error</div>
            <div className="text-sm font-semibold text-slate-200 font-mono">{comparison.productionErrorBOPD} BOPD</div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold font-mono flex items-center gap-1.5 ${
            isHighError ? 'bg-red-500/10 text-red-400 border-red-500/30' : isModError ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {isHighError || isModError ? <AlertTriangle className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
            ERROR: {comparison.productionErrorPct}%
          </div>
        </div>
      </div>

      {/* Comparison Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
          <div className="text-xs text-slate-400 uppercase font-semibold">Crude Oil Production</div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400">Actual Field:</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{comparison.actualProductionBOPD} BOPD</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400">Physics Predicted:</span>
            <span className="text-sm font-bold text-blue-400 font-mono">{comparison.predictedProductionBOPD} BOPD</span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
            <span className="text-slate-400">Production Delta:</span>
            <span className={`font-mono font-semibold ${comparison.actualProductionBOPD >= comparison.predictedProductionBOPD ? 'text-emerald-400' : 'text-amber-400'}`}>
              {(comparison.actualProductionBOPD - comparison.predictedProductionBOPD).toFixed(2)} BOPD
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
          <div className="text-xs text-slate-400 uppercase font-semibold">Reservoir Pressure Response</div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400">Actual Pressure:</span>
            <span className="text-sm font-bold text-slate-200 font-mono">{comparison.actualPressureBar} bar</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400">Predicted Baseline:</span>
            <span className="text-sm font-bold text-slate-400 font-mono">{comparison.predictedPressureBar} bar</span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
            <span className="text-slate-400">Pressure Deviation:</span>
            <span className={`font-mono font-semibold ${Math.abs(comparison.pressureDeviationBar) > 5.0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {comparison.pressureDeviationBar} bar
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
          <div className="text-xs text-slate-400 uppercase font-semibold">Reservoir Thermal & Water Response</div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400">Temp Deviation:</span>
            <span className="text-sm font-bold text-slate-200 font-mono">{comparison.temperatureDeviationC} °C</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400">Water-Cut Deviation:</span>
            <span className="text-sm font-bold text-slate-200 font-mono">{comparison.waterCutDeviationPct} pts</span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
            <span className="text-slate-400">Steam Response Dev:</span>
            <span className="font-mono font-semibold text-purple-400">{comparison.steamResponseDeviation} °C</span>
          </div>
        </div>
      </div>

      {/* Comparison History Log */}
      {history.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Comparison History Trajectory</div>
          <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-lg bg-slate-950/40">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 sticky top-0">
                <tr>
                  <th className="p-2">Timestamp</th>
                  <th className="p-2">Actual BOPD</th>
                  <th className="p-2">Predicted BOPD</th>
                  <th className="p-2">Error BOPD</th>
                  <th className="p-2">Error %</th>
                  <th className="p-2">Press Dev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.slice(-8).reverse().map((pt, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-2 text-slate-500">{new Date(pt.timestamp).toLocaleTimeString()}</td>
                    <td className="p-2 font-semibold text-emerald-400">{pt.actualProductionBOPD}</td>
                    <td className="p-2 text-blue-400">{pt.predictedProductionBOPD}</td>
                    <td className="p-2">{pt.productionErrorBOPD}</td>
                    <td className={`p-2 font-semibold ${pt.productionErrorPct >= 20 ? 'text-red-400' : pt.productionErrorPct >= 10 ? 'text-amber-400' : 'text-slate-300'}`}>
                      {pt.productionErrorPct}%
                    </td>
                    <td className="p-2 text-slate-400">{pt.pressureDeviationBar} bar</td>
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

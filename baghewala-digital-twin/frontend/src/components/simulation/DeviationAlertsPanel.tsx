import React from 'react';
import type { DeviationAlert } from '../../simulation/productionPilot/types';
import { DEVIATION_THRESHOLDS } from '../../simulation/productionPilot/deviationDetectionEngine';
import { AlertOctagon, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  alerts: DeviationAlert[];
}

export const DeviationAlertsPanel: React.FC<Props> = ({ alerts }) => {
  const hasAlerts = alerts.length > 0;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg border ${
            criticalCount > 0
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : warningCount > 0
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {criticalCount > 0 ? <AlertOctagon className="w-5 h-5" /> : warningCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">DETERMINISTIC DEVIATION ALERTS</h3>
            <p className="text-xs text-slate-400">Engineering Threshold Monitoring & Physical Anomaly Detection</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {criticalCount > 0 && (
            <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold rounded-lg font-mono">
              {criticalCount} CRITICAL
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-lg font-mono">
              {warningCount} WARNING
            </span>
          )}
          {!hasAlerts && (
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-lg font-mono">
              ALL NOMINAL
            </span>
          )}
        </div>
      </div>

      {/* Configurable Threshold Reference */}
      <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-400 flex flex-wrap gap-x-6 gap-y-1">
        <span>Production Error: Warning &ge; {DEVIATION_THRESHOLDS.PRODUCTION.WARNING_PCT}%, Critical &ge; {DEVIATION_THRESHOLDS.PRODUCTION.CRITICAL_PCT}%</span>
        <span>Pressure: Warning &ge; {DEVIATION_THRESHOLDS.PRESSURE.WARNING_BAR} bar, Critical &ge; {DEVIATION_THRESHOLDS.PRESSURE.CRITICAL_BAR} bar</span>
        <span>Temp: Warning &ge; {DEVIATION_THRESHOLDS.TEMPERATURE.WARNING_C}°C, Critical &ge; {DEVIATION_THRESHOLDS.TEMPERATURE.CRITICAL_C}°C</span>
        <span>Water Cut: Warning &ge; {DEVIATION_THRESHOLDS.WATER_CUT.WARNING_PCT_POINTS} pts, Critical &ge; {DEVIATION_THRESHOLDS.WATER_CUT.CRITICAL_PCT_POINTS} pts</span>
      </div>

      {/* Alert List */}
      {!hasAlerts ? (
        <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          No physical or telemetry deviations detected. Observed field state aligns within nominal operating limits.
        </div>
      ) : (
        <div className="space-y-2.5">
          {alerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-lg border space-y-1.5 ${
                  isCrit ? 'bg-red-950/30 border-red-800/50 text-red-200' : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className={`w-4 h-4 ${isCrit ? 'text-red-400' : 'text-amber-400'}`} />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">{alert.type.replace(/_/g, ' ')}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                    isCrit ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {alert.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{alert.engineeringMessage}</p>

                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/50">
                  <span>Measured: <strong className="text-slate-200">{alert.measuredValue}</strong></span>
                  <span>Expected: <strong className="text-slate-200">{alert.expectedValue}</strong></span>
                  <span>Deviation: <strong className={isCrit ? 'text-red-400' : 'text-amber-400'}>{alert.deviation}</strong></span>
                  <span>Threshold: <strong className="text-slate-300">{alert.threshold}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

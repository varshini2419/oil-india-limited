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
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl border shadow-sm ${
            criticalCount > 0
              ? 'bg-rose-100 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800/80 dark:text-rose-400'
              : warningCount > 0
              ? 'bg-amber-100 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800/80 dark:text-amber-400'
              : 'bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-400'
          }`}>
            {criticalCount > 0 ? <AlertOctagon className="w-5 h-5" /> : warningCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">DETERMINISTIC DEVIATION ALERTS</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Engineering Threshold Monitoring & Physical Anomaly Detection</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {criticalCount > 0 && (
            <span className="px-3 py-1.5 bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/80 text-xs font-bold rounded-lg font-mono shadow-sm tracking-wide">
              {criticalCount} CRITICAL
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/80 text-xs font-bold rounded-lg font-mono shadow-sm tracking-wide">
              {warningCount} WARNING
            </span>
          )}
          {!hasAlerts && (
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/80 text-xs font-bold rounded-lg font-mono shadow-sm tracking-wide">
              ALL NOMINAL
            </span>
          )}
        </div>
      </div>

      {/* Configurable Threshold Reference */}
      <div className="p-4 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-mono text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-6 gap-y-2 shadow-sm font-medium">
        <span>Production Error: Warning &ge; {DEVIATION_THRESHOLDS.PRODUCTION.WARNING_PCT}%, Critical &ge; {DEVIATION_THRESHOLDS.PRODUCTION.CRITICAL_PCT}%</span>
        <span>Pressure: Warning &ge; {DEVIATION_THRESHOLDS.PRESSURE.WARNING_BAR} bar, Critical &ge; {DEVIATION_THRESHOLDS.PRESSURE.CRITICAL_BAR} bar</span>
        <span>Temp: Warning &ge; {DEVIATION_THRESHOLDS.TEMPERATURE.WARNING_C}°C, Critical &ge; {DEVIATION_THRESHOLDS.TEMPERATURE.CRITICAL_C}°C</span>
        <span>Water Cut: Warning &ge; {DEVIATION_THRESHOLDS.WATER_CUT.WARNING_PCT_POINTS} pts, Critical &ge; {DEVIATION_THRESHOLDS.WATER_CUT.CRITICAL_PCT_POINTS} pts</span>
      </div>

      {/* Alert List */}
      {!hasAlerts ? (
        <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-3 shadow-sm font-medium">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          No physical or telemetry deviations detected. Observed field state aligns within nominal operating limits.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border space-y-3 shadow-sm transition-all ${
                  isCrit ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50' : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className={`w-5 h-5 ${isCrit ? 'text-rose-500 dark:text-rose-400' : 'text-amber-500 dark:text-amber-400'}`} />
                    <span className={`font-mono text-sm font-bold uppercase tracking-wider ${isCrit ? 'text-rose-700 dark:text-rose-300' : 'text-amber-700 dark:text-amber-300'}`}>{alert.type.replace(/_/g, ' ')}</span>
                  </div>
                  <span className={`px-3 py-1 text-xs font-mono font-bold uppercase rounded-lg shadow-sm ${
                    isCrit ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40' : 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                  }`}>
                    {alert.severity}
                  </span>
                </div>

                <p className={`text-sm leading-relaxed font-medium ${isCrit ? 'text-rose-800 dark:text-rose-200/90' : 'text-amber-800 dark:text-amber-200/90'}`}>{alert.engineeringMessage}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-800/50">
                  <span>Measured: <strong className="text-slate-700 dark:text-slate-200">{alert.measuredValue}</strong></span>
                  <span>Expected: <strong className="text-slate-700 dark:text-slate-200">{alert.expectedValue}</strong></span>
                  <span>Deviation: <strong className={isCrit ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>{alert.deviation}</strong></span>
                  <span>Threshold: <strong className="text-slate-600 dark:text-slate-300">{alert.threshold}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

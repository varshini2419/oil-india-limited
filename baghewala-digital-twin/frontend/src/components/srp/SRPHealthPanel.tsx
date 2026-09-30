import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { AlertTriangle, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

export const SRPHealthPanel: React.FC = () => {
  const { srpOptimizationResult } = useScenarioStore();
  const cur = srpOptimizationResult.currentCandidate;
  const status = cur.status;

  // Mechanical Health Metrics derived strictly from srpOptimizationResult
  const rodLoadUtilizationPct = cur.loadIndex;
  const peakRodLoadPct = Number(Math.min(100, rodLoadUtilizationPct * 0.7 + 15).toFixed(1));
  const rodStressIndex = cur.strokeSeverity;
  const rodFatigueIndex = cur.cycleSeverity;
  const pumpFillagePct = Number(Math.min(100, Math.max(10, cur.pumpCapacityFactor * 100)).toFixed(1));

  const isNormal = status === 'NORMAL';
  const isCaution = status === 'CAUTION';

  const statusBadgeText = isNormal
    ? 'HEALTHY / NORMAL'
    : isCaution
    ? 'WARNING / CAUTION'
    : 'CRITICAL / HIGH LOAD';

  const statusTone = isNormal
    ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
    : isCaution
    ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
    : 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 font-mono shadow-sm flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300 text-xs">
          <Activity className="w-4 h-4 text-sky-500" />
          <span>SRP MECHANICAL HEALTH & OPERATING STATUS</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10.5px] font-bold border ${statusTone}`}>
          {isNormal ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : isCaution ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          )}
          <span>{statusBadgeText}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {/* Metric 1: Peak Rod Load */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            PEAK ROD LOAD
          </span>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100">
            {peakRodLoadPct}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                peakRodLoadPct > 80 ? 'bg-rose-500' : peakRodLoadPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${peakRodLoadPct}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Rod Load Utilization */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            LOAD UTILIZATION
          </span>
          <div className="text-base font-bold text-amber-600 dark:text-amber-400">
            {rodLoadUtilizationPct.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                rodLoadUtilizationPct > 85 ? 'bg-rose-500' : rodLoadUtilizationPct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${rodLoadUtilizationPct}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Rod Stress Index */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            ROD STRESS INDEX
          </span>
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
            {rodStressIndex.toFixed(0)} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Stroke Severity</div>
        </div>

        {/* Metric 4: Rod Fatigue Index */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            ROD FATIGUE INDEX
          </span>
          <div className="text-base font-bold text-purple-600 dark:text-purple-400">
            {rodFatigueIndex.toFixed(0)} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Cycle Reversal Load</div>
        </div>

        {/* Metric 5: Pump Fillage */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            PUMP FILLAGE
          </span>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {pumpFillagePct}%
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Volumetric Efficiency</div>
        </div>

        {/* Metric 6: Dynamometer Status */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            DYNAMOMETER STATUS
          </span>
          <div className={`text-base font-bold ${isNormal ? 'text-emerald-500' : isCaution ? 'text-amber-500' : 'text-rose-500'}`}>
            {status}
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Card Verification</div>
        </div>
      </div>
    </div>
  );
};

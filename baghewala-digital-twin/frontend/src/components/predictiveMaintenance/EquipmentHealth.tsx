import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { calculatePredictiveRisks } from './RiskGauges';
import { ShieldCheck, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

export const EquipmentHealth: React.FC = () => {
  const { srpOptimizationResult, aiRiskResult } = useScenarioStore();
  const cur = srpOptimizationResult.currentCandidate;
  const risks = calculatePredictiveRisks(cur, aiRiskResult.riskScore);

  const healthScore = risks.overallHealthPct;

  let healthStatus = 'HEALTHY';
  let statusTone = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
  let barTone = 'bg-emerald-500';

  if (healthScore >= 80) {
    healthStatus = 'HEALTHY';
    statusTone = 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    barTone = 'bg-emerald-500';
  } else if (healthScore >= 60) {
    healthStatus = 'ATTENTION';
    statusTone = 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
    barTone = 'bg-amber-500';
  } else if (healthScore >= 40) {
    healthStatus = 'DEGRADED';
    statusTone = 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800';
    barTone = 'bg-orange-500';
  } else {
    healthStatus = 'CRITICAL';
    statusTone = 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
    barTone = 'bg-rose-500';
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 font-mono shadow-sm flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300 text-xs">
          <Activity className="w-4 h-4 text-sky-500" />
          <span>OVERALL EQUIPMENT HEALTH INDEX</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${statusTone}`}>
          {healthScore >= 80 ? (
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          ) : healthScore >= 60 ? (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          )}
          <span>● {healthStatus}</span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">COMPOSITE SYSTEM HEALTH</span>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
            {healthScore}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans block">
            Weighted Mechanical Health Rating (100 - Integrated Risk)
          </span>
        </div>

        <div className="w-full sm:w-1/2 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Health Index Bar:</span>
            <span className="text-slate-200">{healthScore} / 100</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
            <div className={`h-full rounded-full transition-all duration-700 ${barTone}`} style={{ width: `${healthScore}%` }} />
          </div>
          <div className="grid grid-cols-4 text-[9px] text-slate-400 font-mono text-center pt-1">
            <span>CRITICAL (0-39)</span>
            <span>DEGRADED (40-59)</span>
            <span>ATTENTION (60-79)</span>
            <span className="text-emerald-500 font-bold">HEALTHY (80-100)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-sans">
        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-slate-400 block">Rod Failure (30%)</span>
          <strong className="text-slate-700 dark:text-slate-300 font-mono">{risks.rodFailurePct}%</strong>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-slate-400 block">Pump Unseat (20%)</span>
          <strong className="text-slate-700 dark:text-slate-300 font-mono">{risks.pumpUnseatingPct}%</strong>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-slate-400 block">Rod Float (20%)</span>
          <strong className="text-slate-700 dark:text-slate-300 font-mono">{risks.rodFloatingPct}%</strong>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-slate-400 block">Rod Slacking (15%)</span>
          <strong className="text-slate-700 dark:text-slate-300 font-mono">{risks.rodSlackingPct}%</strong>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-slate-400 block">System Risk (15%)</span>
          <strong className="text-slate-700 dark:text-slate-300 font-mono">{aiRiskResult.riskScore}/100</strong>
        </div>
      </div>
    </div>
  );
};

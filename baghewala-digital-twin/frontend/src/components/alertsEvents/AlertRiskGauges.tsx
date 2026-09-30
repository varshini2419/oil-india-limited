import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { calculatePredictiveRisks } from '../predictiveMaintenance/RiskGauges';
import { Activity } from 'lucide-react';

export const AlertRiskGauges: React.FC = () => {
  const { srpOptimizationResult, aiRiskResult } = useScenarioStore();
  const cur = srpOptimizationResult.currentCandidate;
  const risks = calculatePredictiveRisks(cur, aiRiskResult.riskScore);

  const renderRadialGauge = (label: string, valuePct: number, isHealth: boolean = false) => {
    // Health is high-good, risk is low-good
    let isLow = isHealth ? valuePct >= 80 : valuePct < 20;
    let isCaution = isHealth ? valuePct >= 60 && valuePct < 80 : valuePct >= 20 && valuePct <= 45;
    let color = isLow ? '#10b981' : isCaution ? '#f59e0b' : '#f43f5e';
    let textClass = isLow ? 'text-emerald-500' : isCaution ? 'text-amber-500' : 'text-rose-500';
    let statusLabel = isHealth
      ? valuePct >= 80 ? 'HEALTHY' : valuePct >= 60 ? 'ATTENTION' : 'DEGRADED'
      : isLow ? 'LOW' : isCaution ? 'CAUTION' : 'HIGH';

    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (valuePct / 100) * circumference;

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col items-center justify-between shadow-xs space-y-1 font-mono">
        <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider text-center">{label}</span>

        <div className="relative w-20 h-20 flex items-center justify-center my-1">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="#334155" strokeWidth="6" opacity="0.3" />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{valuePct.toFixed(1)}%</span>
            <span className={`text-[8.5px] font-bold ${textClass}`}>● {statusLabel}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 font-mono shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-2.5 text-xs">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300">
          <Activity className="w-4 h-4 text-sky-500 animate-pulse" />
          <span>LIVE RISK GAUGES & EQUIPMENT HEALTH RADIALS</span>
        </div>
        <span className="text-[10px] text-slate-400 font-sans">
          Synchronized to Predictive Maintenance & System Risk Engines
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {renderRadialGauge('Rod Failure', risks.rodFailurePct)}
        {renderRadialGauge('Pump Unseating', risks.pumpUnseatingPct)}
        {renderRadialGauge('Rod Floating', risks.rodFloatingPct)}
        {renderRadialGauge('Equipment Health', risks.overallHealthPct, true)}
        {renderRadialGauge('System Risk', aiRiskResult.riskScore)}
      </div>
    </div>
  );
};

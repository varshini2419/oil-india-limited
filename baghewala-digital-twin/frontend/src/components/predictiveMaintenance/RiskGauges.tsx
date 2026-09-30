import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { Activity } from 'lucide-react';

export interface CalculatedRisks {
  rodFailurePct: number;
  pumpUnseatingPct: number;
  rodFloatingPct: number;
  rodSlackingPct: number;
  overallHealthPct: number;
}

export function calculatePredictiveRisks(curCandidate: any, riskScore: number): CalculatedRisks {
  const strokeSev = curCandidate.strokeSeverity ?? 30;
  const cycleSev = curCandidate.cycleSeverity ?? 35;
  const speedSev = curCandidate.speedSeverity ?? 40;
  const loadIndex = curCandidate.loadIndex ?? 50;
  const pumpCapFactor = curCandidate.pumpCapacityFactor ?? 0.82;
  const fillagePct = Math.min(100, Math.max(10, pumpCapFactor * 100));

  // 1. Rod Failure Risk
  const rodFailurePct = Number(
    Math.min(99.9, Math.max(2.0, 5.0 + strokeSev * 0.28 + loadIndex * 0.35)).toFixed(1)
  );

  // 2. Pump Unseating Risk
  const pumpUnseatingPct = Number(
    Math.min(99.9, Math.max(1.5, 3.0 + loadIndex * 0.38 + (100 - fillagePct) * 0.22)).toFixed(1)
  );

  // 3. Rod Floating Risk
  const rodFloatingPct = Number(
    Math.min(99.9, Math.max(2.0, 4.0 + cycleSev * 0.45 + speedSev * 0.22)).toFixed(1)
  );

  // 4. Rod Slacking Risk
  const rodSlackingPct = Number(
    Math.min(99.9, Math.max(5.0, 12.0 + cycleSev * 0.32 + (100 - fillagePct) * 0.25)).toFixed(1)
  );

  // Overall Equipment Health (100 - weighted mechanical risk)
  const weightedRisk =
    rodFailurePct * 0.30 +
    pumpUnseatingPct * 0.20 +
    rodFloatingPct * 0.20 +
    rodSlackingPct * 0.15 +
    riskScore * 0.15;

  const overallHealthPct = Number(Math.min(100, Math.max(0, 100 - weightedRisk)).toFixed(0));

  return {
    rodFailurePct,
    pumpUnseatingPct,
    rodFloatingPct,
    rodSlackingPct,
    overallHealthPct,
  };
}

export const RiskGauges: React.FC = () => {
  const { srpOptimizationResult, aiRiskResult } = useScenarioStore();
  const cur = srpOptimizationResult.currentCandidate;
  const risks = calculatePredictiveRisks(cur, aiRiskResult.riskScore);

  const renderGauge = (label: string, valuePct: number, subtitle: string) => {
    const isLow = valuePct < 20.0;
    const isCaution = valuePct >= 20.0 && valuePct <= 45.0;
    const stateLabel = isLow ? 'LOW' : isCaution ? 'CAUTION' : 'HIGH';
    const stateColor = isLow ? 'text-emerald-500' : isCaution ? 'text-amber-500' : 'text-rose-500';
    const strokeColor = isLow ? '#10b981' : isCaution ? '#f59e0b' : '#f43f5e';

    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (valuePct / 100) * circumference;

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between shadow-sm space-y-2 relative group hover:border-sky-300 dark:hover:border-sky-700 transition-all">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">{label}</span>

        {/* Circular SVG Arc Gauge */}
        <div className="relative w-24 h-24 flex items-center justify-center my-1">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
            {/* Background ring */}
            <circle cx="45" cy="45" r={radius} fill="none" stroke="#334155" strokeWidth="7" opacity="0.3" />
            {/* Value ring arc */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">{valuePct.toFixed(1)}%</span>
            <span className={`text-[9.5px] font-bold ${stateColor}`}>● {stateLabel}</span>
          </div>
        </div>

        <span className="text-[9.5px] text-slate-400 font-sans text-center">{subtitle}</span>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 font-mono shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-500" />
            PREDICTIVE MAINTENANCE FAILURE-RISK GAUGES
          </h3>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Continuous mechanical health and component failure-risk estimation derived from scenario kinematics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderGauge('ROD FAILURE', risks.rodFailurePct, 'Polished Rod Stress Risk')}
        {renderGauge('PUMP UNSEATING', risks.pumpUnseatingPct, 'Plunger Hold-Down Risk')}
        {renderGauge('ROD FLOATING', risks.rodFloatingPct, 'Heavy-Oil Drag Viscous Risk')}
        {renderGauge('ROD SLACKING', risks.rodSlackingPct, 'Downstroke Buoyancy Slaking Risk')}
      </div>
    </div>
  );
};

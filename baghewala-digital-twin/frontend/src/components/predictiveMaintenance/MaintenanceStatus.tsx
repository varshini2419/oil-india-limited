import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { calculatePredictiveRisks } from './RiskGauges';
import { Activity } from 'lucide-react';

export const MaintenanceStatus: React.FC = () => {
  const { srpOptimizationResult, aiRiskResult } = useScenarioStore();
  const cur = srpOptimizationResult.currentCandidate;
  const risks = calculatePredictiveRisks(cur, aiRiskResult.riskScore);

  const getSubsystemStatus = (riskVal: number) => {
    if (riskVal < 20.0) return { label: 'HEALTHY', tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' };
    if (riskVal < 45.0) return { label: 'MONITOR', tone: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' };
    if (riskVal < 65.0) return { label: 'INSPECT', tone: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800' };
    return { label: 'ATTENTION REQUIRED', tone: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' };
  };

  const rodStatus = getSubsystemStatus(risks.rodFailurePct);
  const pumpStatus = getSubsystemStatus(risks.pumpUnseatingPct);
  const beamStatus = getSubsystemStatus(risks.rodFloatingPct);
  const vfdStatus = getSubsystemStatus(cur.speedSeverity * 0.5);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 font-mono shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-500" />
          SUBSYSTEM MAINTENANCE HEALTH & INSPECTION STATUS
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        {/* Subsystem 1: Rod String */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">1. SUCKER ROD STRING</span>
          <span className={`inline-block px-2.5 py-1 rounded text-[10.5px] font-bold border ${rodStatus.tone}`}>
            ● {rodStatus.label}
          </span>
          <div className="text-[9px] text-slate-400">Stress: {cur.strokeSeverity}/100</div>
        </div>

        {/* Subsystem 2: Downhole Pump */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">2. DOWNHOLE PUMP</span>
          <span className={`inline-block px-2.5 py-1 rounded text-[10.5px] font-bold border ${pumpStatus.tone}`}>
            ● {pumpStatus.label}
          </span>
          <div className="text-[9px] text-slate-400">Fillage: {(cur.pumpCapacityFactor * 100).toFixed(0)}%</div>
        </div>

        {/* Subsystem 3: Surface Walking Beam */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">3. WALKING BEAM</span>
          <span className={`inline-block px-2.5 py-1 rounded text-[10.5px] font-bold border ${beamStatus.tone}`}>
            ● {beamStatus.label}
          </span>
          <div className="text-[9px] text-slate-400">Cycle: {cur.cycleSeverity}/100</div>
        </div>

        {/* Subsystem 4: VFD & Motor */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">4. VFD & MOTOR DRIVE</span>
          <span className={`inline-block px-2.5 py-1 rounded text-[10.5px] font-bold border ${vfdStatus.tone}`}>
            ● {vfdStatus.label}
          </span>
          <div className="text-[9px] text-slate-400">Speed: {cur.speedSeverity}/100</div>
        </div>

        {/* Subsystem 5: Dynamometer */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">5. DYNAMOMETER CARD</span>
          <span className={`inline-block px-2.5 py-1 rounded text-[10.5px] font-bold border ${
            cur.status === 'NORMAL'
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
              : cur.status === 'CAUTION'
              ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
              : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800'
          }`}>
            ● {cur.status}
          </span>
          <div className="text-[9px] text-slate-400">Load: {cur.loadIndex.toFixed(0)}/100</div>
        </div>
      </div>
    </div>
  );
};

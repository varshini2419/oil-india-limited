import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { AlertTriangle, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export interface AlertItem {
  severity: 'NORMAL' | 'CAUTION' | 'HIGH';
  title: string;
  currentVal: string;
  threshold: string;
  explanation: string;
}

export const MaintenanceAlerts: React.FC = () => {
  const { committedSimulationResult, srpOptimizationResult } = useScenarioStore();
  const inputs = committedSimulationResult.inputs;
  const cur = srpOptimizationResult.currentCandidate;

  const alerts: AlertItem[] = [];

  // 1. SPM / Cycle Fatigue Alert
  if (inputs.spm > 14.0) {
    alerts.push({
      severity: 'HIGH',
      title: 'ROD FATIGUE RISK — HIGH SPM',
      currentVal: `${inputs.spm.toFixed(1)} SPM`,
      threshold: '14.0 SPM Max Safe',
      explanation: 'Repeated high-frequency cycle reversals increase sucker rod fatigue cracking and parting risk.',
    });
  } else if (inputs.spm > 10.0) {
    alerts.push({
      severity: 'CAUTION',
      title: 'ELEVATED PUMPING SPEED',
      currentVal: `${inputs.spm.toFixed(1)} SPM`,
      threshold: '10.0 SPM Recommended',
      explanation: 'Pumping speed approaching elevated cycle-fatigue region. Monitor downstroke rod floating.',
    });
  }

  // 2. Rod Load Utilization Alert
  if (cur.loadIndex > 85.0) {
    alerts.push({
      severity: 'HIGH',
      title: 'HIGH ROD LOAD EXCEEDED',
      currentVal: `${cur.loadIndex.toFixed(1)}% Load Index`,
      threshold: '85.0% Maximum Limit',
      explanation: 'Combined rod mechanical stress exceeds safe allowable operating envelope. Parting risk critical.',
    });
  } else if (cur.loadIndex > 65.0) {
    alerts.push({
      severity: 'CAUTION',
      title: 'ROD LOAD ELEVATED',
      currentVal: `${cur.loadIndex.toFixed(1)}% Load Index`,
      threshold: '65.0% Caution Bound',
      explanation: 'Rod stress utilization entering caution region. Thermal viscosity reduction recommended.',
    });
  }

  // 3. Pump Fillage Alert
  const fillagePct = Math.min(100, Math.max(10, cur.pumpCapacityFactor * 100));
  if (fillagePct < 60.0) {
    alerts.push({
      severity: 'HIGH',
      title: 'LOW PUMP FILLAGE / FLUID POUND',
      currentVal: `${fillagePct.toFixed(1)}% Fillage`,
      threshold: '60.0% Minimum Target',
      explanation: 'Incomplete pump barrel filling causes fluid pound impact shock on downstroke.',
    });
  }

  // If no warnings triggered:
  if (alerts.length === 0) {
    alerts.push({
      severity: 'NORMAL',
      title: 'SYSTEM OPERATING WITHIN HEALTHY ENVELOPE',
      currentVal: 'Load Index OK',
      threshold: '65% / 85% Safe',
      explanation: 'All mechanical stress, SPM frequency, and pump fillage metrics are within normal limits.',
    });
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 font-mono shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-500" />
          ACTIVE PREDICTIVE MAINTENANCE ALERTS
        </h3>
        <span className="text-[10px] text-slate-500 font-sans">
          {alerts.filter((a) => a.severity !== 'NORMAL').length} Active Warning(s)
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((a, idx) => {
          const isNormal = a.severity === 'NORMAL';
          const isCaution = a.severity === 'CAUTION';
          const cardTone = isNormal
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
            : isCaution
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300';

          return (
            <div key={idx} className={`border rounded-xl p-3.5 space-y-1.5 shadow-xs ${cardTone}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                <div className="flex items-center gap-2">
                  {isNormal ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isCaution ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span>{a.title}</span>
                </div>
                <div className="text-[10px] font-mono opacity-90">
                  Value: <strong>{a.currentVal}</strong> | Limit: <strong>{a.threshold}</strong>
                </div>
              </div>
              <p className="text-[11px] font-sans opacity-95 leading-relaxed">{a.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

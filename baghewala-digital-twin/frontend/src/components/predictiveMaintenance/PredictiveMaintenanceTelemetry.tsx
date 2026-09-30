import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { useAnimation } from '../digital-twin/animations';
export const PredictiveMaintenanceTelemetry: React.FC = () => {
  const { committedSimulationResult, srpOptimizationResult } = useScenarioStore();
  const { progress } = useAnimation();

  const inputs = committedSimulationResult.inputs;
  const cur = srpOptimizationResult.currentCandidate;

  const spm = inputs.spm;
  const strokeM = inputs.strokeLengthMeters;
  const vfdHz = inputs.vfdFrequencyHz;
  const isUpstroke = progress < 0.5;
  const cycleTimeSec = spm > 0 ? (60 / spm).toFixed(1) : '0.0';

  const peakRodLoadPct = Number(Math.min(100, cur.loadIndex * 0.7 + 15).toFixed(1));
  const rodUtilizationPct = cur.loadIndex;
  const pumpFillagePct = Number(Math.min(100, Math.max(10, cur.pumpCapacityFactor * 100)).toFixed(1));

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 font-mono shadow-sm space-y-3">
      {/* Top Live Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 dark:border-slate-800 pb-2.5 text-xs">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>LIVE MAINTENANCE MONITORING — CONTINUOUS SRP DIAGNOSTICS</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
            ● MONITORING ACTIVE
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            Mode: <strong className={cur.status === 'NORMAL' ? 'text-emerald-500' : cur.status === 'CAUTION' ? 'text-amber-500' : 'text-rose-500'}>{cur.status}</strong>
          </span>
        </div>
      </div>

      {/* Grid of 8 Telemetry Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">SPM</span>
          <strong className="text-base font-bold text-sky-600 dark:text-sky-400 block">{spm.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">SPM</span></strong>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">STROKE</span>
          <strong className="text-base font-bold text-indigo-600 dark:text-indigo-400 block">{strokeM.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">m</span></strong>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">VFD FREQ</span>
          <strong className="text-base font-bold text-purple-600 dark:text-purple-400 block">{vfdHz.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">Hz</span></strong>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">DIRECTION</span>
          <strong className={`text-sm font-bold block ${isUpstroke ? 'text-emerald-500' : 'text-amber-500'}`}>
            {isUpstroke ? 'UPSTROKE' : 'DOWNSTROKE'}
          </strong>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">CYCLE TIME</span>
          <strong className="text-base font-bold text-emerald-600 dark:text-emerald-400 block">{cycleTimeSec} <span className="text-[10px] text-slate-400 font-normal">sec</span></strong>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">PEAK LOAD</span>
          <strong className="text-base font-bold text-slate-800 dark:text-slate-100 block">{peakRodLoadPct}%</strong>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">ROD UTIL</span>
          <strong className="text-base font-bold text-amber-600 dark:text-amber-400 block">{rodUtilizationPct.toFixed(1)}%</strong>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">PUMP FILLAGE</span>
          <strong className="text-base font-bold text-emerald-600 dark:text-emerald-400 block">{pumpFillagePct}%</strong>
        </div>
      </div>
    </div>
  );
};

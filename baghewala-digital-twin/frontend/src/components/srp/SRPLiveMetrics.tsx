import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { useAnimation } from '../digital-twin/animations';
import { Gauge, Activity, Cpu, ArrowUp, ArrowDown, Clock } from 'lucide-react';

export const SRPLiveMetrics: React.FC = () => {
  const { committedSimulationResult } = useScenarioStore();
  const { progress } = useAnimation();
  const inputs = committedSimulationResult.inputs;

  const spm = inputs.spm;
  const strokeM = inputs.strokeLengthMeters;
  const vfdHz = inputs.vfdFrequencyHz;
  const isUpstroke = progress < 0.5;
  const cycleTimeSec = spm > 0 ? (60 / spm).toFixed(1) : '0.0';

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 font-mono shadow-sm">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-2.5 mb-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300">
          <Activity className="w-4 h-4 text-sky-500 animate-pulse" />
          <span>CANONICAL SRP OPERATING TELEMETRY</span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium">
          Synchronized to Scenario Store & Animation Loop
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* Metric 1: SPM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>SPM</span>
            <Gauge className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="text-lg font-bold text-sky-600 dark:text-sky-400">
            {spm.toFixed(1)} <span className="text-xs text-slate-400 font-normal">SPM</span>
          </div>
          <div className="text-[9.5px] text-slate-400 mt-0.5">Pumping Speed</div>
        </div>

        {/* Metric 2: STROKE LENGTH */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>STROKE</span>
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {strokeM.toFixed(2)} <span className="text-xs text-slate-400 font-normal">m</span>
          </div>
          <div className="text-[9.5px] text-slate-400 mt-0.5">Polished Rod Travel</div>
        </div>

        {/* Metric 3: VFD FREQUENCY */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>VFD FREQ</span>
            <Cpu className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {vfdHz.toFixed(1)} <span className="text-xs text-slate-400 font-normal">Hz</span>
          </div>
          <div className="text-[9.5px] text-slate-400 mt-0.5">Drive Inverter</div>
        </div>

        {/* Metric 4: PUMP DIRECTION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>DIRECTION</span>
            {isUpstroke ? (
              <ArrowUp className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            )}
          </div>
          <div
            className={`text-base font-bold ${
              isUpstroke ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {isUpstroke ? 'UPSTROKE' : 'DOWNSTROKE'}
          </div>
          <div className="text-[9.5px] text-slate-400 mt-0.5">
            {isUpstroke ? 'Fluid Lifting Phase' : 'Traveling Valve Open'}
          </div>
        </div>

        {/* Metric 5: CYCLE TIME */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>CYCLE TIME</span>
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {cycleTimeSec} <span className="text-xs text-slate-400 font-normal">sec</span>
          </div>
          <div className="text-[9.5px] text-slate-400 mt-0.5">Full Stroke Period</div>
        </div>
      </div>
    </div>
  );
};

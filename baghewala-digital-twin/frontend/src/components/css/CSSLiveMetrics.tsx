import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { Flame, Droplet, Thermometer, Gauge, Clock, CloudRain, ShieldCheck, Sun } from 'lucide-react';

export const CSSLiveMetrics: React.FC = () => {
  const { committedSimulationResult } = useScenarioStore();
  const inputs = committedSimulationResult.inputs;
  const thermal = committedSimulationResult.thermal;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 font-mono shadow-sm">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-2.5 mb-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300">
          <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>CANONICAL THERMAL & CSS OPERATING TELEMETRY</span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium">
          Synchronized to Scenario Store & Physics Chain
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5 text-xs">
        {/* 1. Steam Injection Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>STEAM RATE</span>
            <Flame className="w-3 h-3 text-rose-500" />
          </div>
          <div className="text-base font-bold text-rose-600 dark:text-rose-400">
            {inputs.steamInjectionRateTpd.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">TPD</span>
          </div>
          <div className="text-[8.5px] text-slate-400 mt-0.5">Injection Mass</div>
        </div>

        {/* 2. Steam Quality */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>QUALITY</span>
            <CloudRain className="w-3 h-3 text-sky-400" />
          </div>
          <div className="text-base font-bold text-sky-600 dark:text-sky-400">
            {inputs.steamQualityPercent.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">%</span>
          </div>
          <div className="text-[8.5px] text-slate-400 mt-0.5">Vapor Fraction</div>
        </div>

        {/* 3. Steam Injection Temp */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>INJ TEMP</span>
            <Thermometer className="w-3 h-3 text-orange-500" />
          </div>
          <div className="text-base font-bold text-orange-600 dark:text-orange-400">
            {inputs.steamInjectionTemperatureC.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">°C</span>
          </div>
          <div className="text-[8.5px] text-slate-400 mt-0.5">Steam Generator</div>
        </div>

        {/* 4. Reservoir Temperature */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>RES TEMP</span>
            <Thermometer className="w-3 h-3 text-rose-500" />
          </div>
          <div className="text-base font-bold text-rose-600 dark:text-rose-400">
            {thermal.predictedReservoirTemperatureC.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">°C</span>
          </div>
          <div className="text-[8.5px] text-slate-400 mt-0.5">Matrix Heating</div>
        </div>

        {/* 5. Reservoir Pressure */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>RES PRESS</span>
            <Gauge className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
            {inputs.reservoirPressureBar.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">bar</span>
          </div>
          <div className="text-[8.5px] text-slate-400 mt-0.5">Formation P</div>
        </div>

        {/* 6. Soak Duration */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>SOAK TIME</span>
            <Clock className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {inputs.soakDurationDays.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">days</span>
          </div>
          <div className="text-[8.5px] text-slate-400 mt-0.5">Soaking Phase</div>
        </div>

        {/* 7. Water Cut */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>WATER CUT</span>
            <Droplet className="w-3 h-3 text-cyan-500" />
          </div>
          <div className="text-base font-bold text-cyan-600 dark:text-cyan-400">
            {inputs.waterCutPercent.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">%</span>
          </div>
          <div className="text-[8.5px] text-slate-400 mt-0.5">Produced Water</div>
        </div>

        {/* 8. Formation Permeability */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>PERM (k)</span>
            <ShieldCheck className="w-3 h-3 text-amber-500" />
          </div>
          <div className="text-base font-bold text-amber-600 dark:text-amber-400">
            {inputs.permeabilityDarcy.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">D</span>
          </div>
          <div className="text-[8.5px] text-slate-400 mt-0.5">Jodhpur Sand</div>
        </div>

        {/* 9. Ambient Temperature */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>AMBIENT</span>
            <Sun className="w-3 h-3 text-yellow-500" />
          </div>
          <div className="text-base font-bold text-yellow-600 dark:text-yellow-400">
            {inputs.ambientTemperatureC.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">°C</span>
          </div>
          <div className="text-[8.5px] text-slate-400 mt-0.5">Surface Weather</div>
        </div>
      </div>
    </div>
  );
};

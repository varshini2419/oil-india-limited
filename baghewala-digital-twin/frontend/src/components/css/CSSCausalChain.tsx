import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { Flame, Thermometer, Droplet, Activity, TrendingUp, Zap } from 'lucide-react';

export const CSSCausalChain: React.FC = () => {
  const { committedSimulationResult, cssOptimizationResult } = useScenarioStore();
  const inputs = committedSimulationResult.inputs;
  const thermal = committedSimulationResult.thermal;
  const viscosity = committedSimulationResult.viscosity;
  const mobility = committedSimulationResult.mobility;
  const production = committedSimulationResult.production;

  const heatMw = Number((inputs.steamInjectionRateTpd * 0.045 * (inputs.steamQualityPercent / 100)).toFixed(2));

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 font-mono shadow-sm">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-2.5 mb-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300">
          <Activity className="w-4 h-4 text-sky-500" />
          <span>PHYSICS PIPELINE — LIVE THERMAL CAUSAL CHAIN</span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium">
          Causal Propagation: Steam $\rightarrow$ Thermal Gain $\rightarrow$ Viscosity Drop $\rightarrow$ Mobility Boost $\rightarrow$ Inflow Rate
        </span>
      </div>

      {/* Causal Chain Nodes Horizontal Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-center text-xs">
        {/* Node 1: STEAM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs relative group">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>1. STEAM</span>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
            {inputs.steamInjectionRateTpd.toFixed(0)} TPD
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {inputs.steamQualityPercent.toFixed(0)}% Quality
          </div>
        </div>

        {/* Node 2: HEAT INPUT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs relative group">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>2. HEAT INPUT</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {heatMw.toFixed(2)} MW
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            +{cssOptimizationResult.thermalBreakdown.thermalGain.toFixed(1)}°C Thermal
          </div>
        </div>

        {/* Node 3: RESERVOIR TEMP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs relative group">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>3. RES TEMP</span>
            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
            {thermal.predictedReservoirTemperatureC.toFixed(1)} °C
          </div>
          <div className="text-[10px] text-emerald-500 mt-0.5 font-bold">
            +{thermal.temperatureChangeC.toFixed(1)}°C Gain
          </div>
        </div>

        {/* Node 4: VISCOSITY */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs relative group">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>4. VISCOSITY</span>
            <Droplet className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {viscosity.estimatedViscosityCp.toLocaleString()} cP
          </div>
          <div className="text-[10px] text-purple-500 mt-0.5 font-bold">
            {viscosity.viscosityChangePercent}% Drop
          </div>
        </div>

        {/* Node 5: MOBILITY */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs relative group">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>5. MOBILITY</span>
            <Activity className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {mobility.mobilityDcP.toFixed(4)} D/cP
          </div>
          <div className="text-[10px] text-emerald-500 mt-0.5 font-bold">
            +{mobility.mobilityChangePercent}% Boost
          </div>
        </div>

        {/* Node 6: OIL PRODUCTION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs relative group border-emerald-300 dark:border-emerald-800">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>6. OIL RATE</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {production.estimatedProductionBopd.toFixed(2)} BOPD
          </div>
          <div className="text-[10px] text-emerald-500 mt-0.5 font-bold">
            +{production.productionChangePercent}% Rate
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight, Flame, Cpu, Droplet } from 'lucide-react';

export const CSSHealthPanel: React.FC = () => {
  const { committedSimulationResult, cssOptimizationResult, srpOptimizationResult } = useScenarioStore();
  const inputs = committedSimulationResult.inputs;
  const thermal = committedSimulationResult.thermal;
  const viscosity = committedSimulationResult.viscosity;
  const production = committedSimulationResult.production;

  const status = cssOptimizationResult.status;

  // Determine prominent CSS status badge text
  let statusBadgeText = 'THERMALLY STABLE';
  if (inputs.steamInjectionRateTpd > 90 && inputs.reservoirTemperatureC > 70) {
    statusBadgeText = 'THERMAL RECOVERY / OPTIMAL';
  } else if (inputs.steamInjectionRateTpd < 30) {
    statusBadgeText = 'LOW HEAT INPUT';
  } else if (status === 'CAUTION') {
    statusBadgeText = 'HIGH STEAM DEMAND / CAUTION';
  } else if (status === 'HIGH_THERMAL_LOAD' || status === 'OUT_OF_RANGE') {
    statusBadgeText = 'CRITICAL / THERMAL OVERLOAD';
  }

  const isNormal = status === 'NORMAL';
  const isCaution = status === 'CAUTION';

  const statusTone = isNormal
    ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
    : isCaution
    ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
    : 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';

  // Derived Steam Efficiency Metrics
  const steamTpd = Math.max(1, inputs.steamInjectionRateTpd);
  const bopd = production.estimatedProductionBopd;
  const oilPerSteam = Number((bopd / steamTpd).toFixed(2));
  const csor = Number((steamTpd / Math.max(1, bopd * 0.14)).toFixed(2)); // Cumulative Steam-Oil Ratio
  const energyMw = Number((steamTpd * 0.045 * (inputs.steamQualityPercent / 100)).toFixed(2));
  const recoveryIndex = Number((thermal.temperatureChangeC * 1.5 + (bopd / 10)).toFixed(1));

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 font-mono shadow-sm flex flex-col justify-between space-y-4">
      {/* Status Header Bar */}
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300 text-xs">
          <Flame className="w-4 h-4 text-rose-500" />
          <span>CSS THERMAL STATUS & RECOVERY EFFICIENCY</span>
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

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {/* Metric 1: Oil Produced / Steam Used */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            OIL / STEAM RATIO
          </span>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {oilPerSteam} <span className="text-xs font-normal text-slate-400">bbl/ton</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Thermal Yield</div>
        </div>

        {/* Metric 2: Steam-Oil Ratio (CSOR) */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            STEAM-OIL RATIO (CSOR)
          </span>
          <div className="text-base font-bold text-sky-600 dark:text-sky-400">
            {csor} <span className="text-xs font-normal text-slate-400">ton/ton</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Cumulative Steam Requirement</div>
        </div>

        {/* Metric 3: Energy Demand */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            ENERGY DEMAND
          </span>
          <div className="text-base font-bold text-rose-600 dark:text-rose-400">
            {energyMw} <span className="text-xs font-normal text-slate-400">MW</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Steam Generator Heat Rate</div>
        </div>

        {/* Metric 4: Thermal Recovery Index */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            RECOVERY INDEX
          </span>
          <div className="text-base font-bold text-purple-600 dark:text-purple-400">
            {recoveryIndex} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Matrix Stimulation</div>
        </div>

        {/* Metric 5: Temp Gain */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            TEMP GAIN
          </span>
          <div className="text-base font-bold text-orange-600 dark:text-orange-400">
            +{thermal.temperatureChangeC.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Reservoir Heating</div>
        </div>

        {/* Metric 6: Viscosity Reduction */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-400 dark:text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider mb-1">
            VISCOSITY DROP
          </span>
          <div className="text-base font-bold text-purple-600 dark:text-purple-400">
            {viscosity.viscosityChangePercent}%
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Fluid Viscosity Drop</div>
        </div>
      </div>

      {/* Relationship Indicator Banner: CSS -> Viscosity -> SRP */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <span className="text-slate-400 font-bold uppercase text-[9.5px]">PHYSICAL SYSTEM COUPLING:</span>
        <div className="flex items-center gap-2 font-bold text-[11px]">
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
            <Flame className="w-3.5 h-3.5" /> CSS THERMAL STATE
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
            <Droplet className="w-3.5 h-3.5" /> OIL VISCOSITY ({viscosity.estimatedViscosityCp.toLocaleString()} cP)
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
            <Cpu className="w-3.5 h-3.5" /> SRP LIFT LOAD ({srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

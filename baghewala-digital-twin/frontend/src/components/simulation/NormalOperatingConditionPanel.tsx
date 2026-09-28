import React from 'react';
import { Panel } from '../ui/Panel';
import { useScenarioStore } from '../../simulation/scenario';
import {
  Droplet,
  TrendingUp,
  Database,
  ShieldAlert,
  Flame,
  Gauge,
} from 'lucide-react';

export const NormalOperatingConditionPanel: React.FC = () => {
  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    mobilityResult,
    productionResult,
    srpOptimizationResult,
    aiRiskResult,
  } = useScenarioStore();

  const inputs = activeScenario.inputs;

  // Derive total fluid production (BOPD / (1 - WaterCut))
  const waterCutFraction = Math.min(0.95, Math.max(0, inputs.waterCutPercent / 100));
  const bfpd = productionResult.estimatedProductionBopd / (1 - waterCutFraction);

  // Check specific risk issues
  const thermalRiskIssue = aiRiskResult.detectedIssues.find((i) => i.title.toLowerCase().includes('thermal'));
  const rodRiskIssue = aiRiskResult.detectedIssues.find((i) => i.title.toLowerCase().includes('rod') || i.title.toLowerCase().includes('viscosity'));
  const emulsionRiskIssue = aiRiskResult.detectedIssues.find((i) => i.title.toLowerCase().includes('emulsion'));
  const channelingRiskIssue = aiRiskResult.detectedIssues.find((i) => i.title.toLowerCase().includes('channeling') || i.title.toLowerCase().includes('steam'));

  return (
    <Panel
      title="Baghewala Heavy-Oil Well — Normal Operating Condition (NOC)"
      subtitle="Canonical baseline & reference operating parameters verified against Jodhpur Sandstone reservoir dynamics"
      action={
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold">
            REFERENCE NOC
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
            CANONICAL PHYSICS
          </span>
        </div>
      }
    >
      <div className="space-y-6 font-sans">
        {/* 6 Category Engineering Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* 1. THERMAL CARD */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>THERMAL STATE</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-mono font-bold border border-rose-200 dark:border-rose-900/60">
                MODEL-CALCULATED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Reservoir Matrix Temp:</span>
                <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold text-base">
                  {thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Wellhead / Well Temp:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {(thermalResult.predictedReservoirTemperatureC * 0.72).toFixed(1)} °C
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Steam Injection Temp:</span>
                <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">
                  {inputs.steamInjectionTemperatureC.toFixed(1)} °C
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-medium">
              Thermal plume boundary: <strong className="text-rose-600 dark:text-rose-400">{thermalResult.temperatureChangeC >= 0 ? `+${thermalResult.temperatureChangeC.toFixed(1)}°C heating` : `${thermalResult.temperatureChangeC.toFixed(1)}°C cooling`}</strong>
            </div>
          </div>

          {/* 2. FLUID RHEOLOGY CARD */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                <Droplet className="w-4 h-4" />
                <span>FLUID RHEOLOGY</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 text-[10px] font-mono font-bold border border-purple-200 dark:border-purple-900/60">
                MODEL-CALCULATED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Oil Viscosity:</span>
                <strong className="text-purple-600 dark:text-purple-400 font-mono font-bold text-base">
                  {viscosityResult.estimatedViscosityCp.toLocaleString()} cP
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Darcy Oil Mobility:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {mobilityResult.mobilityDcP.toFixed(4)} D/cP
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Water Cut / Condition:</span>
                <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">
                  {inputs.waterCutPercent.toFixed(1)} % (Formation)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-medium">
              Viscosity shift: <strong className="text-purple-600 dark:text-purple-400">{viscosityResult.viscosityChangePercent}%</strong> vs 50,000 cP baseline
            </div>
          </div>

          {/* 3. PRODUCTION CAPACITY CARD */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xs uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>PRODUCTION CAPACITY</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 text-[10px] font-mono font-bold border border-sky-200 dark:border-sky-900/60">
                MODEL-CALCULATED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Heavy Oil Production:</span>
                <strong className="text-sky-600 dark:text-sky-400 font-mono font-bold text-base">
                  {productionResult.estimatedProductionBopd.toFixed(2)} BOPD
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Total Fluid Inflow:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {bfpd.toFixed(2)} BFPD
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Volumetric Rate:</span>
                <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">
                  {(productionResult.estimatedProductionBopd * 0.159).toFixed(2)} m³/d
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-medium">
              Vogel heavy-oil inflow performance model active
            </div>
          </div>

          {/* 4. PUMP MECHANICS CARD */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Gauge className="w-4 h-4" />
                <span>PUMP & LIFT MECHANICS</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold border border-amber-200 dark:border-amber-900/60">
                KINEMATICS
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Pumping Speed (SPM):</span>
                <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold text-base">
                  {inputs.spm} SPM
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Stroke Length:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {inputs.strokeLengthMeters} m ({inputs.vfdFrequencyHz} Hz VFD)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">SRP Rod Load Index:</span>
                <span className={`font-mono font-bold ${srpOptimizationResult.currentCandidate.loadIndex > 80 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)} % Rating
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-medium">
              Sucker rod downhole mechanical status: <strong className="text-slate-800 dark:text-slate-200">{srpOptimizationResult.currentCandidate.isValid ? 'NORMAL ENVELOPE' : 'HIGH DRAG WARNING'}</strong>
            </div>
          </div>

          {/* 5. RESERVOIR CONTEXT CARD */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>RESERVOIR CONTEXT</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-200 dark:border-emerald-900/60">
                FIELD DATA
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Reservoir Pressure:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-base">
                  {inputs.reservoirPressureBar.toFixed(1)} bar ({(inputs.reservoirPressureBar * 14.5038).toFixed(0)} psi)
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Target Formation:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Jodhpur Sandstone
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Formation Depth:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  340 m Subsea
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-medium">
              Well reference: <strong className="text-slate-800 dark:text-slate-200">BGW-8 / Baghewala Heavy Oil</strong>
            </div>
          </div>

          {/* 6. MULTI-PHYSICS RISK CARD */}
          <div className={`p-5 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-md transition-all space-y-4 ${
            aiRiskResult.riskLevel === 'HIGH' || aiRiskResult.riskLevel === 'CRITICAL'
              ? 'border-rose-300 dark:border-rose-900/70'
              : aiRiskResult.riskLevel === 'MODERATE'
              ? 'border-amber-300 dark:border-amber-900/70'
              : 'border-emerald-300 dark:border-emerald-900/70'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${
                aiRiskResult.riskLevel === 'HIGH' || aiRiskResult.riskLevel === 'CRITICAL'
                  ? 'text-rose-600 dark:text-rose-400'
                  : aiRiskResult.riskLevel === 'MODERATE'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                <ShieldAlert className="w-4 h-4" />
                <span>MULTI-PHYSICS RISK</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                aiRiskResult.riskLevel === 'HIGH' || aiRiskResult.riskLevel === 'CRITICAL'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                  : aiRiskResult.riskLevel === 'MODERATE'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60'
              }`}>
                {aiRiskResult.riskLevel} RISK
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Thermal Dissipation:</span>
                <span className={`font-bold font-mono ${thermalRiskIssue ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {thermalRiskIssue ? 'ELEVATED' : 'NOMINAL'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Rod Viscous Drag:</span>
                <span className={`font-bold font-mono ${rodRiskIssue ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {rodRiskIssue ? 'HIGH DRAG' : 'STABLE'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Emulsion / Breakthrough:</span>
                <span className={`font-bold font-mono ${emulsionRiskIssue || channelingRiskIssue ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {emulsionRiskIssue || channelingRiskIssue ? 'MONITORED' : 'SAFE'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
              <span>Overall Safety Score:</span>
              <strong className="font-mono text-slate-800 dark:text-slate-100">{aiRiskResult.riskScore} / 100</strong>
            </div>
          </div>

        </div>
      </div>
    </Panel>
  );
};

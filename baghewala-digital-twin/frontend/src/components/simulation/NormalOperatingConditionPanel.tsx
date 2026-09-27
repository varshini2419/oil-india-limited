import React from 'react';
import { Panel } from '../ui/Panel';
import { useScenarioStore } from '../../simulation/scenario';
import { Thermometer, Droplet, TrendingUp, Zap, Database, ShieldAlert } from 'lucide-react';

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
      title="BAGHEWALA WELL — NORMAL OPERATING CONDITION"
      subtitle="Modeled baseline & reference operating parameters calculated from authoritative physics engines"
      action={
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
            [MODELED REFERENCE STATE]
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            [DEMONSTRATION DATA]
          </span>
        </div>
      }
    >
      <div className="space-y-4 font-mono text-xs">


        {/* 6 Category Engineering Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. THERMAL CARD */}
          <div className="p-3.5 bg-slate-950 rounded-lg border border-rose-950/80 hover:border-rose-900/80 transition-colors space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Thermometer className="w-4 h-4" />
                <span>THERMAL STATE</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 text-[9px] font-bold border border-rose-800/60">
                [MODEL-CALCULATED]
              </span>
            </div>

            <div className="space-y-1.5 text-slate-300 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Reservoir Temp:</span>
                <strong className="text-rose-300 font-bold text-sm">
                  {thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C
                </strong>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Wellhead / Well Temp:</span>
                <span className="text-slate-200">
                  {(thermalResult.predictedReservoirTemperatureC * 0.72).toFixed(1)} °C
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Steam Injection Temp:</span>
                <span className="text-rose-400 font-bold">
                  {inputs.steamInjectionTemperatureC.toFixed(1)} °C
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
              Thermal plume boundary: {thermalResult.temperatureChangeC >= 0 ? `+${thermalResult.temperatureChangeC.toFixed(1)}°C heating` : `${thermalResult.temperatureChangeC.toFixed(1)}°C cool`}
            </div>
          </div>

          {/* 2. FLUID RHEOLOGY CARD */}
          <div className="p-3.5 bg-slate-950 rounded-lg border border-purple-950/80 hover:border-purple-900/80 transition-colors space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Droplet className="w-4 h-4" />
                <span>FLUID RHEOLOGY</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 text-[9px] font-bold border border-purple-800/60">
                [MODEL-CALCULATED]
              </span>
            </div>

            <div className="space-y-1.5 text-slate-300 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Oil Viscosity:</span>
                <strong className="text-purple-300 font-bold text-sm">
                  {viscosityResult.estimatedViscosityCp.toLocaleString()} cP
                </strong>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Darcy Oil Mobility:</span>
                <span className="text-emerald-400 font-bold">
                  {mobilityResult.mobilityDcP.toFixed(4)} D/cP
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Water Cut / Condition:</span>
                <span className="text-sky-300 font-bold">
                  {inputs.waterCutPercent.toFixed(1)} % (Formed Water)
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
              Viscosity reduction: {viscosityResult.viscosityChangePercent}% vs 50,000 cP cold baseline
            </div>
          </div>

          {/* 3. PRODUCTION CAPACITY CARD */}
          <div className="p-3.5 bg-slate-950 rounded-lg border border-sky-950/80 hover:border-sky-900/80 transition-colors space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>PRODUCTION CAPACITY</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 text-[9px] font-bold border border-sky-800/60">
                [MODEL-CALCULATED]
              </span>
            </div>

            <div className="space-y-1.5 text-slate-300 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Heavy Oil Production:</span>
                <strong className="text-sky-300 font-bold text-sm">
                  {productionResult.estimatedProductionBopd.toFixed(2)} BOPD
                </strong>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Total Fluid Production:</span>
                <span className="text-slate-200 font-mono">
                  {bfpd.toFixed(2)} BFPD
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Volumetric Rate:</span>
                <span className="text-sky-400 font-bold">
                  {(productionResult.estimatedProductionBopd * 0.159).toFixed(2)} m³/d
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
              Vogel heavy oil inflow performance model active
            </div>
          </div>

          {/* 4. PUMP MECHANICS CARD */}
          <div className="p-3.5 bg-slate-950 rounded-lg border border-amber-950/80 hover:border-amber-900/80 transition-colors space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Zap className="w-4 h-4" />
                <span>PUMP & LIFT MECHANICS</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 text-[9px] font-bold border border-amber-800/60">
                [DEMONSTRATION DATA]
              </span>
            </div>

            <div className="space-y-1.5 text-slate-300 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pumping Speed (SPM):</span>
                <strong className="text-amber-300 font-bold text-sm">
                  {inputs.spm} SPM
                </strong>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Stroke Length:</span>
                <span className="text-slate-200">
                  {inputs.strokeLengthMeters} m ({inputs.vfdFrequencyHz} Hz VFD)
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">SRP Rod Load Index:</span>
                <span className={`font-bold ${srpOptimizationResult.currentCandidate.loadIndex > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)} % Rating
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">SRP Mechanical State:</span>
                <span className="text-slate-300 font-semibold">
                  {srpOptimizationResult.currentCandidate.isValid ? 'NORMAL ENVELOPE' : 'HIGH DRAG WARNING'}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
              Reciprocating sucker rod downhole pump mechanics
            </div>
          </div>

          {/* 5. RESERVOIR CONTEXT CARD */}
          <div className="p-3.5 bg-slate-950 rounded-lg border border-emerald-950/80 hover:border-emerald-900/80 transition-colors space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Database className="w-4 h-4" />
                <span>RESERVOIR CONTEXT</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[9px] font-bold border border-emerald-800/60">
                [REFERENCE]
              </span>
            </div>

            <div className="space-y-1.5 text-slate-300 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Reservoir Pressure:</span>
                <strong className="text-emerald-300 font-bold text-sm">
                  {inputs.reservoirPressureBar.toFixed(1)} bar ({(inputs.reservoirPressureBar * 14.5038).toFixed(0)} psi)
                </strong>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Target Formation:</span>
                <span className="text-amber-300 font-bold">
                  Jodhpur Sandstone
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Formation Depth:</span>
                <span className="text-slate-200">
                  340 m Subsea
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Well Reference:</span>
                <span className="text-sky-300 font-bold">
                  BGW-8 / Baghewala Field
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
              Documented geological reference data (SHARP D4.1)
            </div>
          </div>

          {/* 6. MULTI-PHYSICS RISK CARD */}
          <div className={`p-3.5 bg-slate-950 rounded-lg border transition-colors space-y-2.5 ${
            aiRiskResult.riskLevel === 'HIGH' || aiRiskResult.riskLevel === 'CRITICAL'
              ? 'border-rose-900/80 hover:border-rose-800'
              : aiRiskResult.riskLevel === 'MODERATE'
              ? 'border-amber-900/80 hover:border-amber-800'
              : 'border-emerald-900/80 hover:border-emerald-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className={`flex items-center gap-2 font-bold ${
                aiRiskResult.riskLevel === 'HIGH' || aiRiskResult.riskLevel === 'CRITICAL'
                  ? 'text-rose-400'
                  : aiRiskResult.riskLevel === 'MODERATE'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                <ShieldAlert className="w-4 h-4" />
                <span>MULTI-PHYSICS RISK</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                aiRiskResult.riskLevel === 'HIGH' || aiRiskResult.riskLevel === 'CRITICAL'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                  : aiRiskResult.riskLevel === 'MODERATE'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
              }`}>
                [{aiRiskResult.riskLevel} RISK]
              </span>
            </div>

            <div className="space-y-1.5 text-slate-300 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Thermal Loss Risk:</span>
                <span className={`font-bold ${thermalRiskIssue ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {thermalRiskIssue ? 'ELEVATED HEAT LOSS' : 'LOW RISK'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Rod Overload Risk:</span>
                <span className={`font-bold ${rodRiskIssue ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {rodRiskIssue ? 'HIGH VISCOUS DRAG' : 'NORMAL LOAD'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Formation Emulsion:</span>
                <span className={`font-bold ${emulsionRiskIssue ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {emulsionRiskIssue ? 'SHEAR SENSITIVE' : 'LOW RISK'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Steam Channeling:</span>
                <span className={`font-bold ${channelingRiskIssue ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {channelingRiskIssue ? 'BREAKTHROUGH RISK' : 'STABLE MATRIX'}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 flex justify-between items-center">
              <span>Overall Multi-Physics Risk Level:</span>
              <strong className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                aiRiskResult.riskLevel === 'HIGH' || aiRiskResult.riskLevel === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : aiRiskResult.riskLevel === 'MODERATE'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {aiRiskResult.riskLevel} RISK ({aiRiskResult.riskScore}/100)
              </strong>
            </div>
          </div>

        </div>
      </div>
    </Panel>
  );
};

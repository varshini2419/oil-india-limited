import React, { useState } from 'react';
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

import thermalIcon from '../../assets/flaticons/thermal.png';
import rheologyIcon from '../../assets/flaticons/rheology.png';
import productionIcon from '../../assets/flaticons/production.png';
import pumpjackIcon from '../../assets/flaticons/pumpjack.png';
import strataIcon from '../../assets/flaticons/strata.png';
import shieldIcon from '../../assets/flaticons/shield.png';

interface FlaticonCardIconProps {
  onlineUrl: string;
  localSrc: string;
  alt: string;
  fallback: React.ReactNode;
  containerClass: string;
}

const FlaticonCardIcon: React.FC<FlaticonCardIconProps> = ({
  onlineUrl,
  localSrc,
  alt,
  fallback,
  containerClass,
}) => {
  const [imgSrc, setImgSrc] = useState(onlineUrl);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc === onlineUrl) {
      setImgSrc(localSrc);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:scale-110 shrink-0 ${containerClass}`}
    >
      {!hasError ? (
        <img
          src={imgSrc}
          alt={alt}
          onError={handleError}
          className="w-full h-full object-contain filter drop-shadow-sm select-none"
          loading="eager"
        />
      ) : (
        fallback
      )}
    </div>
  );
};

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

  // Risk styling helpers
  const isHighRisk = aiRiskResult.riskLevel === 'HIGH' || aiRiskResult.riskLevel === 'CRITICAL';
  const isModerateRisk = aiRiskResult.riskLevel === 'MODERATE';

  return (
    <Panel
      title="Baghewala Heavy-Oil Well — Normal Operating Condition (NOC)"
      subtitle="Canonical baseline & reference operating parameters verified against Jodhpur Sandstone reservoir dynamics"
      action={
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 font-bold">
            REFERENCE NOC
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            CANONICAL PHYSICS
          </span>
        </div>
      }
    >
      <div className="space-y-6 font-sans">
        {/* 6 Category Engineering Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* 1. THERMAL CARD */}
          <div className="relative p-5 bg-white rounded-2xl border border-rose-200 shadow-sm hover:shadow-md transition-all space-y-4 group overflow-hidden">
            {/* Colored top accent rail */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400" />
            
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-600 font-bold text-xs uppercase tracking-wider">
                <FlaticonCardIcon
                  onlineUrl="https://cdn-icons-png.flaticon.com/128/1684/1684375.png"
                  localSrc={thermalIcon}
                  alt="Thermal State - Heat & Steam"
                  containerClass="bg-rose-50 border border-rose-200/90 shadow-sm shadow-rose-500/10"
                  fallback={<Flame className="w-4 h-4 text-rose-600" />}
                />
                <span className="font-extrabold tracking-wide text-rose-700">THERMAL STATE</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-mono font-bold border border-rose-200">
                MODEL-CALCULATED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Reservoir Matrix Temp:</span>
                <strong className="text-rose-600 font-mono font-bold text-base">
                  {thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">Wellhead / Well Temp:</span>
                <span className="font-mono font-bold text-slate-900">
                  {(thermalResult.predictedReservoirTemperatureC * 0.72).toFixed(1)} °C
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">Steam Injection Temp:</span>
                <span className="text-rose-600 font-mono font-bold">
                  {inputs.steamInjectionTemperatureC.toFixed(1)} °C
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 pt-2 border-t border-rose-100 font-medium">
              Thermal plume boundary: <strong className="text-rose-600 font-semibold">{thermalResult.temperatureChangeC >= 0 ? `+${thermalResult.temperatureChangeC.toFixed(1)}°C heating` : `${thermalResult.temperatureChangeC.toFixed(1)}°C cooling`}</strong>
            </div>
          </div>

          {/* 2. FLUID RHEOLOGY CARD */}
          <div className="relative p-5 bg-white rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-all space-y-4 group overflow-hidden">
            {/* Colored top accent rail */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-400" />

            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-600 font-bold text-xs uppercase tracking-wider">
                <FlaticonCardIcon
                  onlineUrl="https://cdn-icons-png.flaticon.com/128/31/31823.png"
                  localSrc={rheologyIcon}
                  alt="Fluid Rheology - Heavy Crude Oil Viscosity"
                  containerClass="bg-purple-50 border border-purple-200/90 shadow-sm shadow-purple-500/10"
                  fallback={<Droplet className="w-4 h-4 text-purple-600" />}
                />
                <span className="font-extrabold tracking-wide text-purple-700">FLUID RHEOLOGY</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-mono font-bold border border-purple-200">
                MODEL-CALCULATED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Oil Viscosity:</span>
                <strong className="text-purple-600 font-mono font-bold text-base">
                  {viscosityResult.estimatedViscosityCp.toLocaleString()} cP
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">Darcy Oil Mobility:</span>
                <span className="text-emerald-700 font-mono font-bold">
                  {mobilityResult.mobilityDcP.toFixed(4)} D/cP
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">Water Cut / Condition:</span>
                <span className="text-purple-700 font-mono font-bold">
                  {inputs.waterCutPercent.toFixed(1)} % (Formation)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 pt-2 border-t border-purple-100 font-medium">
              Viscosity shift: <strong className="text-purple-600 font-semibold">{viscosityResult.viscosityChangePercent}%</strong> vs 50,000 cP baseline
            </div>
          </div>

          {/* 3. PRODUCTION CAPACITY CARD */}
          <div className="relative p-5 bg-white rounded-2xl border border-sky-200 shadow-sm hover:shadow-md transition-all space-y-4 group overflow-hidden">
            {/* Colored top accent rail */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400" />

            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2.5 text-sky-600 font-bold text-xs uppercase tracking-wider">
                <FlaticonCardIcon
                  onlineUrl="https://cdn-icons-png.flaticon.com/128/1890/1890121.png"
                  localSrc={productionIcon}
                  alt="Production Capacity - Oil Barrel Output"
                  containerClass="bg-sky-50 border border-sky-200/90 shadow-sm shadow-sky-500/10"
                  fallback={<TrendingUp className="w-4 h-4 text-sky-600" />}
                />
                <span className="font-extrabold tracking-wide text-sky-700">PRODUCTION CAPACITY</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-mono font-bold border border-sky-200">
                MODEL-CALCULATED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Heavy Oil Production:</span>
                <strong className="text-sky-600 font-mono font-bold text-base">
                  {productionResult.estimatedProductionBopd.toFixed(2)} BOPD
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">Total Fluid Inflow:</span>
                <span className="font-mono font-bold text-slate-900">
                  {bfpd.toFixed(2)} BFPD
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">Volumetric Rate:</span>
                <span className="text-sky-700 font-mono font-bold">
                  {(productionResult.estimatedProductionBopd * 0.159).toFixed(2)} m³/d
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 pt-2 border-t border-sky-100 font-medium">
              Vogel heavy-oil inflow performance model active
            </div>
          </div>

          {/* 4. PUMP MECHANICS CARD */}
          <div className="relative p-5 bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all space-y-4 group overflow-hidden">
            {/* Colored top accent rail */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-400" />

            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-600 font-bold text-xs uppercase tracking-wider">
                <FlaticonCardIcon
                  onlineUrl="https://cdn-icons-png.flaticon.com/128/3977/3977739.png"
                  localSrc={pumpjackIcon}
                  alt="Pump & Lift Mechanics - Sucker Rod Pump"
                  containerClass="bg-amber-50 border border-amber-200/90 shadow-sm shadow-amber-500/10"
                  fallback={<Gauge className="w-4 h-4 text-amber-600" />}
                />
                <span className="font-extrabold tracking-wide text-amber-700">PUMP & LIFT MECHANICS</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-mono font-bold border border-amber-200">
                KINEMATICS
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Pumping Speed (SPM):</span>
                <strong className="text-amber-600 font-mono font-bold text-base">
                  {inputs.spm} SPM
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">Stroke Length:</span>
                <span className="font-mono font-bold text-slate-900">
                  {inputs.strokeLengthMeters} m ({inputs.vfdFrequencyHz} Hz VFD)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">SRP Rod Load Index:</span>
                <span className={`font-mono font-bold ${srpOptimizationResult.currentCandidate.loadIndex > 80 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)} % Rating
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 pt-2 border-t border-amber-100 font-medium">
              Sucker rod downhole mechanical status: <strong className="text-slate-900 font-semibold">{srpOptimizationResult.currentCandidate.isValid ? 'NORMAL ENVELOPE' : 'HIGH DRAG WARNING'}</strong>
            </div>
          </div>

          {/* 5. RESERVOIR CONTEXT CARD */}
          <div className="relative p-5 bg-white rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-all space-y-4 group overflow-hidden">
            {/* Colored top accent rail */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400" />

            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <FlaticonCardIcon
                  onlineUrl="https://cdn-icons-png.flaticon.com/128/8087/8087995.png"
                  localSrc={strataIcon}
                  alt="Reservoir Context - Subsurface Strata"
                  containerClass="bg-emerald-50 border border-emerald-200/90 shadow-sm shadow-emerald-500/10"
                  fallback={<Database className="w-4 h-4 text-emerald-600" />}
                />
                <span className="font-extrabold tracking-wide text-emerald-700">RESERVOIR CONTEXT</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                FIELD DATA
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Reservoir Pressure:</span>
                <strong className="text-emerald-600 font-mono font-bold text-base">
                  {inputs.reservoirPressureBar.toFixed(1)} bar ({(inputs.reservoirPressureBar * 14.5038).toFixed(0)} psi)
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">Target Formation:</span>
                <span className="font-bold text-slate-900">
                  Jodhpur Sandstone
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">Formation Depth:</span>
                <span className="font-mono font-bold text-slate-900">
                  340 m Subsea
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 pt-2 border-t border-emerald-100 font-medium">
              Well reference: <strong className="text-slate-900 font-semibold">BGW-8 / Baghewala Heavy Oil</strong>
            </div>
          </div>

          {/* 6. MULTI-PHYSICS RISK CARD */}
          <div className={`relative p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all space-y-4 group overflow-hidden ${
            isHighRisk
              ? 'border-rose-300'
              : isModerateRisk
              ? 'border-amber-300'
              : 'border-emerald-300'
          }`}>
            {/* Colored top accent rail */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
              isHighRisk
                ? 'from-rose-500 via-red-500 to-rose-600'
                : isModerateRisk
                ? 'from-amber-500 via-orange-500 to-yellow-400'
                : 'from-emerald-500 via-teal-500 to-green-400'
            }`} />

            <div className={`flex items-center justify-between border-b pb-3 ${
              isHighRisk
                ? 'border-rose-100'
                : isModerateRisk
                ? 'border-amber-100'
                : 'border-emerald-100'
            }`}>
              <div className={`flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider ${
                isHighRisk
                  ? 'text-rose-600'
                  : isModerateRisk
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}>
                <FlaticonCardIcon
                  onlineUrl="https://cdn-icons-png.flaticon.com/128/1161/1161388.png"
                  localSrc={shieldIcon}
                  alt="Multi-Physics Risk - Safety Shield"
                  containerClass={
                    isHighRisk
                      ? 'bg-rose-50 border border-rose-200/90 shadow-sm shadow-rose-500/10'
                      : isModerateRisk
                      ? 'bg-amber-50 border border-amber-200/90 shadow-sm shadow-amber-500/10'
                      : 'bg-emerald-50 border border-emerald-200/90 shadow-sm shadow-emerald-500/10'
                  }
                  fallback={<ShieldAlert className="w-4 h-4" />}
                />
                <span className={`font-extrabold tracking-wide ${
                  isHighRisk
                    ? 'text-rose-700'
                    : isModerateRisk
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}>MULTI-PHYSICS RISK</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                isHighRisk
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isModerateRisk
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {aiRiskResult.riskLevel} RISK
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Thermal Dissipation:</span>
                <span className={`font-bold font-mono ${thermalRiskIssue ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {thermalRiskIssue ? 'ELEVATED' : 'NOMINAL'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">Rod Viscous Drag:</span>
                <span className={`font-bold font-mono ${rodRiskIssue ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {rodRiskIssue ? 'HIGH DRAG' : 'STABLE'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="text-slate-600">Emulsion / Breakthrough:</span>
                <span className={`font-bold font-mono ${emulsionRiskIssue || channelingRiskIssue ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {emulsionRiskIssue || channelingRiskIssue ? 'MONITORED' : 'SAFE'}
                </span>
              </div>
            </div>

            <div className={`text-[11px] pt-2 border-t flex justify-between items-center ${
              isHighRisk
                ? 'border-rose-100 text-slate-600'
                : isModerateRisk
                ? 'border-amber-100 text-slate-600'
                : 'border-emerald-100 text-slate-600'
            }`}>
              <span>Overall Safety Score:</span>
              <strong className="font-mono text-slate-900 font-bold">{aiRiskResult.riskScore} / 100</strong>
            </div>
          </div>

        </div>
      </div>
    </Panel>
  );
};

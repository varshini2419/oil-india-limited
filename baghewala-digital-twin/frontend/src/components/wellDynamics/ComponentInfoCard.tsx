import React from 'react';
import type { WellComponentId, WellPhenomenon } from '../../types/wellDynamics';
import { getComponentInfo } from '../../config/wellDynamicsComponents';
import { useScenarioStore } from '../../simulation/scenario';
import { Info, Activity, Layers, X } from 'lucide-react';

interface ComponentInfoCardProps {
  componentId: WellComponentId | null;
  phenomenon: WellPhenomenon;
  onClose?: () => void;
}

export const ComponentInfoCard: React.FC<ComponentInfoCardProps> = ({
  componentId,
  phenomenon,
  onClose
}) => {
  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    productionResult,
    srpOptimizationResult
  } = useScenarioStore();

  if (!componentId) return null;

  const comp = getComponentInfo(componentId);

  const getLiveValue = (label: string): string => {
    const l = label.toLowerCase();
    if (l.includes('spm')) return `${activeScenario.inputs.spm.toFixed(1)} SPM`;
    if (l.includes('vfd') || l.includes('frequency')) return `${activeScenario.inputs.vfdFrequencyHz.toFixed(1)} Hz`;
    if (l.includes('stroke')) return `${activeScenario.inputs.strokeLengthMeters.toFixed(2)} m`;
    if (l.includes('temp')) return `${(thermalResult?.predictedReservoirTemperatureC || activeScenario.inputs.reservoirTemperatureC).toFixed(1)} °C`;
    if (l.includes('viscosity')) return `${(viscosityResult?.estimatedViscosityCp || 5000).toFixed(0)} cP`;
    if (l.includes('production') || l.includes('rate') || l.includes('bopd')) return `${(productionResult?.estimatedProductionBopd || 140).toFixed(1)} BOPD`;
    if (l.includes('steam')) return `${activeScenario.inputs.steamInjectionRateTpd.toFixed(0)} tpd`;
    if (l.includes('load')) return `${(srpOptimizationResult?.currentCandidate?.loadIndex || 65).toFixed(0)} %`;
    return 'Active';
  };

  const isAffectedByPhenomenon = phenomenon.affectedComponents.some((c) =>
    c.toLowerCase().includes(comp.name.toLowerCase().split(' ')[0]) ||
    comp.name.toLowerCase().includes(c.toLowerCase().split(' ')[0])
  );

  return (
    <div className="bg-slate-900/95 border border-sky-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md font-mono text-xs space-y-3 ring-1 ring-sky-500/20 relative animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400" />
          <h3 className="font-bold text-white text-xs">{comp.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 uppercase font-bold">
            {comp.depthLabel}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Function Description */}
      <div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
          PRIMARY FUNCTION
        </span>
        <p className="text-slate-300 leading-relaxed text-[11px] bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
          {comp.functionDescription}
        </p>
      </div>

      {/* Condition under Active Phenomenon */}
      <div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
          STATUS UNDER {phenomenon.title.toUpperCase()}
        </span>
        <div
          className={`p-2.5 rounded border text-[11px] leading-relaxed ${
            isAffectedByPhenomenon
              ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
          }`}
        >
          {isAffectedByPhenomenon ? (
            <span className="flex items-start gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>AFFECTED REGION:</strong> Phenomenon impact active on this component. Driven by {phenomenon.triggerCondition}.
              </span>
            </span>
          ) : (
            <span className="flex items-start gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>STABLE OPERATING REGIME:</strong> {comp.normalCondition}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Live Simulation Parameters */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            LIVE CONNECTED METRICS
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
            SCENARIOSTORE SOLVER
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {comp.relevantValues.map((valLabel, idx) => (
            <div
              key={idx}
              className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between text-[10px]"
            >
              <span className="text-slate-400 truncate pr-1">{valLabel}:</span>
              <span className="text-sky-300 font-bold">{getLiveValue(valLabel)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import type { PhenomenonId, WellComponentId } from '../types/wellDynamics';
import { getPhenomenonById } from '../config/wellDynamicsPhenomena';
import { PhenomenaSelector } from '../components/wellDynamics/PhenomenaSelector';
import { WellVisualizationCanvas } from '../components/wellDynamics/WellVisualizationCanvas';
import { PhenomenaExplanationPanel } from '../components/wellDynamics/PhenomenaExplanationPanel';
import { useScenarioStore } from '../simulation/scenario';
import type { ScenarioInputValues } from '../simulation/scenario/types';
import { Activity, Database, Sliders, PlayCircle, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';

export const WellDynamicsPage: React.FC = () => {
  const [selectedPhenomenonId, setSelectedPhenomenonId] = useState<PhenomenonId>('normal_operation');
  const [selectedComponentId, setSelectedComponentId] = useState<WellComponentId | null>(null);

  const activePhenomenon = getPhenomenonById(selectedPhenomenonId);

  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    productionResult,
    updateInput,
    resetCurrentToBaseline
  } = useScenarioStore();

  // Synchronize ScenarioStore active inputs whenever selectedPhenomenonId changes
  useEffect(() => {
    const phenom = getPhenomenonById(selectedPhenomenonId);
    if (phenom && phenom.inputPreset) {
      Object.entries(phenom.inputPreset).forEach(([key, value]) => {
        updateInput(key as keyof ScenarioInputValues, value as number);
      });
    }
  }, [selectedPhenomenonId, updateInput]);

  // Recommended Evaluator Demo Flow Sequence
  const DEMO_STEPS: { step: number; id: PhenomenonId; label: string }[] = [
    { step: 1, id: 'normal_operation', label: 'STEP 1: Normal' },
    { step: 2, id: 'temperature_thermal', label: 'STEP 2: Thermal EOR' },
    { step: 3, id: 'high_viscosity', label: 'STEP 3: High Viscosity' },
    { step: 4, id: 'rod_overload', label: 'STEP 4: Rod Overload' },
    { step: 5, id: 'motor_pump_overload', label: 'STEP 5: Motor Overload' }
  ];

  const currentStepIndex = DEMO_STEPS.findIndex((s) => s.id === selectedPhenomenonId);

  const handleNextStep = () => {
    const nextIdx = currentStepIndex >= 0 && currentStepIndex < DEMO_STEPS.length - 1 ? currentStepIndex + 1 : 0;
    setSelectedPhenomenonId(DEMO_STEPS[nextIdx].id);
    setSelectedComponentId(null);
  };

  const handleReset = () => {
    resetCurrentToBaseline();
    setSelectedPhenomenonId('normal_operation');
    setSelectedComponentId(null);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto min-h-screen font-mono">
      {/* Page Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Activity className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-wide">
              WELL DYNAMICS
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              PHYSICS DRIVEN
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interactive 2.5D simulation of oil-well equipment, fluid behavior and reservoir phenomena.
          </p>
        </div>

        {/* Governance & Safety Disclaimers Bar */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-400 border border-amber-800/80 font-bold">
            DEMO MODE
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-955 text-slate-300 border border-slate-800 font-bold">
            REAL FIELD DATA: NOT CONNECTED
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            0 PHYSICAL ACTUATION PERMITTED
          </span>
        </div>
      </div>

      {/* Recommended Evaluator Demo Flow Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-sky-400 animate-pulse" />
          <span className="text-slate-300 font-bold text-xs uppercase tracking-wider">
            RECOMMENDED EVALUATOR DEMO FLOW:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {DEMO_STEPS.map((stepItem) => {
            const isActive = selectedPhenomenonId === stepItem.id;
            return (
              <button
                key={stepItem.id}
                onClick={() => {
                  setSelectedPhenomenonId(stepItem.id);
                  setSelectedComponentId(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-500 text-slate-955 font-black shadow-md ring-2 ring-sky-400/50'
                    : 'bg-slate-955 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{stepItem.label}</span>
              </button>
            );
          })}

          <button
            onClick={handleNextStep}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-955 font-bold text-xs transition-colors flex items-center gap-1 ml-2 shadow-sm"
            title="Advance to next recommended demo phenomenon"
          >
            <span>NEXT STEP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors flex items-center gap-1 ml-1"
            title="Reset active scenario to reference baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>RESET</span>
          </button>
        </div>

        {/* Active Scenario Metrics Quick View */}
        <div className="flex items-center gap-3 text-[11px] bg-slate-955 px-3 py-1 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">State:</span>
            <span className="text-sky-300 font-bold">{activePhenomenon.title}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Temp/Visc:</span>
            <span className="text-amber-300 font-bold">
              {(thermalResult?.predictedReservoirTemperatureC || activeScenario.inputs.reservoirTemperatureC).toFixed(1)}°C / {(viscosityResult?.estimatedViscosityCp || 5000).toFixed(0)} cP
            </span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="text-emerald-400 font-bold">
            {(productionResult?.estimatedProductionBopd || 140).toFixed(1)} BOPD
          </div>
        </div>
      </div>

      {/* Main Interactive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Phenomena Selector */}
        <div className="lg:col-span-4">
          <PhenomenaSelector
            selectedId={selectedPhenomenonId}
            onSelect={(id) => {
              setSelectedPhenomenonId(id);
              setSelectedComponentId(null);
            }}
          />
        </div>

        {/* Center Column (8 cols): Interactive Canvas Visualizer */}
        <div className="lg:col-span-8">
          <WellVisualizationCanvas
            phenomenon={activePhenomenon}
            selectedComponentId={selectedComponentId}
            onSelectComponent={(comp) => setSelectedComponentId(comp)}
          />
        </div>
      </div>

      {/* Bottom Full-Width Explanation & Component Panel */}
      <PhenomenaExplanationPanel
        phenomenon={activePhenomenon}
        selectedComponentId={selectedComponentId}
        onClearComponentSelection={() => setSelectedComponentId(null)}
      />
    </div>
  );
};

export default WellDynamicsPage;

import React, { useEffect } from 'react';
import type { WellPhenomenon, WellComponentId } from '../../types/wellDynamics';
import { ComponentInfoCard } from './ComponentInfoCard';
import { useScenarioStore } from '../../simulation/scenario';
import { useVoiceNarration } from '../../utils/speechSynthesis';
import {
  HelpCircle,
  Cpu,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface PhenomenaExplanationPanelProps {
  phenomenon: WellPhenomenon;
  selectedComponentId: WellComponentId | null;
  onClearComponentSelection?: () => void;
}

export const PhenomenaExplanationPanel: React.FC<PhenomenaExplanationPanelProps> = ({
  phenomenon,
  selectedComponentId,
  onClearComponentSelection
}) => {
  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    productionResult,
    srpOptimizationResult
  } = useScenarioStore();

  const {
    isSupported,
    isSpeaking,
    isPaused,
    activeSectionIndex,
    speakSections,
    pause,
    resume,
    stop
  } = useVoiceNarration();

  // Stop voice narration whenever the user switches phenomenon or component selection
  useEffect(() => {
    stop();
  }, [phenomenon.id, selectedComponentId, stop]);

  // Live ScenarioStore Parameters formatting
  const currentTemp = (thermalResult?.predictedReservoirTemperatureC || activeScenario.inputs.reservoirTemperatureC).toFixed(1);
  const currentViscosity = (viscosityResult?.estimatedViscosityCp || 5000).toFixed(0);
  const currentSpm = activeScenario.inputs.spm.toFixed(1);
  const currentStroke = activeScenario.inputs.strokeLengthMeters.toFixed(2);
  const currentSteam = activeScenario.inputs.steamInjectionRateTpd.toFixed(0);
  const currentVfd = activeScenario.inputs.vfdFrequencyHz.toFixed(1);
  const currentBopd = (productionResult?.estimatedProductionBopd || 140).toFixed(1);
  const currentLoad = (srpOptimizationResult?.currentCandidate?.loadIndex || 65).toFixed(0);

  const getLiveValueForParam = (paramName: string): string => {
    const lower = paramName.toLowerCase();
    if (lower.includes('temperature') || lower.includes('temp')) return `${currentTemp} °C`;
    if (lower.includes('viscosity')) return `${currentViscosity} cP`;
    if (lower.includes('spm') || lower.includes('speed')) return `${currentSpm} SPM`;
    if (lower.includes('steam')) return `${currentSteam} tpd`;
    if (lower.includes('vfd') || lower.includes('frequency')) return `${currentVfd} Hz`;
    if (lower.includes('stroke')) return `${currentStroke} m`;
    if (lower.includes('load')) return `${currentLoad} %`;
    return 'Active';
  };

  const exp = phenomenon.explanationText;

  // Prepare concise 4-part narration scripts using live ScenarioStore values
  const narrationSections = [
    // Section 0: What is happening
    `${phenomenon.title}. What is happening: ${exp.whatIsHappening}`,
    // Section 1: Why it is happening
    `Why it is happening: ${exp.whyItIsHappening}`,
    // Section 2: Parameters responsible & Live simulation state
    `Current simulated conditions: Reservoir temperature is ${currentTemp} degrees Celsius, Crude viscosity is ${currentViscosity} centipoise, Pumping speed is ${currentSpm} strokes per minute, Output rate is ${currentBopd} BOPD.`,
    // Section 3: Expected simulated effect
    `Expected simulated effect: ${exp.expectedSimulatedEffect}`
  ];

  const handleStartNarration = () => {
    speakSections(narrationSections);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Component Info Card Overlay if a component is selected */}
      {selectedComponentId && (
        <ComponentInfoCard
          componentId={selectedComponentId}
          phenomenon={phenomenon}
          onClose={onClearComponentSelection}
        />
      )}

      {/* Main Phenomenon Explanation Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
        {/* Header Bar with Voice Narration Controls */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">
              ENGINEERING EXPLANATION & VOICE NARRATION
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700 font-bold uppercase">
              {phenomenon.title}
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-bold uppercase">
              CALCULATED SIMULATION DYNAMICS
            </span>
          </div>

          {/* Voice Controls Bar */}
          <div className="flex items-center gap-2 bg-slate-955 p-1.5 rounded-lg border border-slate-800">
            {!isSupported ? (
              <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold px-2">
                <VolumeX className="w-3.5 h-3.5" />
                Voice narration unavailable in this browser
              </span>
            ) : (
              <>
                {!isSpeaking && (
                  <button
                    onClick={handleStartNarration}
                    className="flex items-center gap-1.5 px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded transition-colors shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    EXPLAIN
                  </button>
                )}

                {isSpeaking && !isPaused && (
                  <button
                    onClick={pause}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors shadow-sm"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    PAUSE
                  </button>
                )}

                {isSpeaking && isPaused && (
                  <button
                    onClick={resume}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded transition-colors shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    RESUME
                  </button>
                )}

                {isSpeaking && (
                  <button
                    onClick={stop}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded transition-colors"
                    title="Stop Narration"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    STOP
                  </button>
                )}

                {/* Status Indicator Pill */}
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 text-[10px]">
                  {isSpeaking ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                      <Volume2 className="w-3.5 h-3.5" />
                      {isPaused ? 'PAUSED' : `NARRATING SECTION ${(activeSectionIndex ?? 0) + 1}/4...`}
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                      READY FOR VOICE NARRATION
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CAUSAL CHAIN DIAGRAM BAR */}
        <div className="bg-slate-955 p-3 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-sky-400" /> PHYSICAL CAUSAL CHAIN:
          </span>
          <div className="flex items-center gap-2 text-[10px] text-slate-300 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-sky-400">INPUT PARAMETERS</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-orange-400">PHYSICAL CHANGE</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-amber-400">EQUIPMENT LOAD</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-purple-400">FLUID MOBILITY</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-emerald-400">PRODUCTION RATE</span>
          </div>
        </div>

        {/* Grid of 4 Synchronized Explanation Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Section 0: What is Happening */}
          <div
            className={`p-3.5 rounded-lg border flex flex-col gap-2 transition-all duration-300 ${
              activeSectionIndex === 0
                ? 'bg-sky-950/40 border-sky-500 shadow-md ring-2 ring-sky-500/40'
                : 'bg-slate-955/80 border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-2 font-bold text-sky-300 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                1. WHAT IS HAPPENING?
              </span>
              {activeSectionIndex === 0 && (
                <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider animate-pulse">
                  ● NARRATING
                </span>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {exp.whatIsHappening}
            </p>
          </div>

          {/* Section 1: Why it is Happening */}
          <div
            className={`p-3.5 rounded-lg border flex flex-col gap-2 transition-all duration-300 ${
              activeSectionIndex === 1
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/40'
                : 'bg-slate-955/80 border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-2 font-bold text-emerald-300 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                2. WHY IS IT HAPPENING?
              </span>
              {activeSectionIndex === 1 && (
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider animate-pulse">
                  ● NARRATING
                </span>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {exp.whyItIsHappening}
            </p>
          </div>

          {/* Section 2: Which Parameters are Responsible & Live ScenarioStore Values */}
          <div
            className={`p-3.5 rounded-lg border flex flex-col gap-2 transition-all duration-300 ${
              activeSectionIndex === 2
                ? 'bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-500/40'
                : 'bg-slate-955/80 border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-2 font-bold text-amber-300 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                3. PARAMETERS RESPONSIBLE & LIVE STORE METRICS
              </span>
              {activeSectionIndex === 2 && (
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider animate-pulse">
                  ● NARRATING
                </span>
              )}
            </div>
            <ul className="space-y-1.5 text-[11px]">
              {exp.parametersResponsible.map((param, idx) => (
                <li key={idx} className="flex items-center justify-between text-slate-300 bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                  <span className="truncate pr-2">{param}</span>
                  <span className="text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/50 text-[10px]">
                    {getLiveValueForParam(param)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Expected Simulated Effect */}
          <div
            className={`p-3.5 rounded-lg border flex flex-col gap-2 transition-all duration-300 ${
              activeSectionIndex === 3
                ? 'bg-purple-950/40 border-purple-500 shadow-md ring-2 ring-purple-500/40'
                : 'bg-slate-955/80 border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-2 font-bold text-purple-300 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                4. EXPECTED SIMULATED EFFECT
              </span>
              {activeSectionIndex === 3 && (
                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider animate-pulse">
                  ● NARRATING
                </span>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {exp.expectedSimulatedEffect}
            </p>

            <div className="mt-auto pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span>Calculated Production Output:</span>
              <span className="text-emerald-400 font-bold text-xs">
                {currentBopd} BOPD
              </span>
            </div>
          </div>
        </div>

        {/* Affected Components & Safety Governance Bar */}
        <div className="bg-slate-955 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400 font-bold text-[11px]">AFFECTED WELL COMPONENTS:</span>
            <div className="flex flex-wrap gap-1.5">
              {phenomenon.affectedComponents.map((comp, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-800 text-[10px] font-bold">
                  {comp}
                </span>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulated engineering commentary — decision support only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

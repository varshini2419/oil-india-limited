import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  AlertTriangle,
  Flame,
  Zap,
} from 'lucide-react';
import type { DigitalTwinState, WhatIfInputs, WhatIfResult } from '../../simulation/realtimeMonitoring/types';
import type { ModelMode } from '../../simulation/historicalCalibration/types';
import { runWhatIfSimulation } from '../../simulation/realtimeMonitoring/whatIfEngine';

interface WhatIfSimulationPanelProps {
  currentState: DigitalTwinState;
  modelMode: ModelMode;
}

export const WhatIfSimulationPanel: React.FC<WhatIfSimulationPanelProps> = ({
  currentState,
  modelMode,
}) => {
  const [inputs, setInputs] = useState<WhatIfInputs>({
    reservoirTemperatureC: currentState.reservoir.reservoirTemperatureC,
    steamInjectionRateTpd: currentState.css.steamInjectionRateTpd,
    vfdFrequencyHz: currentState.srp.vfdFrequencyHz,
    spm: currentState.srp.spm,
    strokeLengthMeters: currentState.srp.strokeLengthMeters,
    effectiveDrawdownBar: 30.0,
    steamQualityPercent: currentState.css.steamQualityPercent,
  });

  const [activeTab, setActiveTab] = useState<'controls' | 'causality' | 'uncertainty'>('controls');

  const whatIfResult: WhatIfResult = runWhatIfSimulation(currentState, inputs, modelMode);

  const handleInputChange = (key: keyof WhatIfInputs, val: number) => {
    setInputs((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const resetWhatIf = () => {
    setInputs({
      reservoirTemperatureC: currentState.reservoir.reservoirTemperatureC,
      steamInjectionRateTpd: currentState.css.steamInjectionRateTpd,
      vfdFrequencyHz: currentState.srp.vfdFrequencyHz,
      spm: currentState.srp.spm,
      strokeLengthMeters: currentState.srp.strokeLengthMeters,
      effectiveDrawdownBar: 30.0,
      steamQualityPercent: currentState.css.steamQualityPercent,
    });
  };

  const { isFeasible, validationMessage, violations, whatIfState, deltas, uncertainty } =
    whatIfResult;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5 font-mono text-xs">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              INTERACTIVE WHAT-IF SIMULATION ENGINE
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Simulate operational parameter changes and evaluate real-time physics responses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetWhatIf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors font-bold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET TO LIVE</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('controls')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'controls'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          SIMULATION CONTROLS
        </button>
        <button
          onClick={() => setActiveTab('causality')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'causality'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          RESPONSE CAUSALITY FLOW
        </button>
        <button
          onClick={() => setActiveTab('uncertainty')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'uncertainty'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          WHAT-IF UNCERTAINTY (P10/P50/P90)
        </button>
      </div>

      {/* Out of Model Range Warning Banner */}
      {!isFeasible && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300 space-y-1">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationMessage}</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-300/90 pl-1">
            {violations.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* TAB 1: Controls & Live Comparison */}
      {activeTab === 'controls' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Input 1: Temp */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                RESERVOIR TEMP (°C)
              </label>
              <input
                type="number"
                min={30}
                max={150}
                step={0.5}
                value={inputs.reservoirTemperatureC ?? 48.0}
                onChange={(e) => handleInputChange('reservoirTemperatureC', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:border-indigo-500/50 focus:outline-none"
              />
              <div className="text-[10px] text-slate-400 mt-1">Live: {currentState.reservoir.reservoirTemperatureC}°C</div>
            </div>

            {/* Input 2: Steam Rate */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                STEAM RATE (TPD)
              </label>
              <input
                type="number"
                min={0}
                max={250}
                value={inputs.steamInjectionRateTpd ?? 80.0}
                onChange={(e) => handleInputChange('steamInjectionRateTpd', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:border-indigo-500/50 focus:outline-none"
              />
              <div className="text-[10px] text-slate-400 mt-1">Live: {currentState.css.steamInjectionRateTpd} TPD</div>
            </div>

            {/* Input 3: VFD */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                VFD FREQ (Hz)
              </label>
              <input
                type="number"
                min={30}
                max={65}
                value={inputs.vfdFrequencyHz ?? 50.0}
                onChange={(e) => handleInputChange('vfdFrequencyHz', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:border-indigo-500/50 focus:outline-none"
              />
              <div className="text-[10px] text-slate-400 mt-1">Live: {currentState.srp.vfdFrequencyHz} Hz</div>
            </div>

            {/* Input 4: SPM */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                PUMP SPEED (SPM)
              </label>
              <input
                type="number"
                min={2}
                max={15}
                value={inputs.spm ?? 8.0}
                onChange={(e) => handleInputChange('spm', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:border-indigo-500/50 focus:outline-none"
              />
              <div className="text-[10px] text-slate-400 mt-1">Live: {currentState.srp.spm} SPM</div>
            </div>
          </div>

          {/* Current vs What-If Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-bold">MODELED PRODUCTION</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-slate-400 text-xs">Live: {currentState.production.estimatedProductionBopd.toFixed(1)}</span>
                <span className="text-emerald-400 font-bold text-base">
                  {whatIfState.production.estimatedProductionBopd.toFixed(1)} BOPD
                </span>
              </div>
              <div className="text-[11px] font-bold mt-1">
                Delta:{' '}
                <span className={deltas.estimatedProductionBopd >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {deltas.estimatedProductionBopd >= 0 ? `+${deltas.estimatedProductionBopd}` : deltas.estimatedProductionBopd} BOPD
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-bold">HEAVY-OIL VISCOSITY</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-slate-400 text-xs">Live: {currentState.reservoir.estimatedViscosityCp.toFixed(0)}</span>
                <span className="text-slate-200 font-bold text-base">
                  {whatIfState.reservoir.estimatedViscosityCp.toFixed(0)} cP
                </span>
              </div>
              <div className="text-[11px] font-bold mt-1">
                Delta:{' '}
                <span className={deltas.estimatedViscosityCp <= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {deltas.estimatedViscosityCp >= 0 ? `+${deltas.estimatedViscosityCp}` : deltas.estimatedViscosityCp} cP
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-bold">SRP LOAD INDEX</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-slate-400 text-xs">Live: {currentState.srp.srpLoadIndex.toFixed(1)}</span>
                <span className="text-slate-200 font-bold text-base">
                  {whatIfState.srp.srpLoadIndex.toFixed(1)}/100
                </span>
              </div>
              <div className="text-[11px] font-bold mt-1">
                Delta:{' '}
                <span className={deltas.srpLoadIndex <= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                  {deltas.srpLoadIndex >= 0 ? `+${deltas.srpLoadIndex}` : deltas.srpLoadIndex}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-bold">RISK PROFILE</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-slate-400 text-xs">Live: {currentState.risk.riskLevel}</span>
                <span className="text-slate-200 font-bold text-base">
                  {whatIfState.risk.riskLevel} ({whatIfState.risk.riskScore})
                </span>
              </div>
              <div className="text-[11px] font-bold mt-1">
                Delta:{' '}
                <span className={deltas.riskScore <= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                  {deltas.riskScore >= 0 ? `+${deltas.riskScore}` : deltas.riskScore} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Causality Diagram */}
      {activeTab === 'causality' && (
        <div className="space-y-4">
          <div className="text-slate-300 text-[11px] font-sans leading-relaxed">
            The Digital Twin links operational inputs through physical deterministic relationships:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chain A: Thermal & Viscosity */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase text-[11px] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>THERMAL & MOBILITY RECOVERY CHAIN</span>
              </h4>
              <div className="flex flex-col gap-1.5 text-[11px] text-slate-300 font-mono">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="font-bold text-slate-200">Steam Input:</span> {inputs.steamInjectionRateTpd} TPD @ {currentState.css.steamQualityPercent}% Quality
                </div>
                <div className="text-center text-emerald-400 font-bold">↓ Thermal Enthalpy Absorption</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="font-bold text-slate-200">Reservoir Temp:</span> {whatIfState.reservoir.reservoirTemperatureC}°C (Thermal Gain: +{whatIfState.css.thermalGainC}°C)
                </div>
                <div className="text-center text-emerald-400 font-bold">↓ Arrhenius Viscosity Reduction</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="font-bold text-slate-200">Heavy-Oil Viscosity:</span> {whatIfState.reservoir.estimatedViscosityCp.toFixed(1)} cP
                </div>
                <div className="text-center text-emerald-400 font-bold">↓ Darcy Transmissibility Increase</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="font-bold text-emerald-400">Oil Production:</span> {whatIfState.production.estimatedProductionBopd.toFixed(1)} BOPD
                </div>
              </div>
            </div>

            {/* Chain B: Mechanical Pumping */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-cyan-400 uppercase text-[11px] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>SRP MECHANICAL PUMPING CHAIN</span>
              </h4>
              <div className="flex flex-col gap-1.5 text-[11px] text-slate-300 font-mono">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="font-bold text-slate-200">Drive Control:</span> {inputs.vfdFrequencyHz} Hz VFD | {inputs.spm} SPM | {inputs.strokeLengthMeters}m Stroke
                </div>
                <div className="text-center text-cyan-400 font-bold">↓ Downhole Pump Displacement</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="font-bold text-slate-200">SRP Mechanical Load:</span> {whatIfState.srp.srpLoadIndex.toFixed(1)}/100 (Status: {whatIfState.srp.operatingStatus})
                </div>
                <div className="text-center text-cyan-400 font-bold">↓ Drawdown Pressure Differential</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="font-bold text-cyan-400">AI Operational Risk:</span> {whatIfState.risk.riskLevel} ({whatIfState.risk.riskScore}/100)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Uncertainty Analysis */}
      {activeTab === 'uncertainty' && (
        <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-indigo-300 uppercase text-[11px]">
              MONTE CARLO UNCERTAINTY EXPECTATION (STEP 5.3 INTEGRATION)
            </h4>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
              CONFIDENCE: {uncertainty.confidence}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">P10 LOW CASE</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {uncertainty.p10ProductionBopd.toFixed(1)} BOPD
              </div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">P50 MEDIAN CASE</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {uncertainty.p50ProductionBopd.toFixed(1)} BOPD
              </div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">P90 HIGH CASE</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {uncertainty.p90ProductionBopd.toFixed(1)} BOPD
              </div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">MEAN & STD DEV</div>
              <div className="text-xs font-bold text-slate-300 mt-0.5">
                {uncertainty.meanProductionBopd.toFixed(1)} ± {uncertainty.stdDevProductionBopd.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

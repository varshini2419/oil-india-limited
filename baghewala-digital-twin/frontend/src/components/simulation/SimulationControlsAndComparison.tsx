import React, { useState, useEffect, useRef } from 'react';
import { Panel } from '../ui/Panel';
import { useScenarioStore, compareScenarios, BASELINE_INPUT_VALUES, type ScenarioInputValues } from '../../simulation/scenario';
import { Thermometer, Zap, Wind, Droplet, RotateCcw, Play, CheckCircle2, ArrowRight } from 'lucide-react';

export const SimulationControlsAndComparison: React.FC = () => {
  const {
    activeScenario,
    presets,
    updateInput,
    resetCurrentToBaseline,
    loadPreset,
    commitSimulationRun,
    thermalResult,
    viscosityResult,
    mobilityResult,
    productionResult,
    srpOptimizationResult,
    aiRiskResult,
  } = useScenarioStore();

  const [localInputs, setLocalInputs] = useState<ScenarioInputValues>(activeScenario.inputs);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local inputs when activeScenario inputs change externally (presets, reset)
  useEffect(() => {
    setLocalInputs(activeScenario.inputs);
  }, [activeScenario.inputs]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const inputs = localInputs;
  const comparisons = compareScenarios(BASELINE_INPUT_VALUES, inputs);

  const [simulationStatusMsg, setSimulationStatusMsg] = useState<string | null>(null);

  const handleSliderChange = (key: keyof ScenarioInputValues, val: number) => {
    // 1. Instant local state update (<1ms, 60 FPS smooth dragging)
    setLocalInputs((prev) => ({ ...prev, [key]: val }));

    // 2. Debounced propagation to scenario store
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      updateInput(key, val);
    }, 120);
  };

  const handleRunSimulation = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    // Flush all local input values to store
    (Object.keys(localInputs) as Array<keyof ScenarioInputValues>).forEach((key) => {
      updateInput(key, localInputs[key]);
    });
    commitSimulationRun();
    setSimulationStatusMsg('Simulation recalculated successfully across all physics engines.');
    setTimeout(() => setSimulationStatusMsg(null), 4000);
  };

  const handleReset = () => {
    resetCurrentToBaseline();
    setSimulationStatusMsg('Reset to baseline reference parameters.');
    setTimeout(() => setSimulationStatusMsg(null), 3000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* SECTION 4: SIMULATION CONTROLS PANEL */}
      <Panel
        className="simulation-reveal"
        title="SIMULATION CONTROLS & BOUNDARY PARAMETERS"
        subtitle="Adjust weather, reservoir thermal state, steam injection, and artificial lift setpoints to evaluate well performance"
        action={
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => loadPreset(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[11px] text-sky-300 font-bold focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="">-- LOAD DEMO SCENARIO PRESET --</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET TO REFERENCE</span>
            </button>

            <button
              onClick={handleRunSimulation}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN SIMULATION</span>
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {simulationStatusMsg && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 rounded text-emerald-300 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{simulationStatusMsg}</span>
            </div>
          )}



          {/* 4 Control Group Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* 1. WEATHER & AMBIENT BOUNDARY */}
            <div className="simulation-card p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <Wind className="w-4 h-4" />
                  <span>SURFACE WEATHER</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                  [BOUNDARY]
                </span>
              </div>

              {/* Ambient Temp Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Ambient Temp (°C):</span>
                  <strong className="text-sky-300">{inputs.ambientTemperatureC} °C</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="55"
                  step="1"
                  value={inputs.ambientTemperatureC}
                  onChange={(e) => handleSliderChange('ambientTemperatureC', parseFloat(e.target.value))}
                  className="simulation-range w-full accent-sky-500 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              {/* Relative Humidity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Humidity (%):</span>
                  <strong className="text-sky-300">{inputs.humidityPercent} %</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={inputs.humidityPercent}
                  onChange={(e) => handleSliderChange('humidityPercent', parseFloat(e.target.value))}
                  className="simulation-range w-full accent-sky-500 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              {/* Wind Speed Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Wind Speed (km/h):</span>
                  <strong className="text-sky-300">{inputs.windSpeedKmh} km/h</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="2"
                  value={inputs.windSpeedKmh}
                  onChange={(e) => handleSliderChange('windSpeedKmh', parseFloat(e.target.value))}
                  className="simulation-range w-full accent-sky-500 bg-slate-900 rounded cursor-pointer"
                />
              </div>
              
              <div className="text-[9px] text-slate-500 italic border-t border-slate-900 pt-1">
                Surface boundary heat loss: {((inputs.ambientTemperatureC - 35) * 0.12 + inputs.windSpeedKmh * 0.05).toFixed(1)} kW modeled dissipation
              </div>
            </div>

            {/* 2. THERMAL & STEAM INJECTION */}
            <div className="simulation-card p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <Thermometer className="w-4 h-4" />
                  <span>THERMAL & STEAM</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  [THERMAL]
                </span>
              </div>

              {/* Reservoir Temp Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Reservoir Temp (°C):</span>
                  <strong className="text-rose-300">{inputs.reservoirTemperatureC} °C</strong>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="1"
                  value={inputs.reservoirTemperatureC}
                  onChange={(e) => handleSliderChange('reservoirTemperatureC', parseFloat(e.target.value))}
                  className="simulation-range w-full accent-rose-500 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              {/* Steam Rate Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Steam Rate (TPD):</span>
                  <strong className="text-rose-300">{inputs.steamInjectionRateTpd} t/day</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={inputs.steamInjectionRateTpd}
                  onChange={(e) => handleSliderChange('steamInjectionRateTpd', parseFloat(e.target.value))}
                  className="simulation-range w-full accent-rose-500 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              {/* Steam Quality Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Steam Quality (%):</span>
                  <strong className="text-rose-300">{inputs.steamQualityPercent} %</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={inputs.steamQualityPercent}
                  onChange={(e) => handleSliderChange('steamQualityPercent', parseFloat(e.target.value))}
                  className="simulation-range w-full accent-rose-500 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              <div className="text-[9px] text-slate-500 italic border-t border-slate-900 pt-1">
                Calculated matrix temp: {thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C
              </div>
            </div>

            {/* 3. ARTIFICIAL LIFT & PUMP MECHANICS */}
            <div className="simulation-card p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>SRP LIFT CONTROL</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  [SRP LIFT]
                </span>
              </div>

              {/* SPM Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Pumping Speed (SPM):</span>
                  <strong className="text-amber-300">{inputs.spm} SPM</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={inputs.spm}
                  onChange={(e) => handleSliderChange('spm', parseFloat(e.target.value))}
                  className="simulation-range w-full accent-amber-500 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              {/* Stroke Length Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Stroke Length (m):</span>
                  <strong className="text-amber-300">{inputs.strokeLengthMeters} m</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.5"
                  step="0.1"
                  value={inputs.strokeLengthMeters}
                  onChange={(e) => handleSliderChange('strokeLengthMeters', parseFloat(e.target.value))}
                  className="simulation-range w-full accent-amber-500 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              {/* VFD Frequency Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">VFD Frequency (Hz):</span>
                  <strong className="text-amber-300">{inputs.vfdFrequencyHz} Hz</strong>
                </div>
                <input
                  type="range"
                  min="15"
                  max="65"
                  step="1"
                  value={inputs.vfdFrequencyHz}
                  onChange={(e) => handleSliderChange('vfdFrequencyHz', parseFloat(e.target.value))}
                  className="simulation-range w-full accent-amber-500 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              <div className="text-[9px] text-slate-500 italic border-t border-slate-900 pt-1">
                SRP Rod Load Index: {srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)} %
              </div>
            </div>

            {/* 4. FLUID PROPERTIES & WATER CUT */}
            <div className="simulation-card p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                  <Droplet className="w-4 h-4" />
                  <span>FLUID & WATER CUT</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  [FLUIDS]
                </span>
              </div>

              {/* Water Cut Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Water Cut (%):</span>
                  <strong className="text-purple-300">{inputs.waterCutPercent} %</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="2"
                  value={inputs.waterCutPercent}
                  onChange={(e) => handleSliderChange('waterCutPercent', parseFloat(e.target.value))}
                  className="simulation-range w-full accent-purple-500 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              {/* Calculated Viscosity Readout */}
              <div className="p-2 bg-slate-900 rounded border border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Viscosity:</span>
                  <strong className="text-purple-300">{viscosityResult.estimatedViscosityCp.toLocaleString()} cP</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Darcy Mobility:</span>
                  <strong className="text-emerald-400">{mobilityResult.mobilityDcP.toFixed(4)} D/cP</strong>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 italic border-t border-slate-900 pt-1">
                Vogel Heavy Oil IPR Rate: {productionResult.estimatedProductionBopd.toFixed(2)} BOPD
              </div>
            </div>

          </div>
        </div>
      </Panel>

      {/* SECTION 5: BEFORE / AFTER SIMULATION RESULTS COMPARISON */}
      <Panel
        className="simulation-reveal"
        title="BEFORE vs AFTER SIMULATION RESULTS COMPARISON"
        subtitle="Direct comparative delta evaluation between Baseline Reference Scenario vs Active Simulated Scenario"
      >
        <div className="space-y-4 font-mono text-xs">
          
          {/* Delta Grid Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Metric 1: Reservoir Temperature */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Reservoir Temperature</span>
                <span className="text-rose-400 font-bold">[THERMAL]</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Baseline: <strong className="text-slate-400">48.0 °C</strong></span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Simulated: <strong className="text-rose-300">{thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C</strong></span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-1">
                <span>Delta: <strong className="text-rose-400">{thermalResult.temperatureChangeC >= 0 ? `+${thermalResult.temperatureChangeC.toFixed(1)}°C` : `${thermalResult.temperatureChangeC.toFixed(1)}°C`}</strong></span>
                <span>Thermal expansion halo</span>
              </div>
            </div>

            {/* Metric 2: Oil Viscosity */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Crude Oil Viscosity</span>
                <span className="text-purple-400 font-bold">[RHEOLOGY]</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Baseline: <strong className="text-slate-400">50,000 cP</strong></span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Simulated: <strong className="text-purple-300">{viscosityResult.estimatedViscosityCp.toLocaleString()} cP</strong></span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-1">
                <span>Delta: <strong className="text-purple-400">{viscosityResult.viscosityChangePercent}%</strong></span>
                <span>Eyring exponential thinning</span>
              </div>
            </div>

            {/* Metric 3: Darcy Oil Mobility */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Darcy Oil Mobility</span>
                <span className="text-emerald-400 font-bold">[INFLOW]</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Baseline: <strong className="text-slate-400">0.0003 D/cP</strong></span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Simulated: <strong className="text-emerald-300">{mobilityResult.mobilityDcP.toFixed(4)} D/cP</strong></span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-1">
                <span>Delta: <strong className="text-emerald-400">+{mobilityResult.mobilityChangePercent}%</strong></span>
                <span>Matrix permeability gain</span>
              </div>
            </div>

            {/* Metric 4: Heavy Oil Production */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Heavy Oil Production</span>
                <span className="text-sky-400 font-bold">[PRODUCTION]</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Baseline: <strong className="text-slate-400">0.69 BOPD</strong></span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Simulated: <strong className="text-sky-300">{productionResult.estimatedProductionBopd.toFixed(2)} BOPD</strong></span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-1">
                <span>Delta: <strong className="text-sky-400">+{productionResult.productionChangePercent}%</strong></span>
                <span>Vogel IPR inflow response</span>
              </div>
            </div>

            {/* Metric 5: SRP Rod Load Index */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>SRP Rod Load Index</span>
                <span className="text-amber-400 font-bold">[MECHANICAL]</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Baseline: <strong className="text-slate-400">42 %</strong></span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Simulated: <strong className="text-amber-300">{srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)} %</strong></span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-1">
                <span>Delta: <strong className="text-amber-400">{(srpOptimizationResult.currentCandidate.loadIndex - 42).toFixed(0)} %</strong></span>
                <span>Reciprocating rod drag</span>
              </div>
            </div>

            {/* Metric 6: Multi-Physics Risk Index */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Multi-Physics Risk</span>
                <span className="text-rose-400 font-bold">[RISK ENGINE]</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Baseline: <strong className="text-emerald-400">LOW (12/100)</strong></span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span className={`font-bold ${aiRiskResult.riskLevel === 'HIGH' ? 'text-rose-400' : (aiRiskResult.riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400')}`}>
                  {aiRiskResult.riskLevel} ({aiRiskResult.riskScore}/100)
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-1">
                <span>Issues Identified: <strong className="text-slate-300">{aiRiskResult.detectedIssues.length}</strong></span>
                <span>Multi-hazard evaluation</span>
              </div>
            </div>

          </div>

          {/* Detailed Parameter Comparison Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Parameter</th>
                  <th className="p-2.5">Baseline Reference</th>
                  <th className="p-2.5">Active Simulation</th>
                  <th className="p-2.5">Delta (Δ)</th>
                  <th className="p-2.5">Physical Mechanism Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono">
                {comparisons.map((c) => (
                  <tr key={c.parameter} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-2.5 font-bold text-sky-300">{c.label}</td>
                    <td className="p-2.5 text-slate-400">{c.baselineValue} {c.unit}</td>
                    <td className="p-2.5 text-slate-200 font-bold">{c.scenarioValue} {c.unit}</td>
                    <td className={`p-2.5 font-bold ${c.delta > 0 ? 'text-rose-400' : (c.delta < 0 ? 'text-emerald-400' : 'text-slate-500')}`}>
                      {c.delta > 0 ? `+${c.delta}` : c.delta} {c.unit}
                    </td>
                    <td className="p-2.5 text-slate-400 font-sans text-xs">
                      {c.parameter === 'reservoirTemperatureC' && 'Thermal expansion reduces crude viscosity via Andrade Eyring relationship.'}
                      {c.parameter === 'steamInjectionRateTpd' && 'Alters daily enthalpy input rate to matrix and steam chamber crest.'}
                      {c.parameter === 'spm' && 'Shifts sucker rod mechanical fatigue cycle and polished rod peak load.'}
                      {c.parameter === 'vfdFrequencyHz' && 'Directly scales surface pumping unit stroke velocity.'}
                      {c.parameter === 'ambientTemperatureC' && 'Surface thermal boundary condition affecting wellhead heat loss.'}
                      {!['reservoirTemperatureC', 'steamInjectionRateTpd', 'spm', 'vfdFrequencyHz', 'ambientTemperatureC'].includes(c.parameter) && 'Operational setpoint modification propagated through model solver.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </Panel>

    </div>
  );
};

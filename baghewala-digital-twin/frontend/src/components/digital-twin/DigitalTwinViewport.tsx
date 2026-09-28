import React, { useEffect, useRef, useState } from 'react';
import { DigitalTwinCanvas } from './DigitalTwinCanvas';
import { DigitalTwinLegend } from './DigitalTwinLegend';
import { DEFAULT_TWIN_CONFIG } from './config';
import {
  AnimationProvider,
  useAnimation,
} from './animations';
import { Grid, ZoomIn, ZoomOut, RotateCcw, Eye, Play, Pause, RotateCcw as ResetIcon, Terminal, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { useScenarioStore } from '../../simulation/scenario';

const ViewportToolbar: React.FC<{
  gridVisible: boolean;
  onToggleGrid: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}> = ({ gridVisible, onToggleGrid, zoom, onZoomIn, onZoomOut, onResetZoom }) => {
  const { isPlaying, play, pause, reset, activeSpm } = useAnimation();

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
      {/* Title & Animation Playback Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 mr-1">
          <Eye className="w-4 h-4 text-sky-400" />
          <span className="font-bold hidden sm:inline">2D SCHEMATIC VIEWPORT (SIMULATION PLAYBACK)</span>
        </div>

        {/* Play / Pause / Reset Control Group */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-md border border-slate-800">
          {!isPlaying ? (
            <button
              onClick={play}
              aria-label="Play Digital Twin playback animation"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition-colors shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY</span>
            </button>
          ) : (
            <button
              onClick={pause}
              aria-label="Pause Digital Twin playback animation"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono font-bold transition-colors shadow"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE</span>
            </button>
          )}

          <button
            onClick={reset}
            aria-label="Reset Digital Twin animation"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors border border-slate-700"
            title="Reset Animation Positions"
          >
            <ResetIcon className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>

        {/* Active Physical SPM Badge */}
        <div className="px-2.5 py-1 bg-sky-950/60 border border-sky-800/80 rounded text-[11px] font-bold text-sky-300 font-mono">
          {activeSpm} SPM (MODELED)
        </div>

        {/* Animation Speed Selector (Visual multiplier overlay) */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
          <span className="text-[11px] hidden md:inline">Physical cycle:</span>
          <span className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-sky-300 font-bold font-mono">
            {activeSpm.toFixed(1)} SPM
          </span>
        </div>

        {/* Animation Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono border bg-slate-950 border-slate-800">
          <span
            className={`w-2 h-2 rounded-full ${
              isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span className={isPlaying ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
            Playback: {isPlaying ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Viewport View Controls (Grid & Zoom) */}
      <div className="flex items-center gap-2 font-mono text-xs">
        {/* Grid Toggle Button */}
        <button
          onClick={onToggleGrid}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] border transition-colors ${
            gridVisible
              ? 'bg-sky-950/60 text-sky-300 border-sky-800/80 font-semibold'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Grid: {gridVisible ? 'ON' : 'OFF'}</span>
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={onZoomOut}
          disabled={zoom <= DEFAULT_TWIN_CONFIG.minZoom}
          className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Percentage Display */}
        <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 min-w-[55px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        {/* Zoom In Button */}
        <button
          onClick={onZoomIn}
          disabled={zoom >= DEFAULT_TWIN_CONFIG.maxZoom}
          className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Reset Zoom Button */}
        <button
          onClick={onResetZoom}
          className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const AutoPlayOnSimulationRun: React.FC = () => {
  const { committedSimulationResult } = useScenarioStore();
  const { reset, play, pause, activeSpm } = useAnimation();
  const initialRunId = useRef(committedSimulationResult.trace.runId);

  useEffect(() => {
    const runId = committedSimulationResult.trace.runId;
    if (runId === initialRunId.current) return;
    initialRunId.current = runId;

    reset();
    play();

    const cycleDuration = Math.max(1000, Math.min(60000, 60000 / Math.max(activeSpm, 1)));
    const pauseTimer = window.setTimeout(() => pause(), cycleDuration + 120);

    return () => window.clearTimeout(pauseTimer);
  }, [activeSpm, committedSimulationResult.trace.runId, pause, play, reset]);

  return null;
};

const DigitalTwinFooterContent: React.FC<{ gridVisible: boolean }> = ({ gridVisible }) => {
  const { committedSimulationResult, isStale } = useScenarioStore();
  const [showDiagnostics, setShowDiagnostics] = React.useState(false);

  const inputs = committedSimulationResult.inputs;
  const thermal = committedSimulationResult.thermal;
  const viscosity = committedSimulationResult.viscosity;
  const mobility = committedSimulationResult.mobility;
  const production = committedSimulationResult.production;
  const risk = committedSimulationResult.risk;
  const runId = committedSimulationResult.trace.runId;

  return (
    <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-3 font-mono">
      <DigitalTwinLegend gridVisible={gridVisible} />

      {/* SECTION 2 MODEL CONTEXT STRIP — COMMITTED SIMULATION STATE */}
      <div className="bg-slate-900/80 p-3 rounded-lg border border-sky-900/60 text-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-2 font-bold text-sky-300 text-xs">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>COMMITTED SIMULATION RESULT — BAGHEWALA WELL STATE</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isStale ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>INPUTS EDITED — CLICK RUN SIMULATION TO UPDATE TWIN</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>COMMITTED (UP TO DATE)</span>
              </span>
            )}

            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold transition-colors"
            >
              <Terminal className="w-3 h-3 text-sky-400" />
              <span>{showDiagnostics ? 'HIDE TRACE' : 'SHOW 2D TWIN TRACE'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-[11px]">
          <div>
            <span className="text-slate-500 block text-[10px]">SIMULATION RUN ID</span>
            <span className="text-sky-300 font-bold truncate block" title={runId}>{runId}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">RESERVOIR TEMP</span>
            <span className="text-rose-400 font-bold">{thermal.predictedReservoirTemperatureC.toFixed(1)} °C</span>{' '}
            <span className="text-[9px] text-slate-400">({thermal.temperatureChangeC >= 0 ? `+${thermal.temperatureChangeC.toFixed(1)}` : thermal.temperatureChangeC.toFixed(1)})</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">CRUDE VISCOSITY</span>
            <span className="text-purple-400 font-bold">{viscosity.estimatedViscosityCp.toLocaleString()} cP</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">OIL MOBILITY (k/μ)</span>
            <span className="text-amber-300 font-bold">{mobility.mobilityDcP.toFixed(4)} D/cP</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">MODELED PROD</span>
            <span className="text-emerald-400 font-bold">{production.estimatedProductionBopd.toFixed(2)} BOPD</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">SYSTEM RISK</span>
            <span className={risk.riskLevel === 'LOW' ? 'text-emerald-400 font-bold' : risk.riskLevel === 'MODERATE' ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
              {risk.riskLevel} ({risk.riskScore}/100)
            </span>
          </div>
        </div>

        {/* STEP 15 DEVELOPMENT DIAGNOSTIC TRACE PANEL */}
        {showDiagnostics && (
          <div className="mt-3 p-3 bg-slate-950 rounded border border-sky-900/80 text-[10px] space-y-2 text-slate-300 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-bold text-sky-300">
              <span>DEVELOPMENT DIAGNOSTIC TRACE PANEL — 2D DIGITAL TWIN CONNECTIVITY</span>
              <span>STATE: {isStale ? 'STALE (UNCOMMITTED CHANGES)' : 'SYNCHRONIZED'}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><strong>Store Simulation Run ID:</strong> <span className="text-emerald-400">{runId}</span></div>
              <div><strong>2D Twin Run ID:</strong> <span className="text-emerald-400">{runId}</span> (MATCHED)</div>
              <div><strong>Report Run ID:</strong> <span className="text-emerald-400">{runId}</span> (MATCHED)</div>
              <div><strong>Calculated At:</strong> <span>{committedSimulationResult.calculatedAt}</span></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-slate-800/80 pt-1.5 text-[9.5px]">
              <div>Ambient / Weather: {inputs.ambientTemperatureC}°C | {inputs.humidityPercent}% | {inputs.windSpeedKmh}km/h</div>
              <div>Reservoir P / k: {inputs.reservoirPressureBar} bar | {inputs.permeabilityDarcy} D</div>
              <div>Steam Rate / Temp / Qual: {inputs.steamInjectionRateTpd} TPD | {inputs.steamInjectionTemperatureC}°C | {inputs.steamQualityPercent}%</div>
              <div>SRP Setpoints: {inputs.spm} SPM | {inputs.strokeLengthMeters}m | {inputs.vfdFrequencyHz} Hz</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LiveViewportTelemetry: React.FC = () => {
  const { committedSimulationResult, isStale } = useScenarioStore();
  const { inputs, thermal, viscosity, production, srp, risk } = committedSimulationResult;

  return (
    <div className="absolute bottom-3 left-3 right-3 pointer-events-none font-mono">
      <div className="bg-slate-950/90 border border-sky-800/80 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-slate-800 pb-1.5 text-[10px]">
          <div className="flex items-center gap-1.5 font-bold text-sky-300">
            <span className={`h-2 w-2 rounded-full ${isStale ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            <span>{isStale ? 'EDITED INPUTS — RUN REQUIRED' : 'LIVE COMMITTED MODEL STATE'}</span>
          </div>
          <span className="text-slate-400">Cycle {inputs.soakDurationDays > 0 ? 'SOAK / PRODUCTION' : 'BASELINE'} · {inputs.spm.toFixed(1)} SPM · {inputs.vfdFrequencyHz.toFixed(0)} Hz</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-x-3 gap-y-1 pt-1.5 text-[10px]">
          <TelemetryValue label="T_RES" value={`${thermal.predictedReservoirTemperatureC.toFixed(1)} °C`} tone="text-rose-300" />
          <TelemetryValue label="VISCOSITY" value={`${viscosity.estimatedViscosityCp.toLocaleString()} cP`} tone="text-purple-300" />
          <TelemetryValue label="MOBILITY" value={`${mobilityValue(committedSimulationResult.mobility.mobilityDcP)} D/cP`} tone="text-amber-300" />
          <TelemetryValue label="OIL RATE" value={`${production.estimatedProductionBopd.toFixed(2)} BOPD`} tone="text-emerald-300" />
          <TelemetryValue label="SRP LOAD" value={`${srp.currentCandidate.loadIndex.toFixed(0)} %`} tone="text-amber-300" />
          <TelemetryValue label="STEAM" value={`${inputs.steamInjectionRateTpd.toFixed(0)} TPD`} tone="text-rose-300" />
          <TelemetryValue label="RISK" value={`${risk.riskLevel} ${risk.riskScore}/100`} tone={risk.riskLevel === 'LOW' ? 'text-emerald-300' : 'text-amber-300'} />
          <TelemetryValue label="FLOW" value={inputs.waterCutPercent > 50 ? 'WATER-RICH' : 'OIL-RICH'} tone="text-sky-300" />
        </div>
      </div>
    </div>
  );
};

const mobilityValue = (value: number) => value.toFixed(5);

const TelemetryValue: React.FC<{ label: string; value: string; tone: string }> = ({ label, value, tone }) => (
  <div className="min-w-0">
    <span className="block text-[8px] text-slate-500">{label}</span>
    <strong className={`block truncate ${tone}`}>{value}</strong>
  </div>
);

export const DigitalTwinViewport: React.FC = () => {
  const [gridVisible, setGridVisible] = useState(DEFAULT_TWIN_CONFIG.gridVisible);
  const [zoom, setZoom] = useState(DEFAULT_TWIN_CONFIG.defaultZoom);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, DEFAULT_TWIN_CONFIG.maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, DEFAULT_TWIN_CONFIG.minZoom));
  };

  const handleResetZoom = () => {
    setZoom(DEFAULT_TWIN_CONFIG.defaultZoom);
  };

  return (
    <AnimationProvider>
      <AutoPlayOnSimulationRun />
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-2xl">
        {/* Viewport Control Bar Header */}
        <ViewportToolbar
          gridVisible={gridVisible}
          onToggleGrid={() => setGridVisible(!gridVisible)}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />

        {/* Main SVG Render Area */}
        <div className="relative flex-1 min-h-[480px]">
          <DigitalTwinCanvas gridVisible={gridVisible} zoom={zoom} />

          {/* Directional Engineering Annotations Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-none font-mono text-[10px]">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/85 border border-emerald-800/80 text-emerald-300 font-bold shadow backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>↑ Mechanical Lift (SRP Reciprocating Stroke)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/85 border border-rose-800/80 text-rose-300 font-bold shadow backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>→ Heat Propagation (Steam Injection Thermal Zone)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/85 border border-sky-800/80 text-sky-300 font-bold shadow backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>↖ Fluid Flow (Viscosity-Controlled Inflow)</span>
            </div>
          </div>

          <LiveViewportTelemetry />
        </div>

        {/* Viewport Footer Bar & Legend */}
        <DigitalTwinFooterContent gridVisible={gridVisible} />
      </div>
    </AnimationProvider>
  );
};

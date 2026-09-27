import React from 'react';
import type { PilotState } from '../../simulation/productionPilot/types';
import { Activity, ShieldCheck, Thermometer, Gauge, Flame, Droplets, GaugeCircle } from 'lucide-react';

interface Props {
  pilotState: PilotState;
}

export const LiveWellStatusPanel: React.FC<Props> = ({ pilotState }) => {
  const telemetry = pilotState.lastTelemetry;
  const prediction = pilotState.lastPrediction;
  const isLive = pilotState.status === 'LIVE';

  if (!telemetry) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-400 text-sm">
        No active well telemetry ingested yet. Click PLAY or STEP to stream live demonstration telemetry.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              LIVE WELL TELEMETRY: <span className="font-mono text-cyan-400">{pilotState.wellId}</span>
            </h3>
            <p className="text-xs text-slate-400">Real-Time Ingestion & Physical State Monitoring</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${
              isLive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            {isLive ? 'STATUS: LIVE' : 'STATUS: PAUSED'}
          </span>
          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            {telemetry.source ?? 'DEMONSTRATION_TELEMETRY'}
          </span>
        </div>
      </div>

      {/* Grid of Real-Time Parameters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Thermometer className="w-3 h-3 text-red-400" /> Res Temp
          </div>
          <div className="text-sm font-semibold text-slate-100 font-mono">
            {Number.isNaN(telemetry.reservoirTemperatureC) ? 'NaN' : `${telemetry.reservoirTemperatureC}°C`}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Pred: {prediction?.predictedTemperatureC ?? 58}°C</div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Gauge className="w-3 h-3 text-cyan-400" /> Res Press
          </div>
          <div className="text-sm font-semibold text-slate-100 font-mono">
            {Number.isNaN(telemetry.reservoirPressureBar) ? 'NaN' : `${telemetry.reservoirPressureBar} bar`}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Pred: {prediction?.predictedPressureBar ?? 48} bar</div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Flame className="w-3 h-3 text-amber-400" /> Steam Rate
          </div>
          <div className="text-sm font-semibold text-slate-100 font-mono">
            {telemetry.steamInjectionRateTPD} TPD
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Qual: {telemetry.steamQualityPct}%</div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Droplets className="w-3 h-3 text-blue-400" /> Water Cut
          </div>
          <div className="text-sm font-semibold text-slate-100 font-mono">
            {telemetry.waterCutPct}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Pred: {prediction?.predictedWaterCutPct ?? 20}%</div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <GaugeCircle className="w-3 h-3 text-purple-400" /> SPM
          </div>
          <div className="text-sm font-semibold text-slate-100 font-mono">
            {telemetry.pumpingSpeedSPM}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Stroke: {telemetry.strokeLengthM}m</div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Activity className="w-3 h-3 text-emerald-400" /> Actual BOPD
          </div>
          <div className="text-sm font-semibold text-emerald-400 font-mono">
            {telemetry.observedProductionBOPD < 0 ? `${telemetry.observedProductionBOPD} (INV)` : `${telemetry.observedProductionBOPD} BOPD`}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Telemetry Input</div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Activity className="w-3 h-3 text-blue-400" /> Predicted
          </div>
          <div className="text-sm font-semibold text-blue-400 font-mono">
            {prediction?.predictedProductionBOPD ?? 0.75} BOPD
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Physics Model</div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" /> Quality
          </div>
          <div className={`text-xs font-semibold uppercase font-mono ${
            pilotState.lastValidation?.status === 'VALID' ? 'text-emerald-400' : pilotState.lastValidation?.status === 'WARNING' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {pilotState.lastValidation?.status ?? 'VALID'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{telemetry.latencyMs ?? 120}ms latency</div>
        </div>
      </div>
    </div>
  );
};

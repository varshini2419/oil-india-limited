import React from 'react';
import { useTelemetryFluctuation } from './useTelemetryFluctuation';
import { Thermometer, Flame, CloudRain, Gauge, Droplet, ArrowRight, Activity } from 'lucide-react';

export const ThermalReservoirMonitoring: React.FC = () => {
  const tel = useTelemetryFluctuation();

  const points = tel.resTempHistory;
  const minTemp = Math.min(...points);
  const maxTemp = Math.max(...points);
  const avgTemp = Number((points.reduce((a, b) => a + b, 0) / points.length).toFixed(1));

  // Chart SVG dimensions
  const svgW = 500;
  const svgH = 140;
  const pad = 30;
  const scaleX = (i: number) => pad + (i / (points.length - 1)) * (svgW - 2 * pad);
  const minV = Math.min(...points) - 0.5;
  const maxV = Math.max(...points) + 0.5;
  const scaleY = (v: number) => svgH - pad - ((v - minV) / (maxV - minV || 1)) * (svgH - 2 * pad);

  const pathD = points.reduce((acc, v, i) => {
    const px = scaleX(i).toFixed(1);
    const py = scaleY(v).toFixed(1);
    return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
  }, '');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-xl space-y-5">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
          <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
          <span>THERMAL & RESERVOIR MONITORING WORKSTATION</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 font-bold">
          JODHPUR HEAVY OIL THERMAL PLUME
        </span>
      </div>

      {/* Grid: Parameter Cards & Thermal Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: 6 Thermal Parameters */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* 1. Reservoir Temperature */}
          <div className="bg-slate-950 border border-rose-900/60 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-bold">
              <span>RESERVOIR TEMP</span>
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-bold text-rose-400">{tel.resTemp.toFixed(1)} °C</div>
            <div className="text-[9px] text-rose-300 font-semibold">{tel.resTempDelta} vs base</div>
          </div>

          {/* 2. Steam Injection Temp */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-bold">
              <span>STEAM INJ TEMP</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-400">{tel.steamTemp.toFixed(0)} °C</div>
            <div className="text-[9px] text-slate-500">Boiler Setpoint</div>
          </div>

          {/* 3. Steam Quality */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-bold">
              <span>STEAM QUALITY</span>
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl font-bold text-sky-400">{tel.steamQuality.toFixed(1)}%</div>
            <div className="text-[9px] text-sky-300 font-semibold">{tel.steamQualityDelta}</div>
          </div>

          {/* 4. Reservoir Pressure */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-bold">
              <span>RESERVOIR PRESS</span>
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-indigo-400">{tel.resPressure.toFixed(0)} bar</div>
            <div className="text-[9px] text-slate-500">Formation Pressure</div>
          </div>

          {/* 5. Crude Viscosity */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-bold">
              <span>CRUDE VISCOSITY</span>
              <Droplet className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-purple-400">{tel.viscosity.toLocaleString(undefined, { maximumFractionDigits: 1 })} cP</div>
            <div className="text-[9px] text-purple-300 font-semibold">{tel.viscosityDelta}</div>
          </div>

          {/* 6. Delta T & Timestep Delta */}
          <div className="bg-slate-950 border border-emerald-900/60 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-bold">
              <span>THERMAL DELTA ΔT</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400">ΔT = {tel.deltaSteamRes.toFixed(0)} °C</div>
            <div className="text-[9px] text-emerald-300 font-semibold">ΔT(timestep) = {tel.deltaTimestep}</div>
          </div>
        </div>

        {/* Right: Section 5 Inlet / Outlet Temperature Balance Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
            <span className="font-bold text-slate-200">TEMPERATURE BALANCE FLOW</span>
            <span className="text-[10px] text-sky-400 font-bold">FLUID HEAT LOSS</span>
          </div>

          {/* Flow Diagram */}
          <div className="flex items-center justify-between gap-1 text-center font-bold">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-rose-800 flex-1">
              <span className="text-[9px] text-rose-400 block uppercase">INLET STEAM</span>
              <span className="text-sm text-white block mt-0.5">{tel.steamTemp.toFixed(0)} °C</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="bg-slate-900 p-2.5 rounded-xl border border-amber-800 flex-1">
              <span className="text-[9px] text-amber-400 block uppercase">RESERVOIR</span>
              <span className="text-sm text-white block mt-0.5">{tel.resTemp.toFixed(1)} °C</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="bg-slate-900 p-2.5 rounded-xl border border-emerald-800 flex-1">
              <span className="text-[9px] text-emerald-400 block uppercase">PRODUCED</span>
              <span className="text-sm text-white block mt-0.5">{tel.producedFluidTemp.toFixed(1)} °C</span>
            </div>
          </div>

          {/* Gradient Summary */}
          <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
            <div>
              <span className="text-slate-400 block">Steam→Res ΔT</span>
              <strong className="text-rose-400">{tel.deltaSteamRes.toFixed(1)} °C</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Res→Fluid ΔT</span>
              <strong className="text-amber-400">{tel.deltaResProduced.toFixed(1)} °C</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Total Gradient</span>
              <strong className="text-emerald-400">{tel.totalGradient.toFixed(1)} °C</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Live Temperature Trend Line Chart */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>RESERVOIR TEMPERATURE — LIVE TIMESTEP TRAJECTORY</span>
          </div>
          <div className="flex items-center gap-3 text-[10.5px]">
            <span>Current: <strong className="text-rose-400">{tel.resTemp.toFixed(1)} °C</strong></span>
            <span>Min: <strong className="text-slate-300">{minTemp.toFixed(1)} °C</strong></span>
            <span>Max: <strong className="text-slate-300">{maxTemp.toFixed(1)} °C</strong></span>
            <span>Avg: <strong className="text-sky-400">{avgTemp.toFixed(1)} °C</strong></span>
          </div>
        </div>

        <div className="relative h-[110px] w-full flex items-center justify-center">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
            <line x1={pad} y1={svgH - pad} x2={svgW - pad} y2={svgH - pad} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
            <path d={pathD} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            {points.map((v, idx) => (
              <circle
                key={idx}
                cx={scaleX(idx)}
                cy={scaleY(v)}
                r="3.5"
                fill={idx === points.length - 1 ? '#f43f5e' : '#fda4af'}
                stroke="#1e293b"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

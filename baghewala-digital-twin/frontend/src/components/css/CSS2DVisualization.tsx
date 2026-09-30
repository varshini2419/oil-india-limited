import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { useAnimation } from '../digital-twin/animations';
import { Flame, Play, Pause, RotateCcw } from 'lucide-react';

export const CSS2DVisualization: React.FC = () => {
  const { committedSimulationResult } = useScenarioStore();
  const { isPlaying, play, pause, reset, progress } = useAnimation();

  const inputs = committedSimulationResult.inputs;
  const thermal = committedSimulationResult.thermal;
  const viscosity = committedSimulationResult.viscosity;
  const mobility = committedSimulationResult.mobility;

  const steamRateTpd = inputs.steamInjectionRateTpd;
  const steamTempC = inputs.steamInjectionTemperatureC;
  const resTempC = thermal.predictedReservoirTemperatureC;
  const viscCp = viscosity.estimatedViscosityCp;
  const mobDcP = mobility.mobilityDcP;

  // Dynamic radius of thermal plume (scaled by steam rate & temperature)
  const thermalPlumeRadius = Math.max(30, Math.min(130, (steamRateTpd / 140) * 110 + (resTempC - 30) * 0.8));
  // Pulse animation phase
  const pulseScale = 1 + Math.sin(progress * Math.PI * 2) * 0.06;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col font-mono">
      {/* Schematic Header Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-rose-400">
          <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>2D CSS THERMAL INJECTION & HEAVY-OIL RECOVERY SCHEMATIC</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-bold">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-rose-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="text-rose-400">
              STEAM INJECTION ({steamRateTpd.toFixed(0)} TPD @ {steamTempC.toFixed(0)}°C)
            </span>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {isPlaying ? (
              <button
                onClick={pause}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                title="Pause Animation"
              >
                <Pause className="w-3 h-3 fill-current" />
                <span>PAUSE</span>
              </button>
            ) : (
              <button
                onClick={play}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                title="Play Animation"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>PLAY</span>
              </button>
            )}
            <button
              onClick={reset}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-colors cursor-pointer"
              title="Reset Animation"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main SVG Render Area */}
      <div className="relative bg-slate-950 w-full h-[430px] flex items-center justify-center overflow-hidden">
        {/* Background Engineering Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
          <defs>
            <pattern id="cssGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f43f5e" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cssGrid)" />
        </svg>

        {/* 2D CSS Schematic SVG */}
        <svg viewBox="0 0 600 450" className="w-full h-full max-h-[430px] z-10">
          <defs>
            {/* Gradients */}
            <radialGradient id="thermalPlumeGrad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#fb923c" stopOpacity="0.65" />
              <stop offset="75%" stopColor="#eab308" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="steamGenGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>

            <linearGradient id="heavyOilZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="40%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          {/* Ground Surface Line */}
          <line x1="20" y1="180" x2="580" y2="180" stroke="#475569" strokeWidth="2" strokeDasharray="4,4" />
          <text x="30" y="172" fill="#64748b" fontSize="10" fontFamily="monospace" fontWeight="bold">
            SURFACE GRADE (0.0 m)
          </text>

          {/* JODHPUR SANDSTONE RESERVOIR ZONE */}
          <rect x="40" y="180" width="520" height="250" fill="url(#heavyOilZoneGrad)" stroke="#334155" strokeWidth="1.5" />
          <text x="50" y="200" fill="#64748b" fontSize="10" fontFamily="monospace" fontWeight="bold">
            JODHPUR SANDSTONE FORMATION
          </text>
          <text x="50" y="214" fill="#fb923c" fontSize="9" fontFamily="monospace">
            Heavy Oil Matrix (Initial 48°C, ~25,000 cP)
          </text>

          {/* 1. SURFACE STEAM GENERATOR & BOILER */}
          <rect x="60" y="100" width="70" height="70" rx="6" fill="url(#steamGenGrad)" stroke="#fda4af" strokeWidth="1.5" />
          <rect x="70" y="112" width="50" height="18" fill="#0f172a" rx="3" />
          <text x="74" y="124" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">
            STEAM GEN
          </text>
          <text x="68" y="148" fill="#ffe4e6" fontSize="8" fontFamily="monospace">
            {steamRateTpd.toFixed(0)} TPD Steam
          </text>
          <text x="68" y="158" fill="#fecdd3" fontSize="8" fontFamily="monospace">
            {inputs.steamQualityPercent.toFixed(0)}% Quality
          </text>

          {/* Boiler Chimney Smoke / Heat Vapor */}
          <line x1="95" y1="100" x2="95" y2="80" stroke="#fda4af" strokeWidth="4" strokeLinecap="round" />
          {isPlaying && (
            <circle cx="95" cy="72" r="5" fill="#f43f5e" opacity="0.6" className="animate-ping" />
          )}

          {/* Surface Steam Piping to Injection Well */}
          <path d="M 130 135 L 200 135 L 200 180" fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray="4,2" />

          {/* 2. INJECTION WELL CASING & WELLHEAD */}
          <rect x="186" y="165" width="28" height="20" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="2" />
          <text x="175" y="160" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">
            INJECTION WELL
          </text>
          <rect x="194" y="180" width="12" height="240" fill="#020617" stroke="#e11d48" strokeWidth="1.5" />

          {/* Animated Steam Injection Flow inside Injection Wellbore */}
          {isPlaying && (
            <g>
              <line x1="200" y1="180" x2="200" y2="340" stroke="#fda4af" strokeWidth="3" strokeDasharray="8,4" />
              <circle cx="200" cy={190 + progress * 140} r="3" fill="#ffffff" className="animate-ping" />
            </g>
          )}

          {/* 3. THERMAL DISSIPATION PLUME IN RESERVOIR */}
          <circle
            cx="200"
            cy="340"
            r={thermalPlumeRadius * pulseScale}
            fill="url(#thermalPlumeGrad)"
          />

          {/* Perforations at Injection Zone */}
          <line x1="188" y1="330" x2="194" y2="330" stroke="#f43f5e" strokeWidth="2" />
          <line x1="188" y1="340" x2="194" y2="340" stroke="#f43f5e" strokeWidth="2" />
          <line x1="188" y1="350" x2="194" y2="350" stroke="#f43f5e" strokeWidth="2" />
          <line x1="206" y1="330" x2="212" y2="330" stroke="#f43f5e" strokeWidth="2" />
          <line x1="206" y1="340" x2="212" y2="340" stroke="#f43f5e" strokeWidth="2" />
          <line x1="206" y1="350" x2="212" y2="350" stroke="#f43f5e" strokeWidth="2" />

          {/* 4. PRODUCTION WELL AT DISTANCE */}
          <rect x="426" y="165" width="28" height="20" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="2" />
          <text x="415" y="160" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">
            PRODUCTION WELL
          </text>
          <rect x="434" y="180" width="12" height="240" fill="#020617" stroke="#10b981" strokeWidth="1.5" />

          {/* Perforations at Production Zone */}
          <line x1="428" y1="330" x2="434" y2="330" stroke="#10b981" strokeWidth="2" />
          <line x1="428" y1="340" x2="434" y2="340" stroke="#10b981" strokeWidth="2" />
          <line x1="428" y1="350" x2="434" y2="340" stroke="#10b981" strokeWidth="2" />

          {/* Animated Mobile Heavy Oil Flow Particles from Heated Zone to Production Well */}
          {isPlaying && (
            <g>
              <path d="M 260 340 Q 340 330 428 340" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,3" />
              <circle cx={260 + progress * 168} cy="336" r="3.5" fill="#f59e0b" />
              <line x1="440" y1="340" x2="440" y2="180" stroke="#10b981" strokeWidth="3" strokeDasharray="6,3" />
              <circle cx="440" cy={340 - progress * 150} r="3" fill="#34d399" />
            </g>
          )}

          {/* Surface Production Pipeline */}
          <path d="M 440 165 L 530 165" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="3,2" />
          <rect x="530" y="150" width="45" height="30" fill="#064e3b" stroke="#34d399" strokeWidth="1" rx="3" />
          <text x="534" y="168" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">
            STORAGE
          </text>
        </svg>

        {/* Floating Telemetry & Thermal Zone Readouts */}
        <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md font-mono text-[11px] space-y-1.5 shadow-lg">
          <div className="text-rose-400 font-bold text-xs border-b border-slate-800 pb-1">
            THERMAL INJECTION STATE
          </div>
          <div className="text-slate-300">
            Reservoir Temp: <strong className="text-rose-400">{resTempC.toFixed(1)} °C</strong>
          </div>
          <div className="text-slate-300">
            Crude Viscosity: <strong className="text-purple-400">{viscCp.toLocaleString()} cP</strong>
          </div>
          <div className="text-slate-300">
            Oil Mobility (k/μ): <strong className="text-amber-400">{mobDcP.toFixed(5)} D/cP</strong>
          </div>
          <div className="text-slate-300">
            Thermal Plume Radius: <strong className="text-sky-400">{(thermalPlumeRadius / 4).toFixed(1)} m</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useAnimation } from '../digital-twin/animations';
import { Play, Pause, RotateCcw, Activity, ArrowUp, ArrowDown } from 'lucide-react';

export const SRP2DVisualization: React.FC = () => {
  const {
    isPlaying,
    play,
    pause,
    reset,
    strokeOffset,
    walkingBeamAngle,
    progress,
    activeSpm,
    activeStrokeLength,
  } = useAnimation();

  const isUpstroke = progress < 0.5;

  // Kinematic calculations for 2D SVG
  const crankAngleRad = progress * 2 * Math.PI;
  const crankRadius = 32;
  const crankCenterX = 150;
  const crankCenterY = 170;

  const crankPinX = crankCenterX + Math.cos(crankAngleRad) * crankRadius;
  const crankPinY = crankCenterY + Math.sin(crankAngleRad) * crankRadius;

  // Beam pivot on Samson post
  const pivotX = 260;
  const pivotY = 110;

  // Rear beam end connected via pitman / connecting rod to crank pin
  const beamRearX = pivotX - 80 * Math.cos((walkingBeamAngle * Math.PI) / 180);
  const beamRearY = pivotY - 80 * Math.sin((walkingBeamAngle * Math.PI) / 180);

  // Horsehead front end
  const horseheadFrontX = pivotX + 110 * Math.cos((walkingBeamAngle * Math.PI) / 180);
  const horseheadFrontY = pivotY + 110 * Math.sin((walkingBeamAngle * Math.PI) / 180);

  // Polished rod vertical line
  const wellheadX = 370;
  const polishedRodTopY = horseheadFrontY;
  const polishedRodBottomY = 220 + strokeOffset;
  const plungerY = 380 + strokeOffset * 0.85;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col font-mono">
      {/* Schematic Header Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-sky-400">
          <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
          <span>2D SUCKER ROD PUMP MECHANICAL SCHEMATIC</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-bold">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className={isUpstroke ? 'text-emerald-400' : 'text-amber-400'}>
              {isUpstroke ? 'UPSTROKE' : 'DOWNSTROKE'}
            </span>
          </div>

          {/* Controls */}
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

      {/* Main SVG Render Viewport */}
      <div className="relative bg-slate-950 w-full h-[420px] flex items-center justify-center overflow-hidden">
        {/* Background Engineering Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
          <defs>
            <pattern id="srpGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#srpGrid)" />
        </svg>

        {/* 2D Mechanical Model SVG */}
        <svg viewBox="0 0 520 480" className="w-full h-full max-h-[420px] z-10">
          <defs>
            {/* Gradients */}
            <linearGradient id="vfdGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
            <linearGradient id="motorGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="oilFluidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="reservoirGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Ground Level Line */}
          <line x1="20" y1="220" x2="500" y2="220" stroke="#475569" strokeWidth="2" strokeDasharray="4,4" />
          <text x="30" y="212" fill="#64748b" fontSize="10" fontFamily="monospace" fontWeight="bold">
            SURFACE GRADE (0.0 m)
          </text>

          {/* RESERVOIR & SUB-SURFACE STRATA */}
          <rect x="300" y="220" x2="440" width="140" height="250" fill="url(#reservoirGrad)" stroke="#334155" strokeWidth="1" />
          <text x="445" y="450" fill="#64748b" fontSize="9" fontFamily="monospace">
            JODHPUR SANDSTONE
          </text>
          <text x="445" y="462" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
            HEAVY OIL ZONE (48°C)
          </text>

          {/* 1. VFD DRIVE CABINET */}
          <rect x="30" y="160" width="40" height="60" rx="4" fill="url(#vfdGrad)" stroke="#c084fc" strokeWidth="1.5" />
          <rect x="36" y="168" width="28" height="14" fill="#0f172a" rx="2" />
          <text x="39" y="179" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
            VFD
          </text>
          <text x="35" y="200" fill="#e9d5ff" fontSize="8" fontFamily="monospace">
            {activeSpm.toFixed(1)} SPM
          </text>
          <text x="35" y="210" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
            50 Hz Control
          </text>

          {/* VFD Cable to Motor */}
          <path d="M 70 190 Q 80 205 90 190" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="2,2" />

          {/* 2. PRIME MOVER (ELECTRIC MOTOR) */}
          <circle cx="105" cy="185" r="16" fill="url(#motorGrad)" stroke="#7dd3fc" strokeWidth="1.5" />
          <text x="96" y="188" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
            M
          </text>
          <text x="88" y="210" fill="#94a3b8" fontSize="8" fontFamily="monospace">
            PRIME MOVER
          </text>

          {/* Motor Belt to Gear Reducer Crank */}
          <line x1="105" y1="185" x2={crankCenterX} y2={crankCenterY} stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />

          {/* 3. CRANK & COUNTERWEIGHT */}
          <circle cx={crankCenterX} cy={crankCenterY} r="24" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
          {/* Rotating Crank Arm */}
          <line x1={crankCenterX} y1={crankCenterY} x2={crankPinX} y2={crankPinY} stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
          <circle cx={crankPinX} cy={crankPinY} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
          {/* Counterweight blob */}
          <circle cx={crankCenterX - Math.cos(crankAngleRad) * 16} cy={crankCenterY - Math.sin(crankAngleRad) * 16} r="10" fill="#475569" />

          {/* 4. PITMAN / CONNECTING ROD */}
          <line x1={crankPinX} y1={crankPinY} x2={beamRearX} y2={beamRearY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />

          {/* 5. SAMSON POST (TRIANGULAR TOWER) */}
          <polygon points={`260,110 235,220 285,220`} fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <text x="238" y="210" fill="#64748b" fontSize="8" fontFamily="monospace">
            SAMSON POST
          </text>

          {/* 6. WALKING BEAM */}
          <line x1={beamRearX} y1={beamRearY} x2={horseheadFrontX} y2={horseheadFrontY} stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
          {/* Pivot Pin */}
          <circle cx={pivotX} cy={pivotY} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />

          {/* 7. HORSEHEAD */}
          <path
            d={`M ${horseheadFrontX} ${horseheadFrontY} Q ${horseheadFrontX + 15} ${horseheadFrontY + 25} ${horseheadFrontX} ${horseheadFrontY + 45}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />

          {/* Bridle Cable from Horsehead to Polished Rod */}
          <line x1={horseheadFrontX} y1={horseheadFrontY + 45} x2={wellheadX} y2={polishedRodTopY + 45} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2,2" />

          {/* 8. WELLHEAD & STUFFING BOX */}
          <rect x={wellheadX - 16} y="210" width="32" height="20" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="2" />
          <text x={wellheadX + 22} y="222" fill="#94a3b8" fontSize="8" fontFamily="monospace">
            WELLHEAD
          </text>

          {/* 9. POLISHED ROD */}
          <line x1={wellheadX} y1={polishedRodTopY + 40} x2={wellheadX} y2={polishedRodBottomY} stroke="#f87171" strokeWidth="3" />

          {/* 10. TUBING & CASING STRING */}
          <rect x={wellheadX - 12} y="230" width="24" height="220" fill="#090d16" stroke="#475569" strokeWidth="1.5" />

          {/* Heavy Oil Fluid Column inside Tubing */}
          <rect x={wellheadX - 8} y={plungerY} width="16" height={450 - plungerY} fill="url(#oilFluidGrad)" />

          {/* Upward Flow Animated Particles on Upstroke */}
          {isUpstroke && isPlaying && (
            <g>
              <circle cx={wellheadX - 4} cy={plungerY + 20} r="2" fill="#fde047" className="animate-ping" />
              <circle cx={wellheadX + 4} cy={plungerY + 40} r="2.5" fill="#fde047" className="animate-ping" />
              <circle cx={wellheadX} cy={plungerY + 60} r="2" fill="#fde047" className="animate-ping" />
            </g>
          )}

          {/* 11. SUCKER ROD STRING */}
          <line x1={wellheadX} y1={polishedRodBottomY} x2={wellheadX} y2={plungerY} stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6,2" />

          {/* 12. DOWNHOLE PUMP & PLUNGER */}
          <rect x={wellheadX - 9} y={plungerY} width="18" height="30" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" rx="2" />
          <text x={wellheadX + 16} y={plungerY + 18} fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
            PUMP PLUNGER
          </text>

          {/* Standing & Traveling Valve Indicators */}
          <circle cx={wellheadX} cy={plungerY + 10} r="3" fill={isUpstroke ? '#ef4444' : '#10b981'} />
          <circle cx={wellheadX} cy="440" r="3.5" fill={isUpstroke ? '#10b981' : '#ef4444'} />
          <text x={wellheadX - 65} y="443" fill="#94a3b8" fontSize="7" fontFamily="monospace">
            STANDING VALVE
          </text>
        </svg>

        {/* Floating Telemetry & Phase Overlay Badges */}
        <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md font-mono text-[11px] space-y-1.5 shadow-lg">
          <div className="text-sky-400 font-bold text-xs border-b border-slate-800 pb-1 flex items-center gap-1.5">
            {isUpstroke ? <ArrowUp className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isUpstroke ? 'UPSTROKE PHASE' : 'DOWNSTROKE PHASE'}</span>
          </div>
          <div className="text-slate-300">
            Stroke Length: <strong className="text-indigo-400">{activeStrokeLength.toFixed(2)} m</strong>
          </div>
          <div className="text-slate-300">
            Speed: <strong className="text-sky-400">{activeSpm.toFixed(1)} SPM</strong>
          </div>
          <div className="text-slate-300">
            Polished Rod Displacement: <strong className="text-rose-400">{(strokeOffset / 10).toFixed(2)} cm</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

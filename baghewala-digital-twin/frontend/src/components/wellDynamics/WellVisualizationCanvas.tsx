import React, { useState, useEffect, useRef } from 'react';
import type { WellPhenomenon, WellComponentId } from '../../types/wellDynamics';
import { useScenarioStore } from '../../simulation/scenario';
import { Layers, ZoomIn, ZoomOut, RotateCcw, Eye } from 'lucide-react';
import './WellVisualizationCanvas.css';

interface WellVisualizationCanvasProps {
  phenomenon: WellPhenomenon;
  selectedComponentId: WellComponentId | null;
  onSelectComponent: (id: WellComponentId | null) => void;
}

export type DepthViewMode = 'full' | 'surface' | 'pump' | 'reservoir';

export const WellVisualizationCanvas: React.FC<WellVisualizationCanvasProps> = ({
  phenomenon,
  selectedComponentId,
  onSelectComponent
}) => {
  const {
    activeScenario,
    thermalResult,
    viscosityResult
  } = useScenarioStore();

  const [viewMode, setViewMode] = useState<DepthViewMode>('full');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [hoveredComponentId, setHoveredComponentId] = useState<WellComponentId | null>(null);

  // Animation State
  const [strokeOffset, setStrokeOffset] = useState<number>(0);
  const [crankAngle, setCrankAngle] = useState<number>(0);
  const [particleTick, setParticleTick] = useState<number>(0);

  const reqRef = useRef<number | null>(null);

  // Retrieve Live Scenario Parameters
  const spm = activeScenario.inputs.spm || 6.0;
  const strokeMeters = activeScenario.inputs.strokeLengthMeters || 3.0;
  const vfdHz = activeScenario.inputs.vfdFrequencyHz || 50.0;
  const steamTpd = activeScenario.inputs.steamInjectionRateTpd || 0;
  const effectiveTemp = thermalResult?.predictedReservoirTemperatureC || activeScenario.inputs.reservoirTemperatureC || 30.0;
  const effectiveViscosity = viscosityResult?.estimatedViscosityCp || 5000;

  // Single Clean Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Reciprocating Sucker Rod Stroke
      const strokeSpeedFactor = phenomenon.visualizationState.rodAnimationSpeedFactor || 1.0;
      const strokeFreqHz = (spm / 60.0) * strokeSpeedFactor;
      const amplitudePx = Math.min(Math.max(strokeMeters * 8, 12), 32);
      const currentOffset = Math.sin(time * 0.001 * strokeFreqHz * 2 * Math.PI) * amplitudePx;
      setStrokeOffset(currentOffset);

      // 2. VFD Motor Crank Rotation Angle
      const crankSpeedDeg = (vfdHz / 50.0) * 180 * delta;
      setCrankAngle((prev) => (prev + crankSpeedDeg) % 360);

      // 3. Fluid & Steam Flow Particle Tick
      setParticleTick((prev) => (prev + delta * 30) % 100);

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [spm, strokeMeters, vfdHz, phenomenon.visualizationState.rodAnimationSpeedFactor]);

  const vizState = phenomenon.visualizationState;

  // Color Mapping for Rod Stress
  const rodStressColor =
    vizState.rodStressLevel > 0.85
      ? '#ef4444' // Red
      : vizState.rodStressLevel > 0.6
      ? '#f97316' // Orange
      : '#38bdf8'; // Sky blue

  // Viewport Transform Parameters based on viewMode & zoomLevel
  const getViewTransform = () => {
    switch (viewMode) {
      case 'surface':
        return `scale(${zoomLevel * 1.5}) translate(0px, 120px)`;
      case 'pump':
        return `scale(${zoomLevel * 1.6}) translate(0px, -240px)`;
      case 'reservoir':
        return `scale(${zoomLevel * 1.7}) translate(0px, -320px)`;
      case 'full':
      default:
        return `scale(${zoomLevel}) translate(0px, 0px)`;
    }
  };

  const handleComponentClick = (id: WellComponentId) => {
    onSelectComponent(selectedComponentId === id ? null : id);
  };

  const isAffected = (id: WellComponentId) => {
    return phenomenon.affectedComponents.some((c) =>
      c.toLowerCase().includes(id.replace('_', ' ')) ||
      id.replace('_', ' ').includes(c.toLowerCase())
    );
  };

  const isHighlighted = (id: WellComponentId) => {
    return selectedComponentId === id || hoveredComponentId === id || isAffected(id);
  };

  return (
    <div className="well-visualization-panel bg-white border border-gray-200 rounded-xl p-4 shadow-xl flex flex-col h-full relative overflow-hidden font-mono">
      {/* Visualizer Toolbar */}
      <div className="well-visualization-toolbar flex flex-wrap items-center justify-between pb-3 border-b border-gray-200 gap-2 z-20 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white">2.5D INTERACTIVE WELL DYNAMICS ENGINE</h2>
        </div>

        {/* Depth View Mode Selector */}
        <div className="flex items-center gap-1.5 text-xs bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold px-1.5 flex items-center gap-1">
            <Eye className="w-3 h-3 text-sky-400" /> VIEW:
          </span>
          {(['full', 'surface', 'pump', 'reservoir'] as DepthViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                viewMode === mode
                  ? 'bg-sky-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-1 text-xs bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-sky-300 font-bold px-1">{(zoomLevel * 100).toFixed(0)}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.75))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setViewMode('full');
              setZoomLevel(1.0);
              onSelectComponent(null);
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 ml-1 border-l border-slate-800"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Graphic Viewport */}
      <div className="well-visualization-stage flex-1 relative w-full h-[520px] bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
        {/* Background Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />
        </svg>

        {/* Depth Scale Ruler (Left Side) */}
        <div className="absolute top-4 left-3 bottom-4 w-12 border-r border-slate-800 text-[9px] font-mono text-slate-500 flex flex-col justify-between py-2 pointer-events-none z-10">
          <div>0m Surface</div>
          <div>150m Casing</div>
          <div>350m Sucker Rod</div>
          <div>520m Pump</div>
          <div>580m Perfs</div>
          <div>600m Payzone</div>
        </div>

        {/* Dynamic Thermal Heat Field Layer */}
        <div
          className="absolute bottom-10 transition-all duration-700 rounded-full blur-3xl pointer-events-none z-0"
          style={{
            width: `${Math.min(Math.max((steamTpd / 10) * 40 + 80, 80), 360)}px`,
            height: `${Math.min(Math.max((steamTpd / 10) * 40 + 80, 80), 360)}px`,
            backgroundColor: effectiveTemp > 60 ? '#f97316' : '#0284c7',
            opacity: vizState.thermalGlowIntensity * 0.45
          }}
        />

        {/* Main 2.5D Isometric SVG Subsurface Well Assembly */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out z-10"
          style={{ transform: getViewTransform() }}
        >
          <svg viewBox="0 0 700 580" className="w-full h-full max-h-[540px]">
            <defs>
              {/* Gradients */}
              <linearGradient id="casingGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <linearGradient id="tubingFluidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={
                    effectiveViscosity > 8000
                      ? '#4c1d95'
                      : effectiveViscosity > 2000
                      ? '#7c2d12'
                      : '#0284c7'
                  }
                />
                <stop
                  offset="100%"
                  stopColor={
                    effectiveViscosity > 8000
                      ? '#2e1065'
                      : effectiveViscosity > 2000
                      ? '#451a03'
                      : '#0369a1'
                  }
                />
              </linearGradient>

              <radialGradient id="reservoirGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={effectiveTemp > 60 ? '#fb923c' : '#0284c7'} stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
              </radialGradient>

              <filter id="glowEffect">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* RESERVOIR FORMATION BAND (Jodhpur Sandstone 550m - 600m depth) */}
            <g
              onClick={() => handleComponentClick('reservoir')}
              onMouseEnter={() => setHoveredComponentId('reservoir')}
              onMouseLeave={() => setHoveredComponentId(null)}
              className="cursor-pointer"
            >
              <rect
                x="80"
                y="460"
                width="540"
                height="100"
                fill="url(#reservoirGrad)"
                stroke={isHighlighted('reservoir') ? '#38bdf8' : '#334155'}
                strokeWidth={isHighlighted('reservoir') ? '2' : '1'}
                rx="8"
              />
              <text x="95" y="480" fill="#94a3b8" fontSize="10" fontWeight="bold">
                JODHPUR SANDSTONE FORMATION PAYZONE (580m - 600m)
              </text>
            </g>

            {/* THERMAL ZONE ENVELOPE */}
            <g
              onClick={() => handleComponentClick('thermal_zone')}
              onMouseEnter={() => setHoveredComponentId('thermal_zone')}
              onMouseLeave={() => setHoveredComponentId(null)}
              className="cursor-pointer"
            >
              <ellipse
                cx="350"
                cy="510"
                rx={Math.min(100 + steamTpd * 1.2, 220)}
                ry="40"
                fill="#f97316"
                opacity={0.25 * vizState.thermalGlowIntensity}
                stroke={isHighlighted('thermal_zone') ? '#f97316' : 'none'}
                strokeWidth="2"
                strokeDasharray="4,2"
              />
            </g>

            {/* 1. SURFACE PUMPING UNIT (0m Surface Depth) */}
            <g transform="translate(300, 20)">
              {/* Motor Unit */}
              <g
                onClick={(e) => { e.stopPropagation(); handleComponentClick('motor'); }}
                onMouseEnter={() => setHoveredComponentId('motor')}
                onMouseLeave={() => setHoveredComponentId(null)}
                className="cursor-pointer"
              >
                <rect
                  x="120"
                  y="40"
                  width="36"
                  height="28"
                  fill="#1e293b"
                  stroke={isHighlighted('motor') ? '#f59e0b' : vizState.motorLoadPercentage > 90 ? '#ef4444' : '#0284c7'}
                  strokeWidth="2"
                  rx="4"
                  filter={isHighlighted('motor') ? 'url(#glowEffect)' : undefined}
                />
                <text x="126" y="58" fill="#e2e8f0" fontSize="9" fontWeight="bold">MOTOR</text>
              </g>

              {/* Gearbox Unit */}
              <g
                onClick={(e) => { e.stopPropagation(); handleComponentClick('gearbox'); }}
                onMouseEnter={() => setHoveredComponentId('gearbox')}
                onMouseLeave={() => setHoveredComponentId(null)}
                className="cursor-pointer"
              >
                <rect
                  x="80"
                  y="35"
                  width="35"
                  height="35"
                  fill="#334155"
                  stroke={isHighlighted('gearbox') ? '#38bdf8' : '#64748b'}
                  strokeWidth="2"
                  rx="4"
                />
                {/* Rotating Crank Arm */}
                <line
                  x1="97"
                  y1="52"
                  x2={97 + Math.cos((crankAngle * Math.PI) / 180) * 12}
                  y2={52 + Math.sin((crankAngle * Math.PI) / 180) * 12}
                  stroke="#38bdf8"
                  strokeWidth="3"
                />
                <circle cx="97" cy="52" r="3" fill="#cbd5e1" />
              </g>

              {/* Walking Beam */}
              <g
                onClick={(e) => { e.stopPropagation(); handleComponentClick('walking_beam'); }}
                onMouseEnter={() => setHoveredComponentId('walking_beam')}
                onMouseLeave={() => setHoveredComponentId(null)}
                className="cursor-pointer"
              >
                {/* Samson Post Frame */}
                <path d="M 30 75 L 50 20 L 70 75 Z" fill="none" stroke="#475569" strokeWidth="3" />
                {/* Beam */}
                <line x1="5" y1="20" x2="95" y2="20" stroke={isHighlighted('walking_beam') ? '#38bdf8' : '#94a3b8'} strokeWidth="5" />
                {/* Horsehead Arc */}
                <path d="M 5 20 Q -5 25 -5 45" fill="none" stroke="#94a3b8" strokeWidth="5" />
              </g>

              {/* Polished Rod */}
              <g
                onClick={(e) => { e.stopPropagation(); handleComponentClick('polished_rod'); }}
                onMouseEnter={() => setHoveredComponentId('polished_rod')}
                onMouseLeave={() => setHoveredComponentId(null)}
                className="cursor-pointer"
              >
                <line
                  x1="49.5"
                  y1="45"
                  x2="49.5"
                  y2="75"
                  stroke={isHighlighted('polished_rod') ? '#38bdf8' : rodStressColor}
                  strokeWidth="3.5"
                />
              </g>
            </g>

            {/* 2. WELLHEAD & STUFFING BOX (0m Depth) */}
            <g
              transform="translate(330, 85)"
              onClick={() => handleComponentClick('wellhead')}
              onMouseEnter={() => setHoveredComponentId('wellhead')}
              onMouseLeave={() => setHoveredComponentId(null)}
              className="cursor-pointer"
            >
              <rect
                x="10"
                y="0"
                width="20"
                height="18"
                fill="#334155"
                stroke={isHighlighted('wellhead') ? '#38bdf8' : '#64748b'}
                strokeWidth="2"
                rx="2"
              />
              <line x1="-15" y1="18" x2="55" y2="18" stroke="#94a3b8" strokeWidth="4" />
            </g>

            {/* 3. OUTER CASING (0m - 600m Depth) */}
            <g
              onClick={() => handleComponentClick('casing')}
              onMouseEnter={() => setHoveredComponentId('casing')}
              onMouseLeave={() => setHoveredComponentId(null)}
              className="cursor-pointer"
            >
              <rect
                x="332"
                y="103"
                width="36"
                height="415"
                fill="none"
                stroke={isHighlighted('casing') ? '#38bdf8' : 'url(#casingGrad2)'}
                strokeWidth="5"
                rx="3"
              />
            </g>

            {/* 4. PRODUCTION TUBING STRING */}
            <g
              onClick={() => handleComponentClick('tubing')}
              onMouseEnter={() => setHoveredComponentId('tubing')}
              onMouseLeave={() => setHoveredComponentId(null)}
              className="cursor-pointer"
            >
              <rect
                x="341"
                y="103"
                width="18"
                height="390"
                fill="url(#tubingFluidGrad)"
                stroke={isHighlighted('tubing') ? '#38bdf8' : '#475569'}
                strokeWidth="1.5"
                opacity="0.9"
              />
            </g>

            {/* 5. RECIPROCATING SUCKER ROD STRING (Animated via strokeOffset) */}
            <g
              transform={`translate(0, ${strokeOffset})`}
              onClick={() => handleComponentClick('sucker_rod')}
              onMouseEnter={() => setHoveredComponentId('sucker_rod')}
              onMouseLeave={() => setHoveredComponentId(null)}
              className="cursor-pointer"
            >
              <line
                x1="350"
                y1="75"
                x2="350"
                y2="475"
                stroke={isHighlighted('sucker_rod') ? '#38bdf8' : rodStressColor}
                strokeWidth="3.5"
                filter={vizState.rodStressLevel > 0.8 ? 'url(#glowEffect)' : undefined}
              />
              {/* Rod Couplings */}
              {[140, 200, 260, 320, 380, 440].map((y) => (
                <rect key={y} x="347" y={y} width="6" height="8" fill="#e2e8f0" rx="1" />
              ))}

              {/* Downhole Plunger */}
              <g
                onClick={(e) => { e.stopPropagation(); handleComponentClick('plunger'); }}
                onMouseEnter={() => setHoveredComponentId('plunger')}
                onMouseLeave={() => setHoveredComponentId(null)}
              >
                <rect
                  x="343"
                  y="465"
                  width="14"
                  height="26"
                  fill="#f8fafc"
                  stroke={isHighlighted('plunger') ? '#38bdf8' : '#0284c7'}
                  strokeWidth="2"
                  rx="2"
                />
                <circle cx="350" cy="478" r="3" fill="#0284c7" />
              </g>
            </g>

            {/* 6. DOWNHOLE PUMP BARREL ASSEMBLY (520m Depth) */}
            <g
              onClick={() => handleComponentClick('downhole_pump')}
              onMouseEnter={() => setHoveredComponentId('downhole_pump')}
              onMouseLeave={() => setHoveredComponentId(null)}
              className="cursor-pointer"
            >
              <rect
                x="338"
                y="460"
                width="24"
                height="40"
                fill="none"
                stroke={isHighlighted('downhole_pump') ? '#38bdf8' : '#38bdf8'}
                strokeWidth="2.5"
                rx="3"
              />
            </g>

            {/* 7. PERFORATIONS (580m Depth) */}
            <g
              transform="translate(300, 490)"
              onClick={() => handleComponentClick('perforations')}
              onMouseEnter={() => setHoveredComponentId('perforations')}
              onMouseLeave={() => setHoveredComponentId(null)}
              className="cursor-pointer"
            >
              <line x1="20" y1="10" x2="33" y2="10" stroke="#f97316" strokeWidth="3" strokeDasharray="3,2" />
              <line x1="20" y1="20" x2="33" y2="20" stroke="#f97316" strokeWidth="3" strokeDasharray="3,2" />
              <line x1="67" y1="10" x2="80" y2="10" stroke="#f97316" strokeWidth="3" strokeDasharray="3,2" />
              <line x1="67" y1="20" x2="80" y2="20" stroke="#f97316" strokeWidth="3" strokeDasharray="3,2" />
            </g>

            {/* 8. OIL ZONE */}
            <g
              onClick={() => handleComponentClick('oil_zone')}
              onMouseEnter={() => setHoveredComponentId('oil_zone')}
              onMouseLeave={() => setHoveredComponentId(null)}
              className="cursor-pointer"
            >
              <rect x="120" y="495" width="180" height="40" fill="#7c2d12" opacity="0.4" rx="4" />
              <rect x="400" y="495" width="180" height="40" fill="#7c2d12" opacity="0.4" rx="4" />
            </g>

            {/* DYNAMIC PHENOMENON SPECIFIC OVERLAYS */}
            {/* Gas Interference Bubbles Overlay */}
            {vizState.gasBubbleDensity > 0.4 && (
              <g transform="translate(343, 380)">
                {[15, 45, 75, 105].map((y, i) => (
                  <circle
                    key={i}
                    cx={(i % 2) * 8 + 3}
                    cy={(y + particleTick * 2) % 110}
                    r={2.5 + (i % 2)}
                    fill="#a5f3fc"
                    opacity="0.85"
                  />
                ))}
              </g>
            )}

            {/* Scale & Corrosion Deposit Overlay */}
            {vizState.frictionResistance > 0.6 && (
              <g transform="translate(339, 220)">
                <path d="M 3 0 L 5 160 L 3 160 Z" fill="#ca8a04" opacity="0.9" />
                <path d="M 21 0 L 19 160 L 21 160 Z" fill="#ca8a04" opacity="0.9" />
              </g>
            )}

            {/* COMPONENT LABELS & LEADER LINES */}
            <g className="text-[10px] font-mono font-bold pointer-events-none">
              {/* Motor */}
              <line x1="450" y1="50" x2="480" y2="50" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="485" y="53" fill={isHighlighted('motor') ? '#f59e0b' : '#cbd5e1'}>Motor (0m)</text>

              {/* Wellhead */}
              <line x1="360" y1="95" x2="480" y2="95" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="485" y="98" fill={isHighlighted('wellhead') ? '#38bdf8' : '#cbd5e1'}>Wellhead (0m)</text>

              {/* Tubing */}
              <line x1="360" y1="200" x2="480" y2="200" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="485" y="203" fill={isHighlighted('tubing') ? '#38bdf8' : '#cbd5e1'}>Tubing (150m)</text>

              {/* Sucker Rod */}
              <line x1="350" y1="320" x2="480" y2="320" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="485" y="323" fill={isHighlighted('sucker_rod') ? '#38bdf8' : '#cbd5e1'}>Sucker Rod (350m)</text>

              {/* Downhole Pump */}
              <line x1="362" y1="475" x2="480" y2="475" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="485" y="478" fill={isHighlighted('downhole_pump') ? '#38bdf8' : '#cbd5e1'}>Downhole Pump (520m)</text>

              {/* Reservoir */}
              <line x1="200" y1="530" x2="110" y2="530" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="10" y="533" fill={isHighlighted('reservoir') ? '#38bdf8' : '#cbd5e1'}>Jodhpur Formation (600m)</text>
            </g>
          </svg>
        </div>

      </div>
    </div>
  );
};

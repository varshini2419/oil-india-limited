import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { useAnimation } from '../digital-twin/animations';
import { Activity, Info } from 'lucide-react';

export const DynamometerChart: React.FC = () => {
  const { srpOptimizationResult, committedSimulationResult } = useScenarioStore();
  const { progress } = useAnimation();

  const inputs = committedSimulationResult.inputs;
  const strokeM = inputs.strokeLengthMeters;
  const cur = srpOptimizationResult.currentCandidate;

  // Base physics parameters for Modeled Dynamometer Card
  const loadIndex = cur.loadIndex;
  const peakLoadKn = 45 + loadIndex * 0.45; // Peak load in kN
  const minLoadKn = 15 + loadIndex * 0.15; // Min load in kN

  // Generate 40 points around closed loop dynamometer card (X: Position 0->Stroke, Y: Load min->peak)
  const points: { x: number; y: number }[] = [];
  const numSteps = 40;

  for (let i = 0; i <= numSteps; i++) {
    const angle = (i / numSteps) * 2 * Math.PI;
    const posX = (strokeM / 2) * (1 - Math.cos(angle)); // Stroke position 0 to strokeM

    let loadVal = 0;
    if (angle <= Math.PI) {
      // Upstroke phase: Load rises quickly at start, stays high, slightly drops at top
      const upProgress = angle / Math.PI;
      loadVal = minLoadKn + (peakLoadKn - minLoadKn) * Math.sin(upProgress * 0.95 + 0.1);
    } else {
      // Downstroke phase: Load drops quickly at top, stays low, rises at bottom
      const downProgress = (angle - Math.PI) / Math.PI;
      loadVal = minLoadKn + (peakLoadKn - minLoadKn) * 0.3 * Math.cos(downProgress * Math.PI);
    }

    points.push({ x: posX, y: loadVal });
  }

  // SVG coordinate transformation
  const svgWidth = 360;
  const svgHeight = 220;
  const padding = 40;

  const maxX = Math.max(4.5, strokeM * 1.1);
  const maxY = Math.max(100, peakLoadKn * 1.25);

  const scaleX = (x: number) => padding + (x / maxX) * (svgWidth - 2 * padding);
  const scaleY = (y: number) => svgHeight - padding - (y / maxY) * (svgHeight - 2 * padding);

  const svgPathD = points.reduce((acc, p, idx) => {
    const px = scaleX(p.x).toFixed(1);
    const py = scaleY(p.y).toFixed(1);
    return idx === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
  }, '') + ' Z';

  // Live Position Marker on Dynamometer Loop
  const currentAngleRad = progress * 2 * Math.PI;
  const currentPosX = (strokeM / 2) * (1 - Math.cos(currentAngleRad));
  const currentLoadKn = progress < 0.5
    ? minLoadKn + (peakLoadKn - minLoadKn) * Math.sin((progress * 2) * 0.95 + 0.1)
    : minLoadKn + (peakLoadKn - minLoadKn) * 0.3 * Math.cos((progress - 0.5) * 2 * Math.PI);

  const currentMarkerSvgX = scaleX(currentPosX);
  const currentMarkerSvgY = scaleY(currentLoadKn);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs flex flex-col justify-between space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>MODELED DYNAMOMETER PERFORMANCE</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
          API RP 11L CARD
        </span>
      </div>

      {/* SVG Dynamometer Line Chart */}
      <div className="relative bg-slate-950 rounded-xl p-2 border border-slate-800 flex items-center justify-center">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-[200px]">
          {/* Axis grid lines */}
          <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#475569" strokeWidth="1.5" />
          <line x1={padding} y1={padding} x2={padding} y2={svgHeight - padding} stroke="#475569" strokeWidth="1.5" />

          {/* Grid lines */}
          <line x1={padding} y1={scaleY(maxY * 0.5)} x2={svgWidth - padding} y2={scaleY(maxY * 0.5)} stroke="#334155" strokeDasharray="3,3" />
          <line x1={scaleX(maxX * 0.5)} y1={padding} x2={scaleX(maxX * 0.5)} y2={svgHeight - padding} stroke="#334155" strokeDasharray="3,3" />

          {/* Dynamometer Closed Loop Fill & Path */}
          <path d={svgPathD} fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Live Synchronized Dynamometer Position Dot */}
          <circle cx={currentMarkerSvgX} cy={currentMarkerSvgY} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />

          {/* Axis Labels */}
          <text x={svgWidth / 2 - 40} y={svgHeight - 8} fill="#94a3b8" fontSize="9" fontFamily="monospace">
            Stroke Position (m)
          </text>
          <text x="5" y={svgHeight / 2} fill="#94a3b8" fontSize="9" fontFamily="monospace" transform={`rotate(-90 15 ${svgHeight / 2})`}>
            Polished Rod Load (kN)
          </text>

          {/* Legend Markers */}
          <text x={padding + 5} y={padding + 12} fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
            Upstroke Peak: {peakLoadKn.toFixed(1)} kN
          </text>
          <text x={padding + 5} y={svgHeight - padding - 8} fill="#94a3b8" fontSize="9" fontFamily="monospace">
            Downstroke Min: {minLoadKn.toFixed(1)} kN
          </text>
        </svg>

        <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 rounded px-2 py-1 text-[9.5px] text-slate-300">
          Stroke: <strong>{strokeM.toFixed(2)} m</strong> | Peak Load: <strong>{peakLoadKn.toFixed(1)} kN</strong>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-sans">
        <Info className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          Modeled 2D surface dynamometer card area represents mechanical work per stroke derived from current scenario setpoints.
        </span>
      </div>
    </div>
  );
};

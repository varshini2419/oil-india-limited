import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { calculatePredictiveRisks } from './RiskGauges';
import { Activity } from 'lucide-react';

export const MaintenanceTrend: React.FC = () => {
  const { srpOptimizationResult, aiRiskResult } = useScenarioStore();
  const cur = srpOptimizationResult.currentCandidate;
  const currentRisks = calculatePredictiveRisks(cur, aiRiskResult.riskScore);

  // Generate 15 deterministic timesteps around current operating parameters
  const timeSteps = 15;
  const healthData: number[] = [];
  const rodFailureData: number[] = [];
  const floatData: number[] = [];

  for (let t = 0; t < timeSteps; t++) {
    const harmonic = Math.sin((t / timeSteps) * Math.PI * 2);
    // Subtle deterministic harmonic variation
    const healthVal = Math.min(100, Math.max(0, currentRisks.overallHealthPct + harmonic * 2.0));
    const rodFailVal = Math.min(100, Math.max(0, currentRisks.rodFailurePct + harmonic * 1.5));
    const floatVal = Math.min(100, Math.max(0, currentRisks.rodFloatingPct - harmonic * 1.2));

    healthData.push(healthVal);
    rodFailureData.push(rodFailVal);
    floatData.push(floatVal);
  }

  // SVG Chart Dimensions
  const svgWidth = 500;
  const svgHeight = 160;
  const padding = 35;

  const scaleX = (idx: number) => padding + (idx / (timeSteps - 1)) * (svgWidth - 2 * padding);
  const scaleY = (val: number) => svgHeight - padding - (val / 100) * (svgHeight - 2 * padding);

  const makePath = (data: number[]) =>
    data.reduce((acc, v, i) => {
      const px = scaleX(i).toFixed(1);
      const py = scaleY(v).toFixed(1);
      return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
    }, '');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>REAL-TIME PREDICTIVE RISK & EQUIPMENT HEALTH TREND (15 TIMESTEPS)</span>
        </div>
        <span className="text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
          ROLLING HEALTH MONITORING
        </span>
      </div>

      <div className="relative bg-slate-950 rounded-xl p-2 border border-slate-800 flex items-center justify-center">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-[150px]">
          {/* Axis grid lines */}
          <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#334155" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={svgHeight - padding} stroke="#334155" strokeWidth="1" />

          {/* Grid lines */}
          <line x1={padding} y1={scaleY(50)} x2={svgWidth - padding} y2={scaleY(50)} stroke="#1e293b" strokeDasharray="3,3" />

          {/* Equipment Health Trend Line (Green) */}
          <path d={makePath(healthData)} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          {/* Rod Failure Trend Line (Red) */}
          <path d={makePath(rodFailureData)} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,2" />
          {/* Rod Floating Trend Line (Amber) */}
          <path d={makePath(floatData)} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2,2" />

          {/* Current End Markers */}
          <circle cx={scaleX(timeSteps - 1)} cy={scaleY(healthData[timeSteps - 1])} r="4" fill="#10b981" className="animate-pulse" />
          <circle cx={scaleX(timeSteps - 1)} cy={scaleY(rodFailureData[timeSteps - 1])} r="3" fill="#f43f5e" />

          {/* Axis Labels */}
          <text x={padding} y={svgHeight - 10} fill="#64748b" fontSize="8" fontFamily="monospace">t-14</text>
          <text x={svgWidth - padding - 25} y={svgHeight - 10} fill="#64748b" fontSize="8" fontFamily="monospace">t (Now)</text>
        </svg>

        <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] space-y-1 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Equipment Health: <strong>{currentRisks.overallHealthPct}%</strong>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Rod Failure Risk: <strong>{currentRisks.rodFailurePct}%</strong>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Rod Floating Risk: <strong>{currentRisks.rodFloatingPct}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

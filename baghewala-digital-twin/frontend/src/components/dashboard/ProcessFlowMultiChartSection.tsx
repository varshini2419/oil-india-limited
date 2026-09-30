import React, { useState } from 'react';
import { useTelemetryFluctuation } from './useTelemetryFluctuation';
import { ArrowDown, LineChart, Sliders } from 'lucide-react';

type MultiMetric =
  | 'Reservoir Temperature'
  | 'Viscosity'
  | 'Oil Production'
  | 'Steam Rate'
  | 'Steam Quality'
  | 'SRP Load'
  | 'Risk Score';

export const ProcessFlowMultiChartSection: React.FC = () => {
  const tel = useTelemetryFluctuation();
  const [selectedMetric, setSelectedMetric] = useState<MultiMetric>('Reservoir Temperature');

  const history = tel.metricHistory(selectedMetric);
  const points = history.points;
  const unit = history.unit;
  const color = history.color;
  const baseVal = history.val;

  const minV = Math.min(...points);
  const maxV = Math.max(...points);

  const svgW = 500;
  const svgH = 130;
  const pad = 30;
  const scaleX = (i: number) => pad + (i / (points.length - 1)) * (svgW - 2 * pad);
  const scaleY = (v: number) => svgH - pad - ((v - (minV - 0.1)) / (maxV - minV + 0.2 || 1)) * (svgH - 2 * pad);

  const pathD = points.reduce((acc, v, i) => {
    const px = scaleX(i).toFixed(1);
    const py = scaleY(v).toFixed(1);
    return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
  }, '');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-xl space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-sky-400 text-sm">
          <LineChart className="w-5 h-5 text-sky-400" />
          <span>INBOUND / OUTBOUND PROCESS FLOW & MULTI-METRIC LIVE TREND</span>
        </div>
        <span className="text-[10px] text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-800 font-bold">
          LIVE DYNAMIC PIPELINE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Section 16 Input -> Physical Response -> Output Flow Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200">INPUT → PHYSICAL RESPONSE → OUTPUT</span>
            <span className="text-[10px] text-sky-400 font-bold">SYSTEM MAP</span>
          </div>

          <div className="space-y-2">
            {/* Stage 1: Inputs */}
            <div className="bg-slate-900 border border-rose-900/60 rounded-xl p-3 space-y-1">
              <span className="text-[9.5px] font-bold text-rose-400 block uppercase">1. OPERATIONAL INPUTS</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-bold text-white">
                <div>Steam: {tel.steamRate.toFixed(0)} TPD</div>
                <div>Qual: {tel.steamQuality.toFixed(1)}%</div>
                <div>Temp: {tel.steamTemp.toFixed(0)}°C</div>
                <div>SPM: {tel.spm.toFixed(1)}</div>
                <div>Stroke: {tel.strokeM.toFixed(1)}m</div>
                <div>VFD: {tel.vfdHz.toFixed(0)}Hz</div>
              </div>
            </div>

            <div className="flex justify-center my-0.5">
              <ArrowDown className="w-4 h-4 text-slate-500" />
            </div>

            {/* Stage 2: Physical Response */}
            <div className="bg-slate-900 border border-amber-900/60 rounded-xl p-3 space-y-1">
              <span className="text-[9.5px] font-bold text-amber-400 block uppercase">2. PHYSICAL RESERVOIR RESPONSE</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-bold text-white">
                <div>Res Temp: {tel.resTemp.toFixed(1)}°C</div>
                <div>Viscosity: {tel.viscosity.toFixed(0)} cP</div>
                <div>Mobility: {tel.mobility.toFixed(4)}</div>
                <div>SRP Load: {tel.srpLoad.toFixed(0)}%</div>
              </div>
            </div>

            <div className="flex justify-center my-0.5">
              <ArrowDown className="w-4 h-4 text-slate-500" />
            </div>

            {/* Stage 3: Outputs */}
            <div className="bg-slate-900 border border-emerald-900/60 rounded-xl p-3 space-y-1">
              <span className="text-[9.5px] font-bold text-emerald-400 block uppercase">3. FIELD YIELD & HEALTH OUTPUTS</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-bold text-white">
                <div>Oil Prod: {tel.oilProd.toFixed(2)} BOPD</div>
                <div>Total: {tel.totalFluid.toFixed(2)} BFPD</div>
                <div>Risk: {tel.riskScore.toFixed(1)}/100</div>
                <div>Health: {tel.healthPct.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Section 17 Multi-Metric Live Chart with Selector Dropdown */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 gap-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>SELECTABLE MULTI-METRIC LIVE CHART</span>
            </div>

            {/* Metric Dropdown */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as MultiMetric)}
              className="bg-slate-900 border border-slate-700 text-sky-300 font-bold rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              <option value="Reservoir Temperature">Reservoir Temperature (°C)</option>
              <option value="Viscosity">Viscosity (cP)</option>
              <option value="Oil Production">Oil Production (BOPD)</option>
              <option value="Steam Rate">Steam Rate (TPD)</option>
              <option value="Steam Quality">Steam Quality (%)</option>
              <option value="SRP Load">SRP Load (%)</option>
              <option value="Risk Score">Risk Score (/100)</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">{selectedMetric} Trajectory</span>
              <span className="text-sky-400 font-bold">
                Current: {baseVal.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unit}
              </span>
            </div>

            <div className="relative h-[130px] w-full flex items-center justify-center">
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
                <line x1={pad} y1={svgH - pad} x2={svgW - pad} y2={svgH - pad} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                {points.map((v, idx) => (
                  <circle
                    key={idx}
                    cx={scaleX(idx)}
                    cy={scaleY(v)}
                    r="3.5"
                    fill={idx === points.length - 1 ? color : '#ffffff'}
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1">
              <span>Visible Window: 15 Timesteps</span>
              <span>Units: <strong>{unit}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { Activity } from 'lucide-react';

export const CSSRecoveryChart: React.FC = () => {
  const { committedSimulationResult } = useScenarioStore();
  const thermal = committedSimulationResult.thermal;
  const viscosity = committedSimulationResult.viscosity;
  const production = committedSimulationResult.production;

  const currentTemp = thermal.predictedReservoirTemperatureC;
  const currentVisc = viscosity.estimatedViscosityCp;
  const currentProd = production.estimatedProductionBopd;

  // Generate 12 time steps demonstrating soak thermal profile & viscosity response
  const timeSteps = 12;
  const tempData: number[] = [];
  const viscData: number[] = [];
  const prodData: number[] = [];

  const baseTemp = 48.0;
  const baseVisc = 25000.0;
  const baseProd = 3.5;

  for (let t = 0; t < timeSteps; t++) {
    const frac = t / (timeSteps - 1);
    // Thermal buildup curve
    const tempVal = baseTemp + (currentTemp - baseTemp) * (1 - Math.exp(-frac * 3.5));
    // Viscosity exponential reduction
    const viscVal = Math.max(120, baseVisc * Math.exp(-frac * Math.log(baseVisc / Math.max(120, currentVisc))));
    // Production rate buildup
    const prodVal = baseProd + (currentProd - baseProd) * (1 - Math.exp(-frac * 4.0));

    tempData.push(tempVal);
    viscData.push(viscVal);
    prodData.push(prodVal);
  }

  // SVG Chart Dimensions
  const svgWidth = 320;
  const svgHeight = 140;
  const padding = 35;

  const renderSparkline = (
    data: number[],
    minVal: number,
    maxVal: number,
    colorClass: string,
    unit: string,
    curVal: number
  ) => {
    const scaleX = (idx: number) => padding + (idx / (timeSteps - 1)) * (svgWidth - 2 * padding);
    const scaleY = (val: number) => svgHeight - padding - ((val - minVal) / Math.max(1, maxVal - minVal)) * (svgHeight - 2 * padding);

    const pathD = data.reduce((acc, v, i) => {
      const px = scaleX(i).toFixed(1);
      const py = scaleY(v).toFixed(1);
      return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
    }, '');

    return (
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
          <span>{unit} PROFILE</span>
          <strong className={colorClass}>{curVal.toLocaleString()} {unit.split(' ')[0]}</strong>
        </div>

        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-[110px]">
          {/* Axis line */}
          <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#334155" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={svgHeight - padding} stroke="#334155" strokeWidth="1" />

          {/* Grid dashed line */}
          <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#1e293b" strokeDasharray="2,2" />

          {/* Sparkline path */}
          <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2.5" className={colorClass} strokeLinecap="round" />

          {/* End point marker */}
          <circle cx={scaleX(timeSteps - 1)} cy={scaleY(data[timeSteps - 1])} r="4" fill="currentColor" className={colorClass} />

          {/* Axis Labels */}
          <text x={padding} y={svgHeight - 10} fill="#64748b" fontSize="8" fontFamily="monospace">Day 0</text>
          <text x={svgWidth - padding - 25} y={svgHeight - 10} fill="#64748b" fontSize="8" fontFamily="monospace">Day 30</text>
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-rose-500" />
          <span>LIVE THERMAL RECOVERY & VISCOSITY RESPONSE TRENDS</span>
        </div>
        <span className="text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
          30-DAY SOAK SIMULATION
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chart 1: Reservoir Temp */}
        {renderSparkline(tempData, 30, Math.max(100, currentTemp + 10), 'text-rose-500', 'RESERVOIR TEMP (°C)', currentTemp)}

        {/* Chart 2: Viscosity */}
        {renderSparkline(viscData, 50, 30000, 'text-purple-400', 'VISCOSITY (cP)', currentVisc)}

        {/* Chart 3: Production */}
        {renderSparkline(prodData, 0, Math.max(50, currentProd + 10), 'text-emerald-400', 'OIL RATE (BOPD)', currentProd)}
      </div>
    </div>
  );
};

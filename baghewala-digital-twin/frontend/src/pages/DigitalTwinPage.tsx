import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { DigitalTwinViewport } from '../components/digital-twin';
import { Play, Sliders, AlertTriangle } from 'lucide-react';
import { getActiveModelMode } from '../simulation/historicalCalibration/parameterRegistry';
import { useScenarioStore } from '../simulation/scenario';

export const DigitalTwinPage: React.FC = () => {
  const activeMode = getActiveModelMode();
  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    mobilityResult,
    productionResult,
    srpOptimizationResult,
    aiRiskResult,
  } = useScenarioStore();

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <div className="bg-sky-950/60 border border-sky-800/80 rounded-lg p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-sky-200">
        <div className="flex items-center gap-2 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <span>DEMO MODE — SIMULATED DEMONSTRATION DATA</span>
        </div>
        <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>REAL FIELD DATA: NOT CONNECTED (Advisory Support Only)</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <PageHeader
          title="2D Digital Twin Workspace"
          subtitle="Interactive 2D schematic with synchronized stroke motion, flow paths & thermal animation"
          badgeText="Step 3.4 Animated Twin"
        />

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">MODEL MODE:</span>
            <span className={`font-bold ${activeMode === 'CALIBRATED' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {activeMode}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/80 border border-cyan-800 rounded-lg text-xs font-mono font-bold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            UNCERTAINTY: ACTIVE
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/80 border border-emerald-800 rounded-lg text-xs font-mono font-bold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            DECISION ENGINE: OPTIMIZED
          </div>
        </div>
      </div>

      {/* Main Viewport Workspace */}
      <DigitalTwinViewport />

      {/* Live Simulation Telemetry Readout Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>REAL-TIME DIGITAL TWIN MONITORING (SHARED SIMULATION STATE: {activeScenario.name})</span>
          </div>
          <Link
            to="/realtime-monitoring"
            className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold underline text-[11px]"
          >
            Open Real-Time Monitor & What-If Engine →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-[10px]">
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-slate-400">RESERVOIR TEMP</div>
            <div className="text-xs font-bold text-amber-400 mt-0.5">
              {thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C
            </div>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-slate-400">VISCOSITY</div>
            <div className="text-xs font-bold text-sky-400 mt-0.5">
              {viscosityResult.estimatedViscosityCp.toLocaleString()} cP
            </div>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-slate-400">MOBILITY</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">
              {mobilityResult.mobilityDcP.toFixed(4)} D/cP
            </div>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-slate-400">PRODUCTION</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">
              {productionResult.estimatedProductionBopd.toFixed(2)} BOPD
            </div>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-slate-400">VFD FREQ</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">
              {activeScenario.inputs.vfdFrequencyHz.toFixed(1)} Hz
            </div>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-slate-400">PUMP SPEED</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">
              {activeScenario.inputs.spm.toFixed(1)} SPM
            </div>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-slate-400">SRP LOAD</div>
            <div className="text-xs font-bold text-cyan-400 mt-0.5">
              {srpOptimizationResult.currentCandidate.loadIndex.toFixed(1)} / 100
            </div>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-slate-400">RISK PROFILE</div>
            <div className={`text-xs font-bold mt-0.5 ${
              aiRiskResult.riskLevel === 'HIGH'
                ? 'text-rose-400'
                : aiRiskResult.riskLevel === 'MODERATE'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}>
              {aiRiskResult.riskLevel} ({aiRiskResult.riskScore}/100)
            </div>
          </div>
        </div>
      </div>

      {/* Development Status Note */}
      <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
        <Play className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Step 3.4 dynamic animation active (Synchronized sucker rod reciprocating motion, downhole pump plunger stroke, surface walking beam rocking, oil inflow vectors, production upflow, steam injection, thermal pulse). Model mode: {activeMode}. Shared Scenario: {activeScenario.name}.
        </span>
      </div>
    </div>
  );
};


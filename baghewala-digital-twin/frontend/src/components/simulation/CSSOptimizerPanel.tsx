import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { AnimationProvider } from '../digital-twin/animations';
import { CSSLiveMetrics } from '../css/CSSLiveMetrics';
import { CSS2DVisualization } from '../css/CSS2DVisualization';
import { CSSCausalChain } from '../css/CSSCausalChain';
import { CSSHealthPanel } from '../css/CSSHealthPanel';
import { CSSCandidatePanel } from '../css/CSSCandidatePanel';
import { CSSRecoveryChart } from '../css/CSSRecoveryChart';
import { Flame, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

const CSSAlertBanner: React.FC = () => {
  const { committedSimulationResult, cssOptimizationResult, aiRiskResult } = useScenarioStore();
  const inputs = committedSimulationResult.inputs;
  const status = cssOptimizationResult.status;

  let alertMessage = 'Thermal injection operating within optimal recovery envelope.';
  let alertIcon = ShieldCheck;
  let alertStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300';

  if (inputs.steamInjectionRateTpd < 30) {
    alertMessage = 'LOW HEAT INPUT: Steam injection rate <30 TPD. Thermal penetration insufficient for high viscosity reduction.';
    alertIcon = AlertTriangle;
    alertStyle = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300';
  } else if (inputs.steamQualityPercent < 65) {
    alertMessage = 'LOW STEAM QUALITY: Vapor fraction <65%. Excessive condensate heat loss downhole.';
    alertIcon = AlertTriangle;
    alertStyle = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300';
  } else if (status === 'CAUTION') {
    alertMessage = 'HIGH STEAM DEMAND / CAUTION: Elevated steam consumption. Monitor steam-oil ratio (CSOR).';
    alertIcon = AlertTriangle;
    alertStyle = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300';
  } else if (status === 'HIGH_THERMAL_LOAD' || status === 'OUT_OF_RANGE') {
    alertMessage = 'HIGH SYSTEM RISK / THERMAL OVERLOAD: Injection setpoint exceeds safe reservoir boundary.';
    alertIcon = ShieldAlert;
    alertStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300';
  }

  const Icon = alertIcon;

  return (
    <div className={`border rounded-xl p-3 text-xs font-mono flex items-center justify-between gap-3 shadow-xs ${alertStyle}`}>
      <div className="flex items-center gap-2.5 font-bold">
        <Icon className="w-4 h-4 shrink-0" />
        <span>CSS ADVISORY: {alertMessage}</span>
      </div>
      <div className="text-[10.5px] font-sans font-medium opacity-90 hidden sm:block">
        System Risk Score: <strong>{aiRiskResult.riskScore}/100</strong> ({aiRiskResult.riskLevel})
      </div>
    </div>
  );
};

export const CSSOptimizerPanel: React.FC = () => {
  return (
    <AnimationProvider>
      <div className="space-y-5">
        {/* Top Header Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5" />
              <span>Phase 4.8 • Cyclic Steam Stimulation (CSS) Heavy-Oil Recovery Workstation</span>
            </div>
            <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">
              CYCLIC STEAM STIMULATION (CSS) & THERMAL RECOVERY OPTIMIZER
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 leading-relaxed">
              Multi-phase steam injection modeling, heat penetration dissipation, heavy-oil viscosity reduction & Pareto recovery optimization.
            </p>
          </div>
        </div>

        {/* Compact Alert Banner */}
        <CSSAlertBanner />

        {/* 1. Live Operating Telemetry Strip */}
        <CSSLiveMetrics />

        {/* 2. 2D Animated CSS Working Schematic */}
        <CSS2DVisualization />

        {/* 3. Live Thermal Causal Chain */}
        <CSSCausalChain />

        {/* 4. Thermal Recovery Status & Sparkline Charts Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CSSHealthPanel />
          <CSSRecoveryChart />
        </div>

        {/* 5. Candidate Optimization & Screening Panel */}
        <CSSCandidatePanel />
      </div>
    </AnimationProvider>
  );
};

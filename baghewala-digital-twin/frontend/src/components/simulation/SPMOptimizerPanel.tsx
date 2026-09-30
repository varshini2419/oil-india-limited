import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { AnimationProvider } from '../digital-twin/animations';
import { SRPLiveMetrics } from '../srp/SRPLiveMetrics';
import { SRP2DVisualization } from '../srp/SRP2DVisualization';
import { SRPHealthPanel } from '../srp/SRPHealthPanel';
import { DynamometerChart } from '../srp/DynamometerChart';
import { SPMCandidatePanel } from '../srp/SPMCandidatePanel';
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

const SPMAlertBanner: React.FC = () => {
  const { srpOptimizationResult, aiRiskResult } = useScenarioStore();
  const status = srpOptimizationResult.currentCandidate.status;

  let alertMessage = 'SRP operating within healthy mechanical envelope.';
  let alertIcon = ShieldCheck;
  let alertStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300';

  if (status === 'CAUTION') {
    alertMessage = 'Mechanical load approaching operating boundary. Speed or stroke adjustment recommended.';
    alertIcon = AlertTriangle;
    alertStyle = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300';
  } else if (status === 'HIGH_LOAD') {
    alertMessage = 'SRP load exceeds recommended safe operating envelope (>85/100). High fatigue risk.';
    alertIcon = ShieldAlert;
    alertStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300';
  } else if (status === 'OUT_OF_RANGE') {
    alertMessage = 'Operating setpoint exceeds configured equipment mechanical bounds.';
    alertIcon = ShieldAlert;
    alertStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300';
  }

  const Icon = alertIcon;

  return (
    <div className={`border rounded-xl p-3 text-xs font-mono flex items-center justify-between gap-3 shadow-xs ${alertStyle}`}>
      <div className="flex items-center gap-2.5 font-bold">
        <Icon className="w-4 h-4 shrink-0" />
        <span>STATUS ADVISORY: {alertMessage}</span>
      </div>
      <div className="text-[10.5px] font-sans font-medium opacity-90 hidden sm:block">
        System Risk Score: <strong>{aiRiskResult.riskScore}/100</strong> ({aiRiskResult.riskLevel})
      </div>
    </div>
  );
};

export const SPMOptimizerPanel: React.FC = () => {
  return (
    <AnimationProvider>
      <div className="space-y-5">
        {/* Header Title Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
              <Cpu className="w-3.5 h-3.5" />
              <span>Phase 4.7 • Artificial Lift & Sucker Rod Pump Optimization Workstation</span>
            </div>
            <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">
              SUCKER ROD PUMP (SRP) & VFD SPEED OPTIMIZER
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time kinematic 2D visualization, API RP 11L dynamometer card derivation & Pareto candidate screening.
            </p>
          </div>
        </div>

        {/* Compact Alert Banner */}
        <SPMAlertBanner />

        {/* Section 1: Live Operating Telemetry Strip */}
        <SRPLiveMetrics />

        {/* Section 2: 2D Animated Working Schematic */}
        <SRP2DVisualization />

        {/* Section 3: Mechanical Health & Dynamometer Card Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SRPHealthPanel />
          <DynamometerChart />
        </div>

        {/* Section 4: SPM Candidate Optimization Table */}
        <SPMCandidatePanel />
      </div>
    </AnimationProvider>
  );
};

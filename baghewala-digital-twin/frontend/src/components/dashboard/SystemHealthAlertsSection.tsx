import React from 'react';
import { useTelemetryFluctuation } from './useTelemetryFluctuation';
import { calculatePredictiveRisks } from '../predictiveMaintenance/RiskGauges';
import { useScenarioStore } from '../../simulation/scenario';
import { ShieldAlert, Activity, BellRing, ArrowRight, AlertTriangle } from 'lucide-react';
import type { WorkstationTab } from '../../pages/SimulationPage';

interface SystemHealthAlertsSectionProps {
  onNavigateTab?: (tab: WorkstationTab) => void;
}

export const SystemHealthAlertsSection: React.FC<SystemHealthAlertsSectionProps> = ({ onNavigateTab }) => {
  const tel = useTelemetryFluctuation();
  const { srpOptimizationResult, aiRiskResult } = useScenarioStore();
  const curCandidate = srpOptimizationResult.currentCandidate;
  const baseRisks = calculatePredictiveRisks(curCandidate, aiRiskResult.riskScore);

  const sysRiskScore = tel.riskScore;
  const healthPct = tel.healthPct;
  const rodFailPct = Number(Math.min(100, baseRisks.rodFailurePct + (sysRiskScore * 0.1 - 0.2)).toFixed(1));
  const pumpUnseatPct = Number(Math.min(100, baseRisks.pumpUnseatingPct + (sysRiskScore * 0.08 - 0.1)).toFixed(1));
  const rodFloatPct = Number(Math.min(100, baseRisks.rodFloatingPct + (sysRiskScore * 0.09 - 0.1)).toFixed(1));
  const thermalRiskPct = Number(Math.min(100, sysRiskScore * 0.4 + 5).toFixed(0));
  const mechRiskPct = Number(Math.min(100, tel.srpLoad * 0.3 + 8).toFixed(0));

  const gauges = [
    { label: 'SYSTEM RISK', val: sysRiskScore, isHealth: false },
    { label: 'EQUIPMENT HEALTH', val: healthPct, isHealth: true },
    { label: 'ROD FAILURE RISK', val: rodFailPct, isHealth: false },
    { label: 'PUMP UNSEATING', val: pumpUnseatPct, isHealth: false },
    { label: 'ROD FLOATING', val: rodFloatPct, isHealth: false },
    { label: 'THERMAL RISK', val: thermalRiskPct, isHealth: false },
    { label: 'MECHANICAL RISK', val: mechRiskPct, isHealth: false },
  ];

  const renderMiniGauge = (label: string, valPct: number, isHealth: boolean) => {
    let isGood = isHealth ? valPct >= 80 : valPct < 20;
    let isWarn = isHealth ? valPct >= 60 && valPct < 80 : valPct >= 20 && valPct < 45;
    let color = isGood ? '#10b981' : isWarn ? '#f59e0b' : '#f43f5e';
    let textClass = isGood ? 'text-emerald-400' : isWarn ? 'text-amber-400' : 'text-rose-400';
    let tag = isHealth
      ? valPct >= 80 ? 'HEALTHY' : valPct >= 60 ? 'ATTENTION' : 'DEGRADED'
      : isGood ? 'LOW' : isWarn ? 'MODERATE' : 'HIGH';

    const r = 24;
    const circ = 2 * Math.PI * r;
    const offset = circ - (valPct / 100) * circ;

    return (
      <div key={label} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-between text-center space-y-1">
        <span className="text-[8.5px] text-slate-400 font-bold uppercase truncate max-w-[90px]">{label}</span>
        <div className="relative w-14 h-14 flex items-center justify-center my-0.5">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r={r} fill="none" stroke="#1e293b" strokeWidth="5" />
            <circle
              cx="30"
              cy="30"
              r={r}
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-white">{valPct.toFixed(1)}%</span>
          </div>
        </div>
        <span className={`text-[8.5px] font-bold ${textClass}`}>● {tag}</span>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-xl space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          <span>SYSTEM HEALTH, RISK GAUGES & AUDIT ALERTS</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 font-bold">
          CONTINUOUS DIAGNOSTICS ENGINE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: 7 Radial Risk & Health Gauges */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>SUBSYSTEM MECHANICAL & THERMAL RISK RADIALS</span>
            </div>
            <span className="text-[10px] text-sky-400 font-bold">7 RADIAL GAUGES</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {gauges.map((g) => renderMiniGauge(g.label, g.val, g.isHealth))}
          </div>
        </div>

        {/* Right: Section 13 & 14 Active Alerts & Event Mini Timeline */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>ACTIVE ALERTS SUMMARY</span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold">LIVE STREAM</span>
          </div>

          {/* Counts Bar */}
          <div className="grid grid-cols-4 gap-1.5 text-center font-bold">
            <div className="bg-slate-900 p-1.5 rounded border border-rose-800 text-rose-400">
              <span className="text-[8px] block opacity-75">CRITICAL</span>
              <span className="text-xs">0</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-orange-800 text-orange-400">
              <span className="text-[8px] block opacity-75">HIGH</span>
              <span className="text-xs">0</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-amber-800 text-amber-400">
              <span className="text-[8px] block opacity-75">WARNING</span>
              <span className="text-xs">1</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-emerald-800 text-emerald-400">
              <span className="text-[8px] block opacity-75">NORMAL</span>
              <span className="text-xs">5</span>
            </div>
          </div>

          {/* Latest Alert Preview Card */}
          <div className="bg-slate-900 border border-amber-900/60 rounded-xl p-2.5 space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> WARNING ALERT
              </span>
              <span className="text-slate-400">09:46:36</span>
            </div>
            <p className="text-[10.5px] font-bold text-slate-200">Steam Quality Variation: {tel.steamQuality.toFixed(0)}% → 72%</p>
            <p className="text-[9.5px] text-slate-400">Minor insulation loss in steam delivery line.</p>
          </div>

          {/* Section 14: Live Event Mini Timeline */}
          <div className="space-y-1 border-t border-slate-800 pt-2">
            <span className="text-[9.5px] font-bold text-slate-400 block uppercase">LIVE EVENT MINI TIMELINE</span>
            <div className="space-y-1 text-[9.5px] max-h-[85px] overflow-y-auto scrollbar-none pr-1">
              <div className="flex items-center justify-between text-slate-300">
                <span>09:46:12</span>
                <span className="text-emerald-400 font-bold">Normal — Thermal state stable</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>09:46:20</span>
                <span className="text-amber-400 font-bold">Warning — SRP load increased</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>09:46:28</span>
                <span className="text-emerald-400 font-bold">Normal — Load returned to safe range</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>09:46:36</span>
                <span className="text-amber-400 font-bold">Warning — Steam quality changed</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>09:46:40</span>
                <span className="text-emerald-400 font-bold">Normal — System stable</span>
              </div>
            </div>
          </div>

          {/* View Alerts Button */}
          <button
            onClick={() => onNavigateTab && onNavigateTab('ALERTS_EVENTS')}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <span>View Alerts & Events Workstation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

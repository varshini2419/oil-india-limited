import React, { useState, useEffect } from 'react';
import { useAnimation } from '../digital-twin/animations';
import { useScenarioStore } from '../../simulation/scenario';
import { LayoutDashboard, Clock, Activity } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  const { progress } = useAnimation();
  const { aiRiskResult, srpOptimizationResult } = useScenarioStore();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const timestep = Math.floor(progress * 100);
  const status = srpOptimizationResult.currentCandidate.status || 'NORMAL';
  const riskLevel = aiRiskResult.riskLevel || 'LOW';

  const statusTone =
    status === 'HIGH_LOAD' || riskLevel === 'HIGH'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : status === 'CAUTION' || riskLevel === 'MODERATE'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl font-mono text-xs text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Title & Badge */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] text-sky-400 font-bold uppercase tracking-widest">
          <LayoutDashboard className="w-4 h-4 text-sky-400" />
          <span>Baghewala Heavy-Oil Digital Twin • Operational Command Center</span>
        </div>
        <h1 className="text-xl font-bold font-sans text-white tracking-tight flex items-center gap-3">
          BAGHEWALA DIGITAL TWIN LIVE OPERATIONS DASHBOARD
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </h1>
        <p className="text-[11px] text-slate-400 font-sans">
          Real-time reactive telemetry, thermal reservoir monitoring, SRP mechanical performance & predictive health analytics.
        </p>
      </div>

      {/* Live Operational Counters */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>● LIVE</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-300 border-l border-slate-800 pl-3">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>Simulation Time: <strong className="text-white">{timeStr || '09:46:40'}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-300 border-l border-slate-800 pl-3">
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <span>Timestep: <strong className="text-white">t = {timestep}</strong></span>
        </div>

        <div className={`px-3 py-1 rounded-md text-[11px] font-bold border ${statusTone} border-l border-slate-800 ml-1`}>
          System Status: {status === 'NORMAL' && riskLevel === 'LOW' ? 'NORMAL' : status}
        </div>
      </div>
    </div>
  );
};

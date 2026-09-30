import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, BellRing } from 'lucide-react';
import type { SystemEvent } from './LiveEventFeed';

export interface AlertCounts {
  activeTotal: number;
  criticalCount: number;
  highCount: number;
  warningCount: number;
  normalCount: number;
}

interface AlertSummaryCardsProps {
  counts?: AlertCounts;
  events?: SystemEvent[];
}

export const AlertSummaryCards: React.FC<AlertSummaryCardsProps> = ({ counts: propCounts, events }) => {
  const computedCounts: AlertCounts = propCounts || {
    activeTotal: events?.filter((e) => !e.isAcknowledged).length || 0,
    criticalCount: events?.filter((e) => e.severity === 'CRITICAL').length || 0,
    highCount: events?.filter((e) => e.severity === 'HIGH').length || 0,
    warningCount: events?.filter((e) => e.severity === 'WARNING').length || 0,
    normalCount: events?.filter((e) => e.severity === 'NORMAL').length || 0,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
      {/* Card 1: ACTIVE ALERTS */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-3.5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>ACTIVE ALERTS</span>
          <BellRing className="w-4 h-4 text-sky-500 animate-pulse" />
        </div>
        <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
          {computedCounts.activeTotal}
        </div>
        <div className="text-[9.5px] text-slate-400">Unacknowledged Events</div>
      </div>

      {/* Card 2: CRITICAL EVENTS */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-3.5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>CRITICAL EVENTS</span>
          <ShieldAlert className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
          {computedCounts.criticalCount}
        </div>
        <div className="text-[9.5px] text-slate-400">Immediate Action Required</div>
      </div>

      {/* Card 3: HIGH & WARNING RISK */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-3.5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>WARNINGS / HIGH</span>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
          {computedCounts.warningCount + computedCounts.highCount}
        </div>
        <div className="text-[9.5px] text-slate-400">Cautionary Thresholds</div>
      </div>

      {/* Card 4: NORMAL EVENTS */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-3.5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>NORMAL SYNC</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
          {computedCounts.normalCount}
        </div>
        <div className="text-[9.5px] text-slate-400">Synchronized Baseline</div>
      </div>
    </div>
  );
};

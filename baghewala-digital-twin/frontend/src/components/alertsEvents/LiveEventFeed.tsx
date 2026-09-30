import React from 'react';
import type { SeverityFilter, CategoryFilter, ViewTab } from './EventFilters';
import { CheckCircle2, Info } from 'lucide-react';

export interface SystemEvent {
  id: string;
  timestamp: string;
  severity: 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';
  category: 'SRP' | 'CSS' | 'PREDICTIVE' | 'PRODUCTION' | 'AI_RISK';
  title: string;
  parameter: string;
  currentValue: string;
  threshold: string;
  delta?: string;
  cause: string;
  action: string;
  isAcknowledged: boolean;
}

interface LiveEventFeedProps {
  events: SystemEvent[];
  activeTab: ViewTab;
  severityFilter: SeverityFilter;
  categoryFilter: CategoryFilter;
  searchQuery: string;
  onAcknowledge: (eventId: string) => void;
  onSelectEvent: (event: SystemEvent) => void;
}

export const LiveEventFeed: React.FC<LiveEventFeedProps> = ({
  events,
  activeTab,
  severityFilter,
  categoryFilter,
  searchQuery,
  onAcknowledge,
  onSelectEvent,
}) => {
  // Filter events based on tab, severity, category, and search query
  const filteredEvents = events.filter((e) => {
    if (activeTab === 'ACTIVE' && e.isAcknowledged) return false;
    if (severityFilter !== 'ALL' && e.severity !== severityFilter) return false;
    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        e.title.toLowerCase().includes(q) ||
        e.parameter.toLowerCase().includes(q) ||
        e.currentValue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 font-mono shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300 text-xs">
          <Info className="w-4 h-4 text-sky-500" />
          <span>CHRONOLOGICAL LIVE EVENT STREAM</span>
        </div>
        <span className="text-[10px] text-slate-500 font-sans">
          Showing {filteredEvents.length} Event(s)
        </span>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400 space-y-1">
          <p className="text-xs font-sans">No matching operational events in stream.</p>
          <span className="text-[10px]">All system parameters synchronized within normal limits.</span>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 pr-1">
          {filteredEvents.map((e) => {
            const isNormal = e.severity === 'NORMAL';
            const isWarning = e.severity === 'WARNING';
            const isHigh = e.severity === 'HIGH';

            const severityTone = isNormal
              ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
              : isWarning
              ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
              : isHigh
              ? 'text-orange-700 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800'
              : 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';

            return (
              <div
                key={e.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs hover:border-sky-300 dark:hover:border-sky-700 transition-all group"
              >
                {/* Event Left Info */}
                <div className="space-y-1 flex-1 cursor-pointer" onClick={() => onSelectEvent(e)}>
                  <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                    <span className="text-slate-400 font-bold">● {e.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded font-bold border ${severityTone}`}>
                      {e.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                      {e.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-500 transition-colors">
                    {e.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Param: <strong className="text-sky-600 dark:text-sky-400">{e.parameter}</strong>
                    </span>
                    <span>
                      Value: <strong className="text-slate-700 dark:text-slate-200">{e.currentValue}</strong>
                    </span>
                    <span>
                      Limit: <strong className="text-slate-500">{e.threshold}</strong>
                    </span>
                    {e.delta && (
                      <span className="text-rose-500 font-bold text-[10px]">({e.delta})</span>
                    )}
                  </div>
                </div>

                {/* Event Actions Right */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectEvent(e)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10.5px] font-bold transition-all cursor-pointer"
                  >
                    Audit Details
                  </button>

                  {!e.isAcknowledged ? (
                    <button
                      onClick={() => onAcknowledge(e.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 rounded border border-emerald-200 dark:border-emerald-800">
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import type { SystemEvent } from './LiveEventFeed';
import { Clock, Activity, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface EventTimelineProps {
  events: SystemEvent[];
  onSelectEvent: (event: SystemEvent) => void;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events, onSelectEvent }) => {
  // Sort events chronologically (latest first or earliest first - let's take recent 10 events)
  const recentEvents = [...events].slice(0, 10);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 font-mono shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300 text-xs">
          <Activity className="w-4 h-4 text-sky-500" />
          <span>CHRONOLOGICAL SEVERITY TIMELINE TRAJECTORY</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-sans">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Last {recentEvents.length} Events</span>
        </div>
      </div>

      {recentEvents.length === 0 ? (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400 text-xs">
          No system events recorded on timeline.
        </div>
      ) : (
        <div className="relative pt-3 pb-2 px-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {/* Connector Line */}
          <div className="absolute top-8 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />

          <div className="flex items-center justify-between min-w-[650px] gap-4 relative z-10">
            {recentEvents.map((evt, idx) => {
              const isNormal = evt.severity === 'NORMAL';
              const isWarning = evt.severity === 'WARNING';
              const isHigh = evt.severity === 'HIGH';

              const badgeBg = isNormal
                ? 'bg-emerald-500 text-white border-emerald-300'
                : isWarning
                ? 'bg-amber-500 text-white border-amber-300'
                : isHigh
                ? 'bg-orange-500 text-white border-orange-300'
                : 'bg-rose-600 text-white border-rose-300';

              const icon = isNormal ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isWarning ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5" />
              );

              return (
                <div
                  key={evt.id || idx}
                  onClick={() => onSelectEvent(evt)}
                  className="flex flex-col items-center cursor-pointer group flex-1"
                >
                  {/* Timeline Node Icon */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-sm transition-transform group-hover:scale-125 ${badgeBg}`}
                  >
                    {icon}
                  </div>

                  {/* Timestamp & Category */}
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-2 truncate max-w-[90px]">
                    {evt.timestamp}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-0.5 font-bold">
                    {evt.category}
                  </span>

                  {/* Parameter & Delta */}
                  <span className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[100px] text-center">
                    {evt.parameter}
                  </span>
                  {evt.delta && (
                    <span className="text-[9px] font-semibold text-sky-600 dark:text-sky-400">
                      {evt.delta}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

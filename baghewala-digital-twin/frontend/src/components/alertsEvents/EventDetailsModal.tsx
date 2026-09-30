import React from 'react';
import { X, CheckCircle2, Info } from 'lucide-react';
import type { SystemEvent } from './LiveEventFeed';

interface EventDetailsModalProps {
  event: SystemEvent | null;
  onClose: () => void;
  onAcknowledge: (eventId: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onAcknowledge }) => {
  if (!event) return null;

  const isNormal = event.severity === 'NORMAL';
  const isWarning = event.severity === 'WARNING';
  const isHigh = event.severity === 'HIGH';

  const severityBadgeTone = isNormal
    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
    : isWarning
    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
    : isHigh
    ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800'
    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono text-xs relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
            <Info className="w-4 h-4 text-sky-500" />
            <span>OPERATIONAL EVENT AUDIT DETAIL</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Severity Badge */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${severityBadgeTone}`}>
              {event.severity}
            </span>
            <span className="text-[11px] text-slate-400">{event.timestamp}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold ml-auto">
              {event.category} MODULE
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{event.title}</h3>
        </div>

        {/* Audit Metric Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block text-[9.5px] font-bold uppercase">PARAMETER</span>
            <strong className="text-sky-600 dark:text-sky-400 block">{event.parameter}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[9.5px] font-bold uppercase">CURRENT VALUE</span>
            <strong className="text-rose-600 dark:text-rose-400 block">{event.currentValue}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[9.5px] font-bold uppercase">OPERATING THRESHOLD</span>
            <strong className="text-amber-600 dark:text-amber-400 block">{event.threshold}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[9.5px] font-bold uppercase">ACK STATUS</span>
            <strong className={event.isAcknowledged ? 'text-emerald-500 block' : 'text-amber-500 block'}>
              {event.isAcknowledged ? 'ACKNOWLEDGED' : 'ACTIVE / UNACKNOWLEDGED'}
            </strong>
          </div>
        </div>

        {/* Engineering Cause & Action */}
        <div className="space-y-2 font-sans text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-800 dark:text-slate-200 block font-bold mb-1">Engineering Cause & Diagnosis:</strong>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">{event.cause}</p>
          </div>

          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <strong className="text-emerald-800 dark:text-emerald-300 block font-bold mb-1">Recommended Action:</strong>
            <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed text-[11.5px]">{event.action}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-3">
          {!event.isAcknowledged && (
            <button
              onClick={() => {
                onAcknowledge(event.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer font-mono"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ACKNOWLEDGE EVENT</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer font-mono"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

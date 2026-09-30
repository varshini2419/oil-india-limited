import React from 'react';
import { AlertTriangle, Database } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { BAGHEWALA_HISTORICAL_INCIDENTS } from '../../services/baghewalaRagEngine';

export const FailureHistoryPanel: React.FC = () => {
  const records = BAGHEWALA_HISTORICAL_INCIDENTS.filter((incident) => /ROD|PUMP|UNSETTING|LIFT/i.test(`${incident.eventType} ${incident.title}`));
  return (
    <Panel title="Documented failure history" subtitle="Loaded from the Baghewala historical incident registry.">
      {records.length === 0 ? (
        <div className="flex items-start gap-2 text-sm text-gray-600"><AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />No documented failure history loaded. Import an incident register to compare rod and pump events.</div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <article key={record.id} className="rounded border border-gray-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-gray-900">{record.title}</h3><span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">DOCUMENTED</span></div>
              <p className="mt-1 text-xs text-gray-600">{record.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-500"><span><Database className="mr-1 inline h-3 w-3" />{record.source}</span><span>{record.date ?? 'Date not available'}</span><span>{record.consequence ?? 'Consequence not available'}</span></div>
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
};
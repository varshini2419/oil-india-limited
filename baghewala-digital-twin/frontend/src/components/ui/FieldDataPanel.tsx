import React from 'react';
import {
  BAGHEWALA_FIELD_PROFILE,
  JODHPUR_RESERVOIR_PROFILE,
  BAGHEWALA_CRUDE_PROFILE,
  REPRESENTATIVE_WELL_BGW_REP_01,
  HISTORICAL_EVENTS,
  getSourceBadgeClass,
} from '../../data/baghewala';
import type { ParameterMetadata } from '../../data/baghewala';
import { Panel } from './Panel';
import { Database, History, BookOpen } from 'lucide-react';

const ParameterRow: React.FC<{ label: string; meta: ParameterMetadata<any> }> = ({
  label,
  meta,
}) => {
  const badgeClass = getSourceBadgeClass(meta.sourceType);
  const displayValue =
    meta.value === null || meta.value === undefined
      ? 'Not Documented'
      : `${meta.value}${meta.unit ? ` ${meta.unit}` : ''}`;

  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded border border-slate-800 text-xs font-mono">
      <span className="text-slate-400 font-medium">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="text-slate-200 font-bold">{displayValue}</span>
        <span
          className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded border ${badgeClass}`}
        >
          {meta.sourceType}
        </span>
      </div>
    </div>
  );
};

export const FieldDataPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field & Reservoir Documented Profile */}
        <Panel
          title="Baghewala Field & Reservoir Provenance"
          subtitle="Documented baseline parameters with data provenance"
          action={<Database className="w-4 h-4 text-sky-400" />}
        >
          <div className="space-y-2.5">
            <ParameterRow label="Field Name" meta={BAGHEWALA_FIELD_PROFILE.fieldName} />
            <ParameterRow label="Basin" meta={BAGHEWALA_FIELD_PROFILE.basin} />
            <ParameterRow label="Operator Context" meta={BAGHEWALA_FIELD_PROFILE.operator} />
            <ParameterRow label="Reservoir Formation" meta={JODHPUR_RESERVOIR_PROFILE.formation} />
            <ParameterRow
              label="Reservoir Depth Range"
              meta={{
                parameter: 'Depth Range',
                value: `${JODHPUR_RESERVOIR_PROFILE.depthMinMeters.value} - ${JODHPUR_RESERVOIR_PROFILE.depthMaxMeters.value}`,
                unit: 'm',
                sourceType: JODHPUR_RESERVOIR_PROFILE.depthMinMeters.sourceType,
                confidence: 'high',
              }}
            />
            <ParameterRow
              label="Native Reservoir Temp"
              meta={JODHPUR_RESERVOIR_PROFILE.reservoirTemperatureC}
            />
            <ParameterRow
              label="Matrix Permeability"
              meta={JODHPUR_RESERVOIR_PROFILE.permeabilityDarcies}
            />
            <ParameterRow
              label="Crude API Gravity"
              meta={{
                parameter: 'API Gravity Range',
                value: `${BAGHEWALA_CRUDE_PROFILE.apiGravityMin.value} - ${BAGHEWALA_CRUDE_PROFILE.apiGravityMax.value}`,
                unit: '°API',
                sourceType: BAGHEWALA_CRUDE_PROFILE.apiGravityMin.sourceType,
                confidence: 'high',
              }}
            />
          </div>
        </Panel>

        {/* Viscosity & Representative Well Profile */}
        <Panel
          title="Fluid Viscosity & Well Model"
          subtitle="Documented viscosity points & representative well profile"
          action={<BookOpen className="w-4 h-4 text-amber-400" />}
        >
          <div className="space-y-3">
            <div className="p-3 bg-slate-950/60 rounded border border-slate-800 space-y-2">
              <div className="text-[11px] font-mono text-slate-300 font-bold flex items-center justify-between">
                <span>Documented Viscosity vs Temperature (cPs)</span>
                <span className="px-1.5 py-0.5 text-[9px] uppercase font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                  DOCUMENTED
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                {BAGHEWALA_CRUDE_PROFILE.viscosityDataPoints.map((pt, idx) => (
                  <div key={idx} className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
                    <div className="text-slate-400">{pt.temperatureC}°C</div>
                    <div className="text-amber-400 font-bold">{pt.viscosityCp.toLocaleString()} cP</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <ParameterRow
                label="Representative Well ID"
                meta={{
                  parameter: 'Well ID',
                  value: REPRESENTATIVE_WELL_BGW_REP_01.wellId,
                  sourceType: REPRESENTATIVE_WELL_BGW_REP_01.sourceType,
                  confidence: 'medium',
                }}
              />
              <ParameterRow
                label="Artificial Lift System"
                meta={REPRESENTATIVE_WELL_BGW_REP_01.artificialLiftMethod}
              />
              <ParameterRow
                label="CSS Completion Status"
                meta={REPRESENTATIVE_WELL_BGW_REP_01.completionStatus}
              />
            </div>
          </div>
        </Panel>
      </div>

      {/* Historical Timeline Events Panel */}
      <Panel
        title="Documented Baghewala Historical Timeline"
        subtitle="Chronological milestones verified from published literature"
        action={<History className="w-4 h-4 text-purple-400" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {HISTORICAL_EVENTS.map((evt) => (
            <div
              key={evt.id}
              className="p-3 bg-slate-950/60 rounded border border-slate-800 space-y-1.5 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="text-sky-400 font-bold">{evt.year}</span>
                <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                  {evt.sourceType}
                </span>
              </div>
              <h4 className="font-bold text-slate-200">{evt.title}</h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {evt.description}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

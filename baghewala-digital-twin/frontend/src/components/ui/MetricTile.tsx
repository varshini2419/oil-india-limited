import React from 'react';
import {
  Thermometer,
  Droplets,
  Waves,
  Gauge,
  Activity,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';

export type ProvenanceLevel = 'DOCUMENTED' | 'MODELED' | 'SIMULATED' | 'ASSUMPTION';

const PROVENANCE_CLASSES: Record<ProvenanceLevel, string> = {
  DOCUMENTED: 'bg-blue-500/15 text-blue-700 border border-blue-500/30',
  MODELED: 'bg-violet-500/15 text-violet-700 border border-violet-500/30',
  SIMULATED: 'bg-sky-500/15 text-sky-700 border border-sky-500/30',
  ASSUMPTION: 'bg-amber-500/15 text-amber-800 border border-amber-500/30',
};

/** Standard metric icon keys: Temp, Viscosity, Mobility, Production, SRP Load, Risk. */
const METRIC_ICONS = {
  temperature: Thermometer,
  viscosity: Droplets,
  mobility: Waves,
  production: Gauge,
  srpLoad: Activity,    risk: ShieldAlert,
} as const;

export type MetricIconKey = keyof typeof METRIC_ICONS;

export interface MetricTileProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  /** Provenance chip: DOCUMENTED / MODELED / SIMULATED / ASSUMPTION. Omit only when unknown. */
  provenance?: ProvenanceLevel;
  icon?: MetricIconKey;
  hint?: string;
  className?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  unit,
  provenance,
  icon,
  hint,
  className,
}) => {
  const Icon: LucideIcon | null = icon ? METRIC_ICONS[icon] : null;

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className ?? ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-gray-500">
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />}
          {label}
        </span>
        {provenance && (
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${PROVENANCE_CLASSES[provenance]}`}
          >
            {provenance}
          </span>
        )}
      </div>
      <div className="mt-2 font-mono text-lg font-bold text-gray-900">
        {value}
        {unit && <span className="ml-1 text-xs font-medium text-gray-500">{unit}</span>}
      </div>
      {hint && <p className="mt-1 font-sans text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

export interface MetricStripProps {
  children: React.ReactNode;
  className?: string;
}

/** Responsive one-row strip of MetricTiles. */
export const MetricStrip: React.FC<MetricStripProps> = ({ children, className }) => (
  <div className={`grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 ${className ?? ''}`}>
    {children}
  </div>
);

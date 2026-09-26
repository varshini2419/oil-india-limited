import type { ParameterMetadata, SourceType } from './types';

export const isDocumented = (meta?: ParameterMetadata<any> | null): boolean => {
  return meta?.sourceType === 'documented';
};

export const isDerived = (meta?: ParameterMetadata<any> | null): boolean => {
  return meta?.sourceType === 'derived';
};

export const isAssumption = (meta?: ParameterMetadata<any> | null): boolean => {
  return meta?.sourceType === 'assumption';
};

export const isScenario = (meta?: ParameterMetadata<any> | null): boolean => {
  return meta?.sourceType === 'scenario';
};

export const getSourceBadgeClass = (sourceType: SourceType): string => {
  switch (sourceType) {
    case 'documented':
      return 'bg-emerald-950 text-emerald-400 border-emerald-800/80';
    case 'derived':
      return 'bg-cyan-950 text-cyan-400 border-cyan-800/80';
    case 'assumption':
      return 'bg-amber-950 text-amber-400 border-amber-800/80';
    case 'scenario':
      return 'bg-purple-950 text-purple-400 border-purple-800/80';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
};

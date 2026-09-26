import React from 'react';
import type { SystemStatusType } from '../../types';

interface StatusIndicatorProps {
  status: SystemStatusType;
  label?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  className = '',
}) => {
  const getColors = () => {
    switch (status) {
      case 'ready':
        return {
          dot: 'bg-emerald-400 animate-pulse',
          text: 'text-emerald-400',
          bg: 'bg-emerald-950/40 border-emerald-800/50',
        };
      case 'simulating':
        return {
          dot: 'bg-cyan-400 animate-ping',
          text: 'text-cyan-400',
          bg: 'bg-cyan-950/40 border-cyan-800/50',
        };
      case 'warning':
        return {
          dot: 'bg-amber-400',
          text: 'text-amber-400',
          bg: 'bg-amber-950/40 border-amber-800/50',
        };
      case 'error':
        return {
          dot: 'bg-rose-500',
          text: 'text-rose-400',
          bg: 'bg-rose-950/40 border-rose-800/50',
        };
      case 'not_initialized':
      default:
        return {
          dot: 'bg-slate-500',
          text: 'text-slate-400',
          bg: 'bg-slate-800/60 border-slate-700/50',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono font-medium ${colors.bg} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
      <span className={colors.text}>{label || status.toUpperCase().replace('_', ' ')}</span>
    </div>
  );
};

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Circle,
  type LucideIcon,
} from 'lucide-react';

export type StatusTone = 'ok' | 'info' | 'warn' | 'risk' | 'critical' | 'neutral';

const TONE_CLASSES: Record<StatusTone, string> = {
  ok: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
  info: 'bg-sky-500/10 text-sky-700 border-sky-500/30',
  warn: 'bg-amber-500/10 text-amber-800 border-amber-500/30',
  risk: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
  critical: 'bg-red-500/10 text-red-700 border-red-500/30',
  neutral: 'bg-gray-500/10 text-gray-600 border-gray-400/40',
};

const TONE_ICONS: Record<StatusTone, LucideIcon> = {
  ok: CheckCircle2,
  info: Info,
  warn: AlertTriangle,
  risk: AlertTriangle,
  critical: AlertOctagon,
  neutral: Circle,
};

/** Map a raw risk/status level string (CRITICAL, HIGH, MODERATE, LOW, SAFE...) to a badge tone. */
export function statusToneFromLevel(level?: string | null): StatusTone {
  const value = (level ?? '').trim().toUpperCase();
  if (['CRITICAL', 'CRITICAL_RISK', 'FAIL', 'FAILED', 'ERROR', 'OFFLINE'].includes(value)) {
    return 'critical';
  }
  if (['HIGH', 'HIGH_RISK', 'BLOCKED'].includes(value)) return 'risk';
  if (['MODERATE', 'MEDIUM', 'CAUTION', 'WARN', 'WARNING', 'PENDING', 'PARTIAL'].includes(value)) {
    return 'warn';
  }
  if (['LOW', 'SAFE', 'READY', 'OK', 'PASS', 'PASSED', 'OPERATIONAL', 'ACTIVE', 'ONLINE', 'GOOD'].includes(value)) {
    return 'ok';
  }
  return 'neutral';
}

export interface StatusBadgeProps {
  label: string;
  /** Explicit tone. If omitted, derive from statusLevel (or fall back to neutral). */
  tone?: StatusTone;
  /** Raw level string (e.g. engine riskLevel) used to derive the tone when `tone` is not given. */
  statusLevel?: string | null;
  /** Override the default per-tone icon. Always render an icon next to the colored status. */
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone,
  statusLevel,
  icon,
  size = 'sm',
  className,
}) => {
  const resolvedTone = tone ?? statusToneFromLevel(statusLevel);
  const Icon = TONE_ICONS[resolvedTone];
  const sizeClasses =
    size === 'md' ? 'px-2.5 py-1 gap-1.5' : 'px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border text-xs font-semibold uppercase tracking-wide ${TONE_CLASSES[resolvedTone]} ${sizeClasses} ${className ?? ''}`}
    >
      {icon ?? <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
};

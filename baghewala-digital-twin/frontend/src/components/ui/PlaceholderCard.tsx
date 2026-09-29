import React from 'react';

interface PlaceholderCardProps {
  title: string;
  value: string;
  description?: string;
  statusText?: string;
  icon?: React.ReactNode;
  /** Visual tone of the value text and icon tile. */
  tone?: 'dark' | 'amber' | 'maroon' | 'green' | 'blue';
}

const toneStyles: Record<
  NonNullable<PlaceholderCardProps['tone']>,
  { value: string; tile: string; rail: string }
> = {
  dark: {
    value: 'text-slate-900',
    tile: 'bg-gray-900 text-white border-gray-900',
    rail: 'bg-gray-900',
  },
  amber: {
    value: 'text-amber-700',
    tile: 'bg-amber-400 text-amber-950 border-amber-500',
    rail: 'bg-amber-400',
  },
  maroon: {
    value: 'text-[#7f1d1d]',
    tile: 'bg-[#7f1d1d] text-white border-[#7f1d1d]',
    rail: 'bg-[#7f1d1d]',
  },
  green: {
    value: 'text-emerald-700',
    tile: 'bg-emerald-500 text-white border-emerald-600',
    rail: 'bg-emerald-500',
  },
  blue: {
    value: 'text-sky-800',
    tile: 'bg-sky-500 text-white border-sky-600',
    rail: 'bg-sky-500',
  },
};

export const PlaceholderCard: React.FC<PlaceholderCardProps> = ({
  title,
  value,
  description,
  statusText,
  icon,
  tone = 'dark',
}) => {
  const t = toneStyles[tone];

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between shadow-sm hover:border-gray-300 transition-colors overflow-hidden">
      {/* Top accent rail */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${t.rail}`} />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-gray-400">
            {title}
          </span>
          <div className={`text-[17px] font-bold font-mono mt-1 leading-snug ${t.value}`}>
            {value}
          </div>
        </div>
        {icon && (
          <div className={`w-8 h-8 shrink-0 rounded-md flex items-center justify-center border ${t.tile}`}>
            {icon}
          </div>
        )}
      </div>
      {(description || statusText) && (
        <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
          {description && <span className="text-gray-500 truncate">{description}</span>}
          {statusText && (
            <span className="shrink-0 font-mono text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
              {statusText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

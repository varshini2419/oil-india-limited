import React from 'react';

interface PlaceholderCardProps {
  title: string;
  value: string;
  description?: string;
  statusText?: string;
  icon?: React.ReactNode;
}

export const PlaceholderCard: React.FC<PlaceholderCardProps> = ({
  title,
  value,
  description,
  statusText,
  icon,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-lg font-bold font-mono text-slate-100 mt-1">
            {value}
          </div>
        </div>
        {icon && <div className="text-slate-500 p-1.5 bg-slate-800/40 rounded">{icon}</div>}
      </div>
      {(description || statusText) && (
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {description && <span className="text-slate-500">{description}</span>}
          {statusText && (
            <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {statusText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

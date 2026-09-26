import React from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden shadow-lg shadow-black/20 ${className}`}
    >
      {(title || action) && (
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

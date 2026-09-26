import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  children,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 mb-6 border-b border-slate-800 gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase font-mono">
            {title}
          </h1>
          {badgeText && (
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono bg-sky-950 text-sky-400 border border-sky-800/60 rounded">
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
};

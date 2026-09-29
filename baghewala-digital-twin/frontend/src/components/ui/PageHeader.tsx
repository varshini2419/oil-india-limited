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
          <h1 className="text-[22px] font-extrabold tracking-wide text-slate-900 uppercase font-mono">
            {title}
          </h1>
          {badgeText && (
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-mono font-bold bg-gray-100 text-gray-600 border border-gray-300 rounded">
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[13px] text-gray-500 mt-1 font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
};

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
      className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-[13px] font-bold font-sans text-gray-900 tracking-tight flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 font-sans mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

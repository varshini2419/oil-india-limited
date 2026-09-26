import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface NavigationItemProps {
  label: string;
  path: string;
  iconName: string;
  onClick?: () => void;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  path,
  iconName,
  onClick,
}) => {
  // Dynamically resolve icon from lucide-react
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName] || Icons.Circle;

  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-mono tracking-wide transition-all ${
          isActive
            ? 'bg-sky-600/20 text-sky-400 font-semibold border-l-2 border-sky-400 pl-2.5 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`
      }
    >
      <IconComponent className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
};

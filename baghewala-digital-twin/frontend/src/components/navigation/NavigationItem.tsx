import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import '../layout/Sidebar.css';

interface NavigationItemProps {
  label: string;
  path: string;
  iconName: string;
  badge?: string;
  badgeColor?: 'emerald' | 'sky' | 'amber' | 'purple';
  onClick?: () => void;
  trailingChevron?: boolean;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  path,
  iconName,
  badge,
  badgeColor = 'sky',
  onClick,
  trailingChevron = false,
}) => {
  // Dynamically resolve icon from lucide-react
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName] || Icons.Circle;

  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        `oil-nav-link group ${isActive ? 'active' : ''}`
      }
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="oil-nav-icon-container">
          <IconComponent className="w-[15px] h-[15px] shrink-0" />
        </div>
        <span className="truncate tracking-normal">{label}</span>
      </div>

      {badge && (
        <span className={`oil-micro-badge oil-micro-badge-${badgeColor} shrink-0 ml-auto`}>
          {badge}
        </span>
      )}
      {!badge && trailingChevron && (
        <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-auto opacity-60" />
      )}
    </NavLink>
  );
};

import React from 'react';
import { NavigationItem } from '../navigation/NavigationItem';
import { X, ChevronRight, Droplet } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavEntry {
  id: string;
  label: string;
  path: string;
  icon: string;
}

// Flat "Navigation Modules" list, ordered exactly like the reference design.
const navModules: NavEntry[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { id: 'digital-twin', label: 'Digital Twin', path: '/digital-twin', icon: 'Layers' },
  { id: 'well-dynamics', label: 'Well Dynamics', path: '/well-dynamics', icon: 'Activity' },
  { id: 'simulation', label: 'Simulation', path: '/simulation', icon: 'Sliders' },
  { id: 'optimization', label: 'Optimization', path: '/optimization', icon: 'GitBranch' },
  { id: 'monitoring', label: 'Live Monitoring', path: '/monitoring', icon: 'Activity' },
  { id: 'reports', label: 'Reports', path: '/reports', icon: 'FileText' },
];

const toolModules: NavEntry[] = [
  { id: 'data-explorer', label: 'Data Explorer', path: '/data-explorer', icon: 'Database' },
  { id: 'saved-scenarios', label: 'Scenarios', path: '/optimization', icon: 'GitBranch' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onCloseMobile }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`oil-sidebar-wrapper fixed lg:static top-0 left-0 bottom-0 z-50 w-[236px] flex flex-col justify-between transition-transform duration-250 ease-in-out shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto oil-sidebar-scroll flex flex-col p-3 space-y-3">
          <div className="oil-sidebar-brand">
            <div className="oil-sidebar-brand-mark"><Droplet className="h-5 w-5" /></div>
            <div><strong>BAGHEWALA</strong><span>HEAVY-OIL ASSET</span></div>
            <button type="button" aria-label="Collapse navigation" className="oil-sidebar-collapse"><ChevronRight className="h-3.5 w-3.5 rotate-180" /></button>
          </div>
          <div>
            {/* Mobile Header in Sidebar */}
            <div className="h-12 px-2 mb-2 flex items-center justify-between lg:hidden">
              <span className="oil-nav-category-header p-0">NAVIGATION MODULES</span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category header (desktop) */}
            <div className="oil-nav-category-header hidden lg:flex">
              <span>Navigation Modules</span>
            </div>

            {/* Navigation Modules list */}
            <nav className="mt-1 space-y-0.5">
              {navModules.map((item) => (
                <NavigationItem
                  key={item.id}
                  label={item.label}
                  path={item.path}
                  iconName={item.icon}
                  onClick={onCloseMobile}
                  trailingChevron={item.id === 'reports'}
                />
              ))}
            </nav>
            <div className="oil-nav-section-label">Tools</div>
            <nav className="space-y-0.5">
              {toolModules.map((item) => <NavigationItem key={item.id} label={item.label} path={item.path} iconName={item.icon} onClick={onCloseMobile} />)}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className="oil-sidebar-footer p-3.5 px-4">
          <div className="oil-sidebar-twin-card"><div className="oil-sidebar-twin-art" /><strong>Field Digital Twin</strong><span>Integrated simulation &amp; real-time data for better decisions.</span></div>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-200 truncate">
                Baghewala Heavy-Oil
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-400 oil-live-pulse" />
                Simulation Profile 1
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};

import React from 'react';
import { NavigationItem } from '../navigation/NavigationItem';
import type { NavItem } from '../../types';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onCloseMobile?: () => void;
}

const navItems: NavItem[] = [
  { id: 'well-dynamics', label: 'Well Dynamics', path: '/well-dynamics', icon: 'Activity', description: 'Interactive Oil Well Visualizer' },
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard', description: 'Overview and status' },
  { id: 'digital-twin', label: 'Digital Twin', path: '/digital-twin', icon: 'Layers', description: '2D Twin Workspace' },
  { id: 'simulation', label: 'Simulation', path: '/simulation', icon: 'Sliders', description: 'Parameters & Controls' },
  { id: 'scenarios', label: 'Scenarios', path: '/scenarios', icon: 'GitBranch', description: 'Comparative scenarios' },
  { id: 'results', label: 'Results', path: '/results', icon: 'BarChart3', description: 'Output data & metrics' },
  { id: 'final-engineering-assessment', label: 'Final Assessment', path: '/final-engineering-assessment', icon: 'FileText', description: 'Performance & evidence assessment' },
  { id: 'final-validation', label: 'Final Validation', path: '/final-validation', icon: 'ShieldCheck', description: 'Demonstration & report package' },
  { id: 'field-integration', label: 'Field Integration', path: '/field-integration', icon: 'Radio', description: 'Modeled integration & advisory pilot' },
  { id: 'release', label: 'Release & Freeze', path: '/release', icon: 'Award', description: 'Production release & final freeze' },
  { id: 'reports', label: 'Reports', path: '/reports', icon: 'FileText', description: 'Documentation & exports' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onCloseMobile }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Mobile Header in Sidebar */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 lg:hidden">
            <span className="text-xs font-mono font-bold text-slate-300">NAVIGATION</span>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 py-2">
              Navigation Modules
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavigationItem
                  key={item.id}
                  label={item.label}
                  path={item.path}
                  iconName={item.icon}
                  onClick={onCloseMobile}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="text-[11px] font-mono text-slate-400">
            <p className="font-semibold text-slate-300">Baghewala Heavy-Oil</p>
            <p className="text-[10px]">CSS & SRP Twin Shell v0.1</p>
          </div>
        </div>
      </aside>
    </>
  );
};

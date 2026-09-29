import React from 'react';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Menu, Activity, Radio, LogOut } from 'lucide-react';
import { useScenarioStore } from '../../simulation/scenario';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const scenarioStore = useScenarioStore();
  const activeScenario = scenarioStore?.activeScenario;
  const inputs = activeScenario?.inputs;
  const { user, logout } = useAuth();

  return (
    <header className="oil-header-wrapper h-14 px-3 md:px-4 flex items-center justify-between gap-3 shrink-0 select-none z-30">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          {/* Drilling emblem */}
          <div className="oil-emblem-box">
            <svg
              className="w-[18px] h-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Derrick tower */}
              <path
                d="M7 21L12 4L17 21"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.2 13H14.8M8.1 17H15.9"
                stroke="#ffffff"
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.75"
              />
              <circle cx="12" cy="3" r="1.6" fill="#d99a00" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="oil-brand-title whitespace-nowrap">
                BAGHEWALA DIGITAL TWIN
              </h1>
              <span className="oil-enterprise-ribbon hidden md:inline-block">
                An Oil High-Viscosity Enterprise
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 whitespace-nowrap leading-none mt-0.5 hidden sm:block">
              Heavy-Oil Field Simulation &amp; Decision Support
            </p>
          </div>
        </div>
      </div>

      {/* Center: scenario + telemetry + demo node + system status */}
      <div className="hidden lg:flex items-center gap-2.5">
        {activeScenario ? (
          <div className="oil-header-scenario-capsule hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-[11px]">
            <Activity className="w-3 h-3 oil-scenario-label" />
            <span className="oil-scenario-label font-bold tracking-wide">ACTIVE SCENARIO:</span>
            <span className="font-bold">{activeScenario.name}</span>
          </div>
        ) : null}

        {inputs && (
          <div className="hidden xl:flex items-center gap-1.5 font-mono">
            <span className="oil-telemetry-pill">{inputs.reservoirTemperatureC}°C</span>
            <span className="oil-telemetry-pill">{inputs.steamInjectionRateTpd} t/d</span>
            <span className="oil-telemetry-pill">{inputs.spm} SPM</span>
          </div>
        )}

        <span className="oil-demo-node-pill hidden 2xl:inline-flex">
          <span className="w-2 h-2 rounded-full bg-emerald-400 oil-live-pulse" />
          DEMO NODE
        </span>

        <div className="hidden md:flex items-center gap-1.5">
          <span className="oil-systemstatus-label">System Status:</span>
          <StatusIndicator status="ready" label="System Ready" />
        </div>
      </div>

      {/* Right: session & logout */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="oil-session-block hidden md:block">
          <div className="oil-session-name">{user?.name || 'Administrator'}</div>
          <div className="oil-session-mail">{user?.email || 'admin@gmail.com'}</div>
        </div>
        <button
          className="oil-logout-btn"
          type="button"
          onClick={logout}
          title="Sign out from session"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
        <Radio className="w-4 h-4 text-emerald-400 animate-pulse lg:hidden" />
      </div>
    </header>
  );
};

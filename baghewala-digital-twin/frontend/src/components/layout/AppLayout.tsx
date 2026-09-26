import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { ScenarioProvider } from '../../simulation/scenario';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <ScenarioProvider>
      <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
        {/* Top Header */}
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Main Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Sidebar */}
          <Sidebar
            isOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          {/* Main Workspace Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Bottom Status Bar */}
        <StatusBar />
      </div>
    </ScenarioProvider>
  );
};

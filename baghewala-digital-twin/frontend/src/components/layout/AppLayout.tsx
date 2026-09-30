import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { AdvisoryBanner } from '../ui/AdvisoryBanner';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    // ScenarioProvider lives in App.tsx so the standalone reference-design pages
    // and this shell share one simulation store.
    <div className="app-shell flex h-screen w-screen overflow-hidden font-sans">
        <Sidebar isOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
        <div className="app-main-column flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
          <main className="oil-workspace flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
            <div className="oil-page-frame w-full mx-auto space-y-5">
              <AdvisoryBanner />
              <Outlet />
            </div>
          </main>
          <StatusBar />
        </div>
      </div>
  );
};

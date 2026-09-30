import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ScenarioProvider } from './simulation/scenario';
import { NotFoundPage } from './pages/NotFoundPage';

import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { SimulationPage } from './pages/SimulationPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { ReportsPage } from './pages/ReportsPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { WellDynamicsPage } from './pages/WellDynamicsPage';
import { DataExplorerPage } from './pages/DataExplorerPage';

function App() {
  return (
    <AuthProvider>
      <ScenarioProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root to /digital-twin */}
            <Route path="/" element={<Navigate to="/digital-twin" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Application Routes */}
            <Route path="/well-dynamics" element={<WellDynamicsPage />} />
            <Route path="/optimization" element={<OptimizationPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/data-explorer" element={<DataExplorerPage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />

            {/* Workbench pages keep the shared local app shell */}
            <Route element={<AppLayout />}>
              <Route path="/digital-twin" element={<DigitalTwinPage />} />
              <Route path="/simulation" element={<SimulationPage />} />
            </Route>

            {/* Legacy bookmark redirects */}
            <Route path="/command-center" element={<Navigate to="/digital-twin" replace />} />
            <Route path="/results" element={<Navigate to="/simulation" replace />} />
            <Route path="/realtime-monitoring" element={<Navigate to="/monitoring" replace />} />
            <Route path="/production-pilot" element={<Navigate to="/monitoring" replace />} />
            <Route path="/field-data" element={<Navigate to="/data-explorer" replace />} />
            <Route path="/field-integration" element={<Navigate to="/data-explorer" replace />} />
            <Route path="/historical-validation" element={<Navigate to="/simulation" replace />} />
            <Route path="/integrated-validation" element={<Navigate to="/reports" replace />} />
            <Route path="/engineering-copilot" element={<Navigate to="/simulation" replace />} />
            <Route path="/operational-readiness" element={<Navigate to="/reports" replace />} />
            <Route path="/deployment-readiness" element={<Navigate to="/reports" replace />} />
            <Route path="/final-engineering-assessment" element={<Navigate to="/reports" replace />} />
            <Route path="/final-validation" element={<Navigate to="/reports" replace />} />
            <Route path="/release" element={<Navigate to="/reports" replace />} />

            {/* 404 fallback for unknown routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ScenarioProvider>
    </AuthProvider>
  );
}

export default App;

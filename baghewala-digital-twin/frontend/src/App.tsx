import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';

import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { SimulationPage } from './pages/SimulationPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { ResultsPage } from './pages/ResultsPage';
import { ReportsPage } from './pages/ReportsPage';
import { RealtimeMonitoringPage } from './pages/RealtimeMonitoringPage';
import { FieldDataIntegrationPage } from './pages/FieldDataIntegrationPage';
import { HistoricalValidationPage } from './pages/HistoricalValidationPage';
import { AiEngineeringCopilotPage } from './pages/AiEngineeringCopilotPage';
import { IntegratedValidationPage } from './pages/IntegratedValidationPage';
import { OperationalReadinessPage } from './pages/OperationalReadinessPage';
import { WellDynamicsPage } from './pages/WellDynamicsPage';
import { DeploymentReadinessPage } from './pages/DeploymentReadinessPage';
import { ProductionPilotPage } from './pages/ProductionPilotPage';
import { FinalEngineeringAssessmentPage } from './pages/FinalEngineeringAssessmentPage';
import { FinalValidationPage } from './pages/FinalValidationPage';
import { FieldIntegrationPage } from './pages/FieldIntegrationPage';
import { ReleasePage } from './pages/ReleasePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="well-dynamics" element={<WellDynamicsPage />} />
              <Route path="command-center" element={<Navigate to="/well-dynamics" replace />} />
              <Route path="digital-twin" element={<DigitalTwinPage />} />
              <Route path="simulation" element={<SimulationPage />} />
              <Route path="scenarios" element={<ScenariosPage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="realtime-monitoring" element={<RealtimeMonitoringPage />} />
              <Route path="field-data" element={<FieldDataIntegrationPage />} />
              <Route path="historical-validation" element={<HistoricalValidationPage />} />
              <Route path="engineering-copilot" element={<AiEngineeringCopilotPage />} />
              <Route path="integrated-validation" element={<IntegratedValidationPage />} />
              <Route path="operational-readiness" element={<OperationalReadinessPage />} />
              <Route path="deployment-readiness" element={<DeploymentReadinessPage />} />
              <Route path="production-pilot" element={<ProductionPilotPage />} />
              <Route path="final-engineering-assessment" element={<FinalEngineeringAssessmentPage />} />
              <Route path="final-validation" element={<FinalValidationPage />} />
              <Route path="field-integration" element={<FieldIntegrationPage />} />
              <Route path="release" element={<ReleasePage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

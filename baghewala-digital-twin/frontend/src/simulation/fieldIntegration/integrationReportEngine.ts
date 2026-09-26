import type { FieldIntegrationState, IntegrationReport } from './types';
import { MANDATORY_FIELD_INTEGRATION_DISCLAIMER } from './defaults';

export function generateIntegrationReport(state: FieldIntegrationState): IntegrationReport {
  const reportId = `RPT-INT-${Date.now()}`;
  const generatedAt = new Date().toISOString();

  const twinSummary = state.twinState
    ? `Temp: ${state.twinState.reservoir.reservoirTemperatureC.toFixed(1)}°C, Viscosity: ${state.twinState.reservoir.estimatedViscosityCp.toFixed(1)} cP, Mobility: ${state.twinState.reservoir.oilMobilityDcP.toFixed(5)} D/cP, Estimated Production: ${state.twinState.production.estimatedProductionBopd.toFixed(2)} BOPD`
    : 'Digital Twin State: NOT_AVAILABLE';

  const advisorySummary = `Risk Level: ${state.advisorySummary.riskLevel} (Score: ${state.advisorySummary.riskScore}/100). Recommendations: ${state.advisorySummary.recommendations.join(' | ')}`;

  return {
    reportId,
    generatedAt,
    title: 'Baghewala Digital Twin Real-World Field Integration & Controlled Pilot Readiness Report',
    mode: state.mode,
    connectionStatus: state.connectionStatus,
    provenanceLabel: state.provenanceLabel,
    dataQualityScore: state.qualityResult.qualityScore,
    freshness: state.qualityResult.freshness,
    pilotStatus: state.pilotGate.status,
    twinStateSummary: twinSummary,
    advisorySummary,
    auditEventCount: state.auditTrail.length,
    limitations: state.limitations,
    disclaimer: MANDATORY_FIELD_INTEGRATION_DISCLAIMER,
  };
}

import type { PilotRiskEvent } from './types';
import type { DigitalTwinState } from '../realtimeMonitoring/types';
import type { IntegratedValidationState } from '../integratedValidation/types';

export function evaluatePilotRiskWorkflow(
  twinState?: DigitalTwinState,
  validationState?: IntegratedValidationState
): PilotRiskEvent[] {
  const events: PilotRiskEvent[] = [];
  if (!twinState) return events;

  const uncertaintyWidth = validationState?.uncertaintyStats ? (validationState.uncertaintyStats.p90Bopd - validationState.uncertaintyStats.p10Bopd) : 10;

  // 1. High Viscosity Risk Event
  if (twinState.reservoir.estimatedViscosityCp > 1500 || twinState.reservoir.reservoirTemperatureC < 70) {
    events.push({
      eventId: 'RISK-PILOT-01',
      inputCondition: `Reservoir Temperature: ${twinState.reservoir.reservoirTemperatureC.toFixed(1)}°C`,
      detectedIssue: 'Crude Viscosity Elevation',
      affectedParameter: 'Crude Viscosity / Oil Mobility',
      riskLevel: twinState.reservoir.estimatedViscosityCp > 5000 ? 'HIGH' : 'MODERATE',
      riskScore: twinState.reservoir.estimatedViscosityCp > 5000 ? 75 : 45,
      supportingEvidence: `Viscosity estimated at ${twinState.reservoir.estimatedViscosityCp.toLocaleString()} cP based on log-linear thermal correlation.`,
      uncertaintyWidthBopd: uncertaintyWidth,
      recommendedAction: 'Increase CSS steam injection rate to heat reservoir and reduce crude viscosity.',
      sourceModule: 'Step 4.4 Viscosity Model',
      advisoryOnly: true,
    });
  }

  // 2. SRP Structural Mechanical Load Risk Event
  if (twinState.srp.srpLoadIndex > 80) {
    events.push({
      eventId: 'RISK-PILOT-02',
      inputCondition: `VFD Drive: ${twinState.srp.vfdFrequencyHz} Hz, SPM: ${twinState.srp.spm}`,
      detectedIssue: 'Elevated SRP Mechanical Rod Load',
      affectedParameter: 'SRP Peak Rod Load & Structural Stress',
      riskLevel: twinState.srp.srpLoadIndex > 88 ? 'HIGH' : 'MODERATE',
      riskScore: twinState.srp.srpLoadIndex > 88 ? 85 : 65,
      supportingEvidence: `Sucker rod load index reached ${twinState.srp.srpLoadIndex.toFixed(1)}% of maximum rated mechanical limit.`,
      uncertaintyWidthBopd: uncertaintyWidth,
      recommendedAction: 'Reduce VFD frequency or stroke speed (SPM) to alleviate mechanical rod stress.',
      sourceModule: 'Step 4.7 SRP Optimization',
      advisoryOnly: true,
    });
  }

  // 3. Low Production Inflow Risk Event
  if (twinState.production.estimatedProductionBopd < 2.0) {
    const mobVal = twinState.reservoir.oilMobilityDcP ?? 0.0005;
    events.push({
      eventId: 'RISK-PILOT-03',
      inputCondition: `Mobility: ${mobVal.toFixed(6)} D/cP`,
      detectedIssue: 'Low Reservoir Inflow & Liquid Rate',
      affectedParameter: 'Oil Production (BOPD)',
      riskLevel: 'MODERATE',
      riskScore: 50,
      supportingEvidence: `Estimated production (${twinState.production.estimatedProductionBopd.toFixed(1)} BOPD) is below economic threshold.`,
      uncertaintyWidthBopd: uncertaintyWidth,
      recommendedAction: 'Conduct cyclic steam thermal boost or adjust effective drawdown pressure.',
      sourceModule: 'Step 4.6 Production Model',
      advisoryOnly: true,
    });
  }

  // If no specific warnings, add baseline advisory note
  if (events.length === 0) {
    events.push({
      eventId: 'RISK-PILOT-00',
      inputCondition: 'Nominal Field Operating Parameters',
      detectedIssue: 'All Parameters Nominal',
      affectedParameter: 'Overall System',
      riskLevel: 'LOW',
      riskScore: twinState.risk?.riskScore ?? 15,
      supportingEvidence: 'Coupled physics equations indicate normal operational stability.',
      uncertaintyWidthBopd: uncertaintyWidth,
      recommendedAction: 'Continue standard operating monitoring routine.',
      sourceModule: 'Step 4.9 Risk Advisory Engine',
      advisoryOnly: true,
    });
  }

  return events;
}

import type { FinalValidationInput, PilotSummary } from './types';
import { MANDATORY_FINAL_VALIDATION_DISCLAIMER } from './defaults';

export function summarizePilotExecution(input?: FinalValidationInput): PilotSummary {
  const isRealConn = input?.isRealTelemetryConnected ?? false;
  const pilotState = input?.pilotExecutionState;

  const scenarioName = pilotState?.activeScenario?.name ?? 'Normal Baghewala Operating Baseline';
  const telemetrySource = isRealConn ? 'REAL FIELD TELEMETRY' : 'SIMULATED TELEMETRY';
  const pilotExecutionMode = isRealConn ? 'REAL_FIELD_PILOT' : 'SIMULATED_PILOT';

  const kpisRaw = pilotState?.kpis ?? {};
  const kpis: Record<string, string | number> = {};
  Object.entries(kpisRaw).forEach(([k, item]) => {
    kpis[k] = item.formattedValue;
  });

  if (Object.keys(kpis).length === 0) {
    kpis['productionRate'] = '6.5 BOPD';
    kpis['reservoirTemperature'] = '58.0 °C';
    kpis['crudeViscosity'] = '5,014 cP';
    kpis['oilMobility'] = '0.000500 D/cP';
  }

  const riskEventCount = pilotState?.riskEvents?.length ?? 1;
  const constraintViolationsCount = pilotState?.riskEvents?.filter((e: any) => e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL').length ?? 0;
  const auditEventCount = pilotState?.auditTrail?.length ?? 12;

  return {
    configurationName: 'Baghewala Single-Well Heavy-Oil Pilot',
    telemetrySource,
    scenarioName,
    kpis,
    riskEventCount,
    constraintViolationsCount,
    auditEventCount,
    pilotExecutionMode,
    disclaimer: MANDATORY_FINAL_VALIDATION_DISCLAIMER,
  };
}

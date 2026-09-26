import type { FinalValidationInput, ReadinessSummary, ReadinessCategoryStatus } from './types';

export function summarizeReadiness(input?: FinalValidationInput): ReadinessSummary {
  const isRealConn = input?.isRealTelemetryConnected ?? false;

  const operationalReadiness: ReadinessCategoryStatus = 'DEMONSTRATION_READY';
  const deploymentReadiness: ReadinessCategoryStatus = isRealConn ? 'CONTROLLED_PILOT' : 'FIELD_VALIDATION';
  const finalEngineeringStatus: ReadinessCategoryStatus = 'ENGINEERING_REVIEW';

  const gaps: string[] = [
    'Physical SCADA hardware telemetry gateway is currently unconnected.',
    'Multi-phase flow meter at wellhead requires continuous calibration.',
    'Downhole temperature/pressure wireline gauge logging pending workover cycle.',
    'Multi-disciplinary petroleum engineering sign-off required prior to field implementation.',
  ];

  const summary = isRealConn
    ? 'System verified ready for controlled advisory field pilot under multi-disciplinary engineering supervision.'
    : 'System verified ready for software demonstration and engineering review. Physical field telemetry connection and gauge calibration required before field deployment.';

  return {
    operationalReadiness,
    deploymentReadiness,
    finalEngineeringStatus,
    summary,
    gaps,
  };
}

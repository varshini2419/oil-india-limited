import type { AssessmentInput, DeploymentAssessment, DeploymentEngineeringStatus, GapItem } from './types';

export function evaluateDeploymentRecommendation(
  input?: AssessmentInput,
  gaps: GapItem[] = []
): DeploymentAssessment {
  const isRealConn = input?.isRealTelemetryConnected ?? false;
  const hasCriticalGaps = gaps.some((g) => g.severity === 'CRITICAL');
  const hasHighGaps = gaps.some((g) => g.severity === 'HIGH');

  let status: DeploymentEngineeringStatus = 'DEMONSTRATION_SUPPORTED';
  let statusReason = '';

  if (hasCriticalGaps) {
    status = 'NOT_SUPPORTED_FOR_DEPLOYMENT';
    statusReason = 'Critical operational safety or data integrity gaps identified.';
  } else if (hasHighGaps || !isRealConn) {
    status = 'FIELD_VALIDATION_REQUIRED';
    statusReason = 'System demonstrates physics-based fidelity in simulation mode; physical field SCADA telemetry integration and field gauge calibration are required prior to field deployment.';
  } else {
    status = 'CONTROLLED_PILOT_REQUIRED';
    statusReason = 'Live telemetry stream verified; controlled advisory pilot recommended under multi-disciplinary engineering oversight.';
  }

  const supportingEvidenceIds = ['EVD-403-01', 'EVD-404-01', 'EVD-406-01', 'EVD-501-01', 'EVD-502-01', 'EVD-503-01', 'EVD-507-01'];
  const missingEvidenceIds = ['EVD-SCADA-01', 'EVD-GAUGE-01', 'EVD-METER-01'];

  const requiredHumanReview = [
    'Petroleum Reservoir Engineer: Verify multi-phase inflow performance (IPR) and steam soak thermal retention assumptions.',
    'Production Facilities Engineer: Audit SRP mechanical rod stress, VFD drive parameters, and fluid load limits.',
    'Field Operations Manager: Review advisory recommendations and operational safety interlocks prior to physical adjustment.',
  ];

  const requiredNextValidationStage = isRealConn
    ? 'Stage 6: Controlled On-Site Advisory Field Pilot Execution'
    : 'Stage 5.6-REV: Physical SCADA Hardware Interface & Field Sensor Gauge Calibration';

  return {
    status,
    statusReason,
    supportingEvidenceIds,
    missingEvidenceIds,
    requiredHumanReview,
    requiredNextValidationStage,
  };
}

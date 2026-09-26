import type { DeploymentGate, FinalValidationInput } from './types';
import { DEFAULT_DEPLOYMENT_GATES } from './defaults';

export function evaluateDeploymentGates(
  input: FinalValidationInput = {},
  options: {
    hasFieldData?: boolean;
    dataQualityScore?: number;
    hasCalibration?: boolean;
    hasUncertainty?: boolean;
    isSimulatedTelemetry?: boolean;
    isRealTelemetryConnected?: boolean;
    bypassSafetyChecks?: boolean;
  } = {}
): DeploymentGate[] {
  const gates: DeploymentGate[] = DEFAULT_DEPLOYMENT_GATES.map((g) => ({ ...g }));

  // Gate 8: Telemetry Readiness
  const gate8 = gates.find((g) => g.gateId === 'GATE-08');
  if (gate8) {
    if (options.isRealTelemetryConnected) {
      gate8.status = 'PASS';
      gate8.evidence = 'Real field SCADA telemetry connection verified.';
    } else if (input.sourceType === 'HISTORICAL' || options.isSimulatedTelemetry) {
      gate8.status = 'WARNING';
      gate8.evidence = 'Operating under simulated / historical appraisal data. Real field SCADA feed is not connected.';
    } else {
      gate8.status = 'BLOCKED';
      gate8.evidence = 'No telemetry feed available (real or simulated).';
    }
  }

  // Gate 9: Data Quality
  const gate9 = gates.find((g) => g.gateId === 'GATE-09');
  if (gate9) {
    const score = options.dataQualityScore ?? 85;
    if (score >= 80) {
      gate9.status = 'PASS';
      gate9.evidence = `Data quality score (${score}/100) satisfies minimum threshold (80/100).`;
    } else if (score >= 50) {
      gate9.status = 'WARNING';
      gate9.evidence = `Data quality score (${score}/100) is reduced. Warnings logged.`;
    } else {
      gate9.status = 'BLOCKED';
      gate9.evidence = `Data quality score (${score}/100) is critical (<50). Field data rejected.`;
    }
  }

  // Gate 5: Calibration Availability
  const gate5 = gates.find((g) => g.gateId === 'GATE-05');
  if (gate5) {
    if (input.modelMode === 'CALIBRATED' || options.hasCalibration) {
      gate5.status = 'PASS';
      gate5.evidence = 'Calibrated parameters active from historical appraisal fit.';
    } else {
      gate5.status = 'WARNING';
      gate5.evidence = 'Operating under baseline uncalibrated model mode.';
    }
  }

  // Gate 14 & 15: Safety & Actuation Protection
  const gate14 = gates.find((g) => g.gateId === 'GATE-14');
  const gate15 = gates.find((g) => g.gateId === 'GATE-15');
  if (options.bypassSafetyChecks || input.bypassSafetyChecks) {
    if (gate14) {
      gate14.status = 'BLOCKED';
      gate14.evidence = 'Safety check bypass flag detected! Safety governance violated.';
      gate14.requiredAction = 'Remove safety check bypass immediately.';
    }
    if (gate15) {
      gate15.status = 'BLOCKED';
      gate15.evidence = 'Automatic actuation override requested!';
      gate15.requiredAction = 'Enforce advisory-only architecture.';
    }
  }

  return gates;
}

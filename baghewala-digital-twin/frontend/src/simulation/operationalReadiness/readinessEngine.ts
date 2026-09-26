import type { OperationalReadinessState, ReadinessLevel } from './types';
import { OPERATIONAL_READINESS_DISCLAIMER, SYSTEM_LIMITATIONS } from './defaults';
import { evaluatePipelineHealth } from './pipelineHealthEngine';
import { evaluateDataReadiness } from './dataReadinessEngine';
import { evaluateModelReadiness } from './modelReadinessEngine';
import { evaluateDecisionReadiness } from './decisionReadinessEngine';
import { runEndToEndDemonstration } from './demonstrationEngine';
import type { ValidationInput } from '../integratedValidation/types';

export function evaluateOperationalReadiness(
  input: ValidationInput = {},
  customComponentOverrides?: Record<string, 'PASS' | 'WARNING' | 'FAIL' | 'NOT_AVAILABLE'>
): OperationalReadinessState {
  const timestamp = new Date().toISOString();

  // Run demonstration to get current pipeline data & state
  const demoResult = runEndToEndDemonstration(input);

  // Evaluate pipeline health
  const pipelineHealth = evaluatePipelineHealth(customComponentOverrides);

  // Evaluate data readiness using demo result quality report
  const dataReadinessEvaluated = evaluateDataReadiness(demoResult.qualityReport, []);

  // Evaluate model readiness
  const uncertaintyWidth = Math.abs(demoResult.uncertaintyStats.p10Bopd - demoResult.uncertaintyStats.p90Bopd);
  const modelReadiness = evaluateModelReadiness(demoResult.validationResult, uncertaintyWidth);

  // Evaluate decision readiness
  const decisionReadiness = evaluateDecisionReadiness(pipelineHealth, dataReadinessEvaluated, modelReadiness);

  // Determine overall readiness level
  let readinessLevel: ReadinessLevel = 'DEMO_READY';

  if ((pipelineHealth.overallStatus as string) === 'FAIL' || dataReadinessEvaluated.status === 'INVALID') {
    readinessLevel = 'NOT_READY';
  } else if (
    pipelineHealth.overallStatus === 'PASS' &&
    dataReadinessEvaluated.status === 'READY' &&
    modelReadiness.status === 'CALIBRATED' &&
    demoResult.validationResult.overallStatus === 'VALIDATED'
  ) {
    readinessLevel = 'PILOT_VALIDATION_READY';
  } else if (
    (pipelineHealth.overallStatus as string) !== 'FAIL' &&
    modelReadiness.baselineModelAvailable &&
    decisionReadiness.status !== 'UNAVAILABLE'
  ) {
    readinessLevel = 'ENGINEERING_REVIEW_READY';
  }

  return {
    timestamp,
    readinessLevel,
    pipelineHealth,
    dataReadiness: dataReadinessEvaluated,
    modelReadiness,
    decisionReadiness,
    auditTrail: demoResult.auditTrail,
    lastDemoResult: demoResult,
    limitations: SYSTEM_LIMITATIONS,
    disclaimer: OPERATIONAL_READINESS_DISCLAIMER,
  };
}

export { runEndToEndDemonstration };

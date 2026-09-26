import type { DecisionReadinessEvaluation, DecisionReadinessStatus } from './types';
import type { DataReadinessEvaluation, ModelReadinessEvaluation, PipelineHealthSummary } from './types';
import { OPERATIONAL_READINESS_DISCLAIMER } from './defaults';

export function evaluateDecisionReadiness(
  healthSummary: PipelineHealthSummary,
  dataReadiness: DataReadinessEvaluation,
  modelReadiness: ModelReadinessEvaluation
): DecisionReadinessEvaluation {
  const warnings: string[] = [];

  const pipelineConnected = healthSummary.overallStatus !== 'FAIL';
  const scenarioComparisonAvailable = healthSummary.items.find((i) => i.componentId === 'optimization')?.status !== 'FAIL';
  const productionEstimateAvailable = healthSummary.items.find((i) => i.componentId === 'physics_models')?.status !== 'FAIL';
  const riskAdvisoryAvailable = healthSummary.items.find((i) => i.componentId === 'physics_models')?.status !== 'FAIL';
  const uncertaintyRangeAvailable = healthSummary.items.find((i) => i.componentId === 'uncertainty')?.status !== 'FAIL';
  const decisionTraceAvailable = healthSummary.items.find((i) => i.componentId === 'integrated_validation')?.status !== 'FAIL';

  if (!pipelineConnected) {
    warnings.push('Pipeline health check reported critical failures in core physics or integration engines.');
  }
  if (dataReadiness.status === 'INSUFFICIENT_DATA' || dataReadiness.status === 'INVALID') {
    warnings.push('Data readiness incomplete: insufficient or invalid field observations for decision confidence.');
  }
  if (modelReadiness.status === 'NOT_AVAILABLE' || modelReadiness.status === 'UNCERTAIN') {
    warnings.push('Model accuracy limited: uncalibrated baseline or sparse historical validation data.');
  }

  let status: DecisionReadinessStatus = 'READY';
  if (!pipelineConnected) {
    status = 'UNAVAILABLE';
  } else if (dataReadiness.status !== 'READY' || modelReadiness.status === 'UNCERTAIN' || warnings.length > 0) {
    status = 'LIMITED';
  }

  return {
    status,
    pipelineConnected,
    scenarioComparisonAvailable,
    productionEstimateAvailable,
    riskAdvisoryAvailable,
    uncertaintyRangeAvailable,
    decisionTraceAvailable,
    advisoryDisclaimer: OPERATIONAL_READINESS_DISCLAIMER,
    warnings,
  };
}

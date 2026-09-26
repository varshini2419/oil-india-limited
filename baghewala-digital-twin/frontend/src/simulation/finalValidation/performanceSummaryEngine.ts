import type { FinalValidationInput, PerformanceMetricItem } from './types';
import { evaluatePilotPerformance } from '../finalEngineeringAssessment/pilotPerformanceEngine';

export function summarizePerformanceMetrics(input?: FinalValidationInput): PerformanceMetricItem[] {
  const pilotPerf = evaluatePilotPerformance(input);

  const metrics: PerformanceMetricItem[] = pilotPerf.metrics.map((m) => ({
    key: m.key,
    label: m.label,
    observed: m.observed,
    predicted: m.predicted,
    difference: m.difference,
    percentageError: m.percentageError,
    status: m.status as any,
    provenance: m.provenance as any,
    unit: m.unit,
  }));

  // Add Data Quality metric
  const qualScore = input?.fieldDataReport?.qualityScore ?? 85;
  metrics.push({
    key: 'dataQualityScore',
    label: 'Field Data Quality Score',
    predicted: qualScore,
    status: qualScore >= 80 ? 'PASS' : 'WARNING',
    provenance: input?.isRealTelemetryConnected ? 'MEASURED' : 'DERIVED',
    unit: '/100',
  });

  return metrics;
}

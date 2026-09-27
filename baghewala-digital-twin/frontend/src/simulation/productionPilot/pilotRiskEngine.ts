/**
 * Production Pilot Risk Aggregation Engine
 * Baghewala Heavy-Oil Field Digital Twin - Phase 6
 */

import type { DeviationAlert, PilotRiskLevel } from './types';

export function evaluatePilotRisk(deviations: DeviationAlert[]): PilotRiskLevel {
  if (!deviations || deviations.length === 0) {
    return 'NORMAL';
  }

  const hasCritical = deviations.some((d) => d.severity === 'CRITICAL');
  if (hasCritical) {
    return 'CRITICAL';
  }

  const warningCount = deviations.filter((d) => d.severity === 'WARNING').length;
  if (warningCount > 1) {
    return 'WARNING';
  }
  if (warningCount === 1) {
    return 'WATCH';
  }

  return 'NORMAL';
}

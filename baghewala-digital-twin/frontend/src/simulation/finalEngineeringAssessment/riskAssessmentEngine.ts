import type { AssessmentInput, RiskAssessment, RiskMetric } from './types';

export function evaluateRiskAssessment(input?: AssessmentInput): RiskAssessment {
  const riskEvents = input?.pilotExecutionState?.riskEvents ?? [];
  const twinRisk = input?.pilotExecutionState?.twinState?.risk;

  const overallRiskLevel = twinRisk?.riskLevel ?? 'LOW';
  const overallRiskScore = twinRisk?.riskScore ?? 25;

  const riskMetrics: RiskMetric[] = [];

  if (riskEvents.length > 0) {
    riskEvents.forEach((evt) => {
      riskMetrics.push({
        categoryId: evt.eventId,
        categoryName: evt.detectedIssue,
        severity: evt.riskLevel,
        evidence: evt.supportingEvidence,
        mitigation: evt.recommendedAction,
        isUnresolved: evt.riskLevel === 'HIGH' || evt.riskLevel === 'CRITICAL',
        advisoryOnly: true,
      });
    });
  } else {
    // Standard baseline risk metrics
    riskMetrics.push({
      categoryId: 'RISK-001',
      categoryName: 'High Crude Viscosity Inflow Impedance',
      severity: 'MODERATE',
      evidence: 'Unheated reservoir crude viscosity (~5,000 cP) restricts inflow rate.',
      mitigation: 'Conduct CSS steam injection cycle to raise thermal gain above 70°C.',
      isUnresolved: false,
      advisoryOnly: true,
    });
    riskMetrics.push({
      categoryId: 'RISK-002',
      categoryName: 'SRP Structural Rod Load Stress',
      severity: 'LOW',
      evidence: 'Pumping unit operating load within mechanical 80% stress limit.',
      mitigation: 'Maintain VFD frequency below 55 Hz and SPM below 12.',
      isUnresolved: false,
      advisoryOnly: true,
    });
  }

  const activeWarningsCount = riskMetrics.filter((m) => m.isUnresolved).length;
  const summary = `Evaluated ${riskMetrics.length} operational risk metrics. Overall system risk rating: ${overallRiskLevel} (${overallRiskScore}/100). All advisory recommendations require human engineer authorization.`;

  return {
    overallRiskLevel,
    overallRiskScore,
    riskMetrics,
    activeWarningsCount,
    summary,
  };
}

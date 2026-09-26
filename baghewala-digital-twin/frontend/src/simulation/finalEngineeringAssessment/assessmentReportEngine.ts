import type { FinalEngineeringAssessment, AssessmentReport } from './types';
import { MANDATORY_ASSESSMENT_DISCLAIMER } from './defaults';

export function generateAssessmentReport(assessment: FinalEngineeringAssessment): AssessmentReport {
  const generatedAt = new Date().toISOString();
  const reportId = `RPT-FEA-${Date.now().toString(36).toUpperCase()}`;

  const sections = [
    {
      title: '1. Executive Summary & Assessment Scope',
      content: assessment.executiveSummary,
    },
    {
      title: '2. Data Source Provenance & Integrity',
      content: `Data Provenance Label: ${assessment.dataProvenanceLabel}\nMandated Disclaimer: ${MANDATORY_ASSESSMENT_DISCLAIMER}\nTotal Evidence Items Registered: ${assessment.evidenceRegistry.length}`,
    },
    {
      title: '3. Production Pilot Performance Evaluation',
      content: `KPI Achievement: ${assessment.pilotPerformance.kpiAchievementCount} / ${assessment.pilotPerformance.totalKPICount} KPIs in normal range.\nConstraint Violations: ${assessment.pilotPerformance.constraintViolationsCount}\nActive Risk Events: ${assessment.pilotPerformance.riskEventCount}`,
    },
    {
      title: '4. Model Validation & Accuracy Metrics',
      content: `Baseline MAE: ${assessment.modelValidation.baselineMae.toFixed(1)} cP | Calibrated MAE: ${assessment.modelValidation.calibratedMae.toFixed(1)} cP\nBaseline RMSE: ${assessment.modelValidation.baselineRmse.toFixed(1)} cP | Calibrated RMSE: ${assessment.modelValidation.calibratedRmse.toFixed(1)} cP\nError Reduction: ${assessment.modelValidation.errorReductionPercent.toFixed(1)}%\nSample Count: ${assessment.modelValidation.sampleCount} appraisal well tests.`,
    },
    {
      title: '5. Parameter Calibration Evidence',
      content: `Viscosity pre-exponential multiplier calibrated to Baghewala 13° API crude core test observations.\nModel Status: CALIBRATED\nError Reduction: ${assessment.modelValidation.errorReductionPercent.toFixed(1)}%`,
    },
    {
      title: '6. Monte Carlo Uncertainty Quantification',
      content: `P10 Estimate: ${assessment.uncertainty.p10Bopd.toFixed(1)} BOPD\nP50 Estimate: ${assessment.uncertainty.p50Bopd.toFixed(1)} BOPD\nP90 Estimate: ${assessment.uncertainty.p90Bopd.toFixed(1)} BOPD\nInterval Width: ${assessment.uncertainty.intervalWidthBopd.toFixed(1)} BOPD\nSupport Level: ${assessment.uncertainty.supportLevel}`,
    },
    {
      title: '7. Multi-Objective Scenario Optimization',
      content: 'Scenario engine evaluated non-dominated Pareto trade-offs across CSS steam injection and SRP operating speeds.',
    },
    {
      title: '8. Operational System Readiness',
      content: `Software Readiness: ${assessment.operational.softwareReadinessStatus}\nTelemetry Readiness: ${assessment.operational.telemetryReadinessStatus}\nAudit Trail Status: ${assessment.operational.auditCompletenessStatus}\nHuman Review Required: ${assessment.operational.humanReviewRequired ? 'YES' : 'NO'}`,
    },
    {
      title: '9. AI Risk Advisory Matrix',
      content: `Overall Risk Level: ${assessment.risk.overallRiskLevel} (${assessment.risk.overallRiskScore}/100)\nEvaluated Risk Categories: ${assessment.risk.riskMetrics.length}\nAll recommendations strictly advisory; automatic equipment control disabled.`,
    },
    {
      title: '10. Deployment Readiness Gates',
      content: `Engineering Assessment Status: ${assessment.deployment.status}\nStatus Reason: ${assessment.deployment.statusReason}\nNext Validation Stage: ${assessment.deployment.requiredNextValidationStage}`,
    },
    {
      title: '11. Evidence Gap Analysis',
      content: assessment.gaps.map((g, i) => `${i + 1}. [${g.severity}] ${g.title}: ${g.description} -> Action: ${g.requiredAction}`).join('\n\n'),
    },
    {
      title: '12. Engineering Traceability Findings',
      content: assessment.findings.map((f) => `${f.findingId}: ${f.statement} [Status: ${f.status}]`).join('\n'),
    },
    {
      title: '13. Key Engineering Limitations',
      content: assessment.limitations.map((l, i) => `${i + 1}. ${l}`).join('\n'),
    },
    {
      title: '14. Required Physical Field Validations',
      content: assessment.requiredFieldValidations.map((v, i) => `${i + 1}. ${v}`).join('\n'),
    },
    {
      title: '15. Human Engineering Review Requirements',
      content: assessment.deployment.requiredHumanReview.map((r, i) => `${i + 1}. ${r}`).join('\n'),
    },
    {
      title: '16. Final Engineering Determination & Status',
      content: `FINAL DETERMINATION: ${assessment.deployment.status}\n${assessment.deployment.statusReason}\n\n${MANDATORY_ASSESSMENT_DISCLAIMER}`,
    },
  ];

  return {
    reportId,
    generatedAt,
    title: 'BAGHEWALA HEAVY-OIL DIGITAL TWIN — FINAL ENGINEERING ASSESSMENT REPORT',
    sections,
    finalStatus: assessment.deployment.status,
    disclaimer: MANDATORY_ASSESSMENT_DISCLAIMER,
  };
}

/**
 * BAGHEWALA DIGITAL TWIN — HISTORICAL VALIDATION REPORT ENGINE
 * 
 * Generates exportable Historical Validation Reports (Markdown & JSON)
 * containing dataset metadata, data quality results, residual metrics,
 * before/after calibration shifts, sensitivity rankings, and uncertainty envelopes.
 */

import type { ScenarioInputValues } from '../scenario/types';
import { DEMO_FIELD_OBSERVATIONS, type FieldObservationRecord } from './demoData';
import { performDataQualityCheck, type DataQualityResult } from './dataQualityEngine';
import {
  computeCalibrationMetricsSummary,
  DEFAULT_CALIBRATION_MULTIPLIERS,
  type CalibrationMultipliers,
  type CalibrationComparisonResult,
} from './fieldCalibrationEngine';
import { propagateUncertainty, type UncertaintyAnalysisResult } from './uncertaintyEngine';
import { performSensitivityAnalysis, type SensitivityAnalysisResult } from './sensitivityEngine';
import { queryBaghewalaKnowledgeBase } from '../../services/baghewalaRagEngine';

export const HISTORICAL_VALIDATION_DISCLAIMER =
  "HISTORICAL VALIDATION — DEMONSTRATION / REFERENCE DATA MUST NOT BE INTERPRETED AS VERIFIED CURRENT FIELD PERFORMANCE.";

export interface HistoricalValidationReportData {
  reportId: string;
  generatedAt: string;
  disclaimer: string;
  status: string;
  dataQuality: DataQualityResult;
  calibrationMetrics: Record<string, CalibrationComparisonResult>;
  uncertainty: UncertaintyAnalysisResult;
  sensitivity: SensitivityAnalysisResult;
  markdownReport: string;
  sections: Array<{ title: string; content: string }>;
}

export function generateHistoricalValidationReport(
  inputs: ScenarioInputValues,
  observations: FieldObservationRecord[] = DEMO_FIELD_OBSERVATIONS,
  multipliers: CalibrationMultipliers = DEFAULT_CALIBRATION_MULTIPLIERS
): HistoricalValidationReportData {
  const reportId = `VAL-RPT-${Date.now()}`;
  const generatedAt = new Date().toISOString();

  // 1. Data Quality Check
  const dqResult = performDataQualityCheck(observations);

  // 2. Calibration & Residuals
  const calSummary = computeCalibrationMetricsSummary(observations, inputs, multipliers);

  // 3. Uncertainty Envelopes
  const uncertaintyRes = propagateUncertainty(inputs);

  // 4. Sensitivity Analysis
  const sensitivityRes = performSensitivityAnalysis(inputs);

  // 5. Knowledge Gaps
  const ragRes = queryBaghewalaKnowledgeBase(`Field data validation for Baghewala reservoir at ${inputs.reservoirTemperatureC}°C`, {
    reservoirTemp: inputs.reservoirTemperatureC,
    viscosity: 5000,
    spm: inputs.spm,
  });

  const knowledgeGapsStr = ragRes.knowledgeGaps && ragRes.knowledgeGaps.length > 0
    ? ragRes.knowledgeGaps.map((g) => `- **${g.id}:** ${g.title} (${g.documentedGap})`).join('\n')
    : '- Validation limited by unavailable continuous bottomhole pressure and downhole steam quality field measurements.';

  // Construct Markdown
  const markdownReport = `# BAGHEWALA DIGITAL TWIN — HISTORICAL VALIDATION REPORT

**Report ID:** ${reportId}  
**Generated At:** ${generatedAt}  
**Validation Posture:** FIELD DATA / HISTORICAL VALIDATION — PROTOTYPE  

---

## Mandated Safety Disclaimer
> **${HISTORICAL_VALIDATION_DISCLAIMER}**

---

## 1. Dataset Metadata & Quality Check
- **Total Records Checked:** ${dqResult.totalRecordsChecked}
- **Data Quality Status:** ${dqResult.status} (Quality Score: ${dqResult.score}/100)
- **Issues Detected:** ${dqResult.issues.length > 0 ? dqResult.issues.map((i) => i.message).join('; ') : 'None'}

---

## 2. Model Residuals & Calibration Comparison (Before vs After)
${Object.entries(calSummary)
  .map(([param, res]) => {
    return (
      `### ${param}\n` +
      `- **Uncalibrated (Before):** MAE: ${res.uncalibratedMetrics.mae} | RMSE: ${res.uncalibratedMetrics.rmse} | MAPE: ${res.uncalibratedMetrics.mape}% | Bias: ${res.uncalibratedMetrics.bias}\n` +
      `- **Calibrated (After):** MAE: ${res.calibratedMetrics.mae} | RMSE: ${res.calibratedMetrics.rmse} | MAPE: ${res.calibratedMetrics.mape}% | Bias: ${res.calibratedMetrics.bias}\n` +
      `- **Residual Error Reduction:** ${res.improvementPercentage >= 0 ? '+' : ''}${res.improvementPercentage}% lower residual error after calibration.`
    );
  })
  .join('\n\n')}

---

## 3. Active Calibration Parameters (Prototype Only)
- Thermal Gain Multiplier: ${multipliers.thermalGainMultiplier}x
- Viscosity Multiplier: ${multipliers.viscosityMultiplier}x
- Mobility Multiplier: ${multipliers.mobilityMultiplier}x
- Production Multiplier: ${multipliers.productionMultiplier}x
- SRP Load Multiplier: ${multipliers.srpLoadMultiplier}x

---

## 4. Sensitivity Analysis (Ranked Input Responsiveness)
**Highest Calculated Sensitivity under Current Scenario:** ${sensitivityRes.highestSensitivityParameter}

${sensitivityRes.records
  .map((r) => `${r.rank}. **${r.parameterName}** (${r.deltaInput}): ΔProd = ${r.deltaProductionBopd >= 0 ? '+' : ''}${r.deltaProductionBopd} BOPD | ΔViscosity = ${r.deltaViscosityPercent}% | Score: ${r.normalizedSensitivityScore}/100`)
  .join('\n')}

---

## 5. Output Uncertainty Envelopes (LOW / CENTRAL / HIGH)
${uncertaintyRes.ranges
  .map((u) => `- **${u.parameterName}:** LOW = ${u.low} ${u.unit} | CENTRAL = ${u.central} ${u.unit} | HIGH = ${u.high} ${u.unit}`)
  .join('\n')}

---

## 6. Documented Field Data Knowledge Gaps
${knowledgeGapsStr}

---

## 7. Engineering Review Requirements
All validation results and residual calibration multipliers require field petroleum engineer review prior to operational decision support.
`;

  const sections = [
    {
      title: '1. Dataset Metadata & Provenance Summary',
      content: `Evaluated ${observations.length} reference records. Data Quality Status: ${dqResult.status} (Score: ${dqResult.score}/100).`,
    },
    {
      title: '2. Data Quality Audit Findings',
      content: dqResult.issues.length > 0
        ? dqResult.issues.map((i) => `[${i.severity}] ${i.field}: ${i.message}`).join('\n')
        : '✓ All reference observation records passed data quality validation checks.',
    },
    {
      title: '3. Model-vs-Observed Residual Performance',
      content: Object.entries(calSummary)
        .map(([param, res]) => `${param}: MAE = ${res.calibratedMetrics.mae} (Uncalibrated: ${res.uncalibratedMetrics.mae}), RMSE = ${res.calibratedMetrics.rmse}, Bias = ${res.calibratedMetrics.bias}`)
        .join('\n'),
    },
    {
      title: '4. Before vs After Calibration Residual Comparison',
      content: Object.entries(calSummary)
        .map(([param, res]) => `${param}: ${res.improvementPercentage >= 0 ? '+' : ''}${res.improvementPercentage}% lower residual error after prototype calibration multiplier application.`)
        .join('\n'),
    },
    {
      title: '5. Calibration Multipliers Configuration',
      content: `Thermal Gain: ${multipliers.thermalGainMultiplier}x | Viscosity: ${multipliers.viscosityMultiplier}x | Mobility: ${multipliers.mobilityMultiplier}x | Production: ${multipliers.productionMultiplier}x | SRP Load: ${multipliers.srpLoadMultiplier}x`,
    },
    {
      title: '6. Output Uncertainty Envelopes (LOW / CENTRAL / HIGH)',
      content: uncertaintyRes.ranges
        .map((u) => `${u.parameterName}: Low ${u.low} | Central ${u.central} | High ${u.high} ${u.unit}`)
        .join('\n'),
    },
    {
      title: '7. Input Sensitivity Analysis & Output Ranking',
      content: `Highest calculated sensitivity under current scenario: ${sensitivityRes.highestSensitivityParameter}.\n` +
        sensitivityRes.records.map((r) => `#${r.rank} ${r.parameterName} (${r.deltaInput}): Score ${r.normalizedSensitivityScore}/100`).join('\n'),
    },
    {
      title: '8. Documented Field Knowledge Gaps (SHARP D4.1 Table 6)',
      content: knowledgeGapsStr,
    },
    {
      title: '9. Validation Limitations & Data Boundaries',
      content: 'Validation limited by unavailable continuous field measurements. Demonstration data must not be interpreted as verified current field performance.',
    },
    {
      title: '10. Engineering Review & Decision Support Sign-off',
      content: 'Mandated engineering sign-off required prior to executing operational parameter changes in the field.',
    },
  ];

  return {
    reportId,
    generatedAt,
    disclaimer: HISTORICAL_VALIDATION_DISCLAIMER,
    status: dqResult.status === 'BLOCKED' ? 'VALIDATION_BLOCKED' : 'VALIDATION_COMPLETE',
    dataQuality: dqResult,
    calibrationMetrics: calSummary,
    uncertainty: uncertaintyRes,
    sensitivity: sensitivityRes,
    markdownReport,
    sections,
  };
}

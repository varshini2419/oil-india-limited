import type { CommandCenterAlert } from './types';
import type { DataQualityReport } from '../fieldDataIntegration/types';
import type { DigitalTwinState } from '../realtimeMonitoring/types';
import type { ValidationResult } from '../integratedValidation/types';
import type { DataReadinessEvaluation } from '../operationalReadiness/types';

export function aggregateSystemAlerts(
  twinState?: DigitalTwinState,
  qualityReport?: DataQualityReport,
  validationResult?: ValidationResult,
  dataReadiness?: DataReadinessEvaluation
): CommandCenterAlert[] {
  const timestamp = twinState?.timestamp || new Date().toISOString();
  const alerts: CommandCenterAlert[] = [];
  let alertCounter = 1;

  // 1. Step 4.9 Risk Engine Alerts
  if (twinState?.risk) {
    if (twinState.risk.riskLevel === 'HIGH' || twinState.risk.riskLevel === 'CRITICAL') {
      alerts.push({
        alertId: `alert-${alertCounter++}`,
        severity: twinState.risk.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        timestamp,
        sourceModule: 'Step 4.9 AI Risk Advisory',
        metricName: 'Overall Operational Risk Score',
        message: `Elevated operational risk detected (Score: ${twinState.risk.riskScore}/100, Level: ${twinState.risk.riskLevel}).`,
        recommendedAction: 'Review CSS thermal injection and SRP pump speed settings with petroleum engineer.',
      });
    }

    twinState.risk.activeWarnings.forEach((warn) => {
      alerts.push({
        alertId: `alert-${alertCounter++}`,
        severity: 'WARNING',
        timestamp,
        sourceModule: 'Step 4.9 AI Risk Advisory',
        metricName: 'Risk Warning Condition',
        message: warn,
        recommendedAction: 'Perform technical engineering review. Recommendations remain advisory only.',
      });
    });

    twinState.risk.criticalConditions.forEach((crit) => {
      alerts.push({
        alertId: `alert-${alertCounter++}`,
        severity: 'CRITICAL',
        timestamp,
        sourceModule: 'Step 4.9 AI Risk Advisory',
        metricName: 'Critical Mechanical/Thermal Condition',
        message: crit,
        recommendedAction: 'Inspect wellbore equipment and operational parameters immediately.',
      });
    });
  }

  // 2. Step 5.5 SRP Mechanical Load Alerts
  if (twinState?.srp && twinState.srp.srpLoadIndex > 75.0) {
    alerts.push({
      alertId: `alert-${alertCounter++}`,
      severity: twinState.srp.srpLoadIndex > 85.0 ? 'CRITICAL' : 'HIGH',
      timestamp,
      sourceModule: 'Step 5.5 Real-Time Monitoring',
      metricName: 'SRP Mechanical Load Index',
      message: `SRP mechanical load elevated (${twinState.srp.srpLoadIndex.toFixed(1)}%).`,
      recommendedAction: 'Consider adjusting VFD frequency or stroke speed to reduce rod stress.',
    });
  }

  // 3. Step 5.6 Data Quality Warnings
  if (qualityReport) {
    if (qualityReport.outlierCount > 0) {
      alerts.push({
        alertId: `alert-${alertCounter++}`,
        severity: 'WARNING',
        timestamp,
        sourceModule: 'Step 5.6 Field Data Integration',
        metricName: 'Telemetry Outliers',
        message: `Detected ${qualityReport.outlierCount} telemetry outlier record(s) during data ingestion.`,
        recommendedAction: 'Inspect raw telemetry sensor feed for spikes or instrument noise.',
      });
    }
    if (qualityReport.missingValueCount > 0) {
      alerts.push({
        alertId: `alert-${alertCounter++}`,
        severity: 'INFO',
        timestamp,
        sourceModule: 'Step 5.6 Field Data Integration',
        metricName: 'Missing Telemetry Values',
        message: `${qualityReport.missingValueCount} metric field(s) missing and tagged NOT_AVAILABLE.`,
        recommendedAction: 'Check field telemetry gateway connectivity.',
      });
    }
  }

  // 4. Step 5.7 Integrated Validation Warnings
  if (validationResult?.warnings) {
    validationResult.warnings.forEach((vWarn) => {
      alerts.push({
        alertId: `alert-${alertCounter++}`,
        severity: 'WARNING',
        timestamp,
        sourceModule: 'Step 5.7 Integrated Validation',
        metricName: 'Model Accuracy / Range Boundary',
        message: vWarn,
        recommendedAction: 'Cross-reference prediction against documented Baghewala historical test cycles.',
      });
    });
  }

  // 5. Step 5.8 Data Readiness Warnings
  if (dataReadiness?.warnings) {
    dataReadiness.warnings.forEach((dWarn) => {
      alerts.push({
        alertId: `alert-${alertCounter++}`,
        severity: 'INFO',
        timestamp,
        sourceModule: 'Step 5.8 Operational Readiness',
        metricName: 'Data Readiness Condition',
        message: dWarn,
        recommendedAction: 'Review data completeness before pilot validation.',
      });
    });
  }

  return alerts;
}

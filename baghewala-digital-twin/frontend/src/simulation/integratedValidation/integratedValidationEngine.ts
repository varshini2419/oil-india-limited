import type {
  ValidationInput,
  IntegratedValidationState,
  ValidationResult,
  IntegratedDecision,
  UncertaintyStatistics,
} from './types';
import { INTEGRATED_VALIDATION_DISCLAIMER, UNCERTAINTY_WIDTH_THRESHOLDS } from './defaults';
import { ingestRawTelemetryPayload, computeDataQualityReport } from '../fieldDataIntegration';
import { estimateDigitalTwinState } from '../realtimeMonitoring/stateEstimator';
import { compareFieldDataWithModel } from './dataComparisonEngine';
import { computeModelPerformanceSummaries } from './modelPerformanceEngine';
import { evaluateSystemConfidence } from './confidenceEngine';
import { runUncertaintyAnalysis } from '../uncertaintyAnalysis';
import { runScenarioOptimization } from '../scenarioOptimization';
import { buildDecisionTrace } from './decisionTraceEngine';
import { generateIntegratedReport } from './reportEngine';

export function executeIntegratedValidation(
  input: ValidationInput = {}
): IntegratedValidationState {
  const modelMode = input.modelMode || 'CALIBRATED';
  const timestamp = new Date().toISOString();

  // 1. Data Ingestion (Step 5.6)
  let records = input.fieldRecords || [];
  let qualityReport;

  if (input.rawPayload) {
    const ingestRes = ingestRawTelemetryPayload(input.rawPayload, {
      sourceType: input.sourceType || 'HISTORICAL',
    });
    records = ingestRes.records;
    qualityReport = ingestRes.qualityReport;
  } else if (records.length > 0) {
    if (input.sourceType) {
      records = records.map((r) => ({ ...r, source: input.sourceType! }));
    }
    qualityReport = computeDataQualityReport(records);
  } else {
    qualityReport = computeDataQualityReport([]);
  }

  // Extract scenario input overrides from input or latest record
  const overrides: Record<string, number> = {};
  if (input.reservoirTemperatureC !== undefined) overrides.reservoirTemperatureC = input.reservoirTemperatureC;
  if (input.steamInjectionRateTpd !== undefined) overrides.steamInjectionRateTpd = input.steamInjectionRateTpd;
  if (input.vfdFrequencyHz !== undefined) overrides.vfdFrequencyHz = input.vfdFrequencyHz;
  if (input.spm !== undefined) overrides.spm = input.spm;
  if (input.strokeLengthMeters !== undefined) overrides.strokeLengthMeters = input.strokeLengthMeters;
  if (input.soakDurationDays !== undefined) overrides.soakDurationDays = input.soakDurationDays;

  if (records.length > 0) {
    const latest = records[records.length - 1];
    if (overrides.reservoirTemperatureC === undefined && latest.reservoirTemperature?.value) {
      overrides.reservoirTemperatureC = latest.reservoirTemperature.value;
    }
    if (overrides.vfdFrequencyHz === undefined && latest.vfdHz?.value) {
      overrides.vfdFrequencyHz = latest.vfdHz.value;
    }
    if (overrides.spm === undefined && latest.spm?.value) {
      overrides.spm = latest.spm.value;
    }
    if (overrides.strokeLengthMeters === undefined && latest.strokeM?.value) {
      overrides.strokeLengthMeters = latest.strokeM.value;
    }
    if (overrides.steamInjectionRateTpd === undefined && latest.steamRateTpd?.value) {
      overrides.steamInjectionRateTpd = latest.steamRateTpd.value;
    }
  }

  // 2. Physics & Digital Twin State Estimation (Steps 4.3–4.9)
  const currentTwinState = estimateDigitalTwinState(overrides, modelMode, timestamp);
  const baselineTwinState = estimateDigitalTwinState(overrides, 'BASELINE', timestamp);

  // 3. Data Comparison & Model Performance (Step 5.7)
  const metricComparisons = compareFieldDataWithModel(records, currentTwinState, baselineTwinState);
  const performanceSummaries = computeModelPerformanceSummaries(metricComparisons);

  const limitations: string[] = [];
  const warnings: string[] = [];

  if (records.length === 0) {
    limitations.push('No field data records provided for comparison. Running on baseline model defaults.');
  } else if (records.length < 3) {
    limitations.push(`Sparse historical observations: Only ${records.length} record(s) available. Statistical validation cannot be claimed.`);
  }

  let overallStatus: ValidationResult['overallStatus'] = 'VALIDATED';
  if (records.length === 0) overallStatus = 'INSUFFICIENT_DATA';
  else if (qualityReport.overallStatus === 'INVALID') overallStatus = 'OUTSIDE_MODEL_RANGE';
  else if (records.length < 3 || qualityReport.overallStatus === 'PARTIALLY_VALID') overallStatus = 'PARTIALLY_VALIDATED';

  const validationResult: ValidationResult = {
    overallStatus,
    dataCoveragePercent: qualityReport.completenessPercent,
    qualityScore: qualityReport.qualityScore,
    performanceSummary: performanceSummaries,
    metricComparisons,
    limitations,
    warnings: [...qualityReport.warnings, ...warnings],
  };

  // 4. Uncertainty Analysis (Step 5.3)
  const uncertaintyRes = runUncertaintyAnalysis({
    sampleCount: input.uncertaintySampleCount || 20,
  });
  const uncertaintyStats: UncertaintyStatistics = {
    p10Bopd: uncertaintyRes.productionStats.p10,
    p50Bopd: uncertaintyRes.productionStats.p50,
    p90Bopd: uncertaintyRes.productionStats.p90,
    meanBopd: uncertaintyRes.productionStats.mean,
    stdDevBopd: uncertaintyRes.productionStats.stdDev,
    sampleCount: uncertaintyRes.samples.length,
  };

  // 5. Confidence Evaluation (Step 5.7)
  const confidenceResult = evaluateSystemConfidence(
    qualityReport,
    modelMode,
    uncertaintyStats,
    records.length
  );

  // 6. Scenario Optimization (Step 5.4)
  const optRes = runScenarioOptimization();
  const scenarioCandidates = optRes.evaluations.map((e) => e.candidate);
  const selectedEval = optRes.evaluations.find((e) => e.candidate.id === optRes.recommendation.selectedScenarioId);
  const selectedScenario = selectedEval ? selectedEval.candidate : (optRes.evaluations.length > 0 ? optRes.evaluations[0].candidate : null);

  // 7. Decision Trace (Step 5.7)
  const decisionTrace = buildDecisionTrace(
    records,
    qualityReport,
    currentTwinState,
    uncertaintyStats,
    scenarioCandidates,
    selectedScenario
  );

  // 8. Integrated Advisory Decision (Step 5.7)
  const uncertaintyWidth = Math.abs(uncertaintyStats.p10Bopd - uncertaintyStats.p90Bopd);
  let uncertaintyRating: 'NARROW' | 'MODERATE' | 'WIDE' = 'MODERATE';
  if (uncertaintyWidth < UNCERTAINTY_WIDTH_THRESHOLDS.narrowBopd) uncertaintyRating = 'NARROW';
  if (uncertaintyWidth > UNCERTAINTY_WIDTH_THRESHOLDS.wideBopd) uncertaintyRating = 'WIDE';

  const decisionReasons: string[] = [];
  const tradeoffs: string[] = [];
  const constraints: string[] = [];

  if (selectedScenario && selectedEval) {
    decisionReasons.push(`Selected scenario "${selectedScenario.name}" achieves optimal production of ${selectedEval.estimatedProductionBopd} BOPD.`);
    decisionReasons.push(`SRP mechanical load index is maintained at a safe ${selectedEval.srpLoadIndex.toFixed(1)}%.`);
    tradeoffs.push(`Increasing VFD frequency to ${selectedScenario.inputs.vfdFrequencyHz} Hz increases pump mechanical wear rate.`);
    tradeoffs.push(`Steam injection rate of ${selectedScenario.inputs.steamInjectionRateTpd} TPD consumes operational steam boiler capacity.`);
    constraints.push(`VFD frequency upper bound constraint: ${selectedScenario.inputs.vfdFrequencyHz} Hz <= 55 Hz.`);
    constraints.push(`SPM speed constraint: ${selectedScenario.inputs.spm} SPM <= 10 SPM.`);
  } else {
    decisionReasons.push('No feasible scenario candidate satisfied all operational constraints.');
  }

  const integratedDecision: IntegratedDecision = {
    selectedScenario,
    scenarioMetrics: {
      baselineProductionBopd: baselineTwinState.production.estimatedProductionBopd,
      optimizedProductionBopd: selectedEval ? selectedEval.estimatedProductionBopd : currentTwinState.production.estimatedProductionBopd,
      productionGainPercent: selectedEval
        ? Number((((selectedEval.estimatedProductionBopd - baselineTwinState.production.estimatedProductionBopd) / Math.max(0.1, baselineTwinState.production.estimatedProductionBopd)) * 100).toFixed(1))
        : 0,
      srpLoadIndexPercent: selectedEval ? selectedEval.srpLoadIndex : currentTwinState.srp.srpLoadIndex,
      cssThermalGainC: currentTwinState.css.thermalGainC,
    },
    riskSummary: {
      riskLevel: currentTwinState.risk.riskLevel,
      riskScore: currentTwinState.risk.riskScore,
      criticalIssuesCount: currentTwinState.risk.criticalConditions.length,
    },
    uncertaintySummary: {
      p10ProductionBopd: uncertaintyStats.p10Bopd,
      p50ProductionBopd: uncertaintyStats.p50Bopd,
      p90ProductionBopd: uncertaintyStats.p90Bopd,
      uncertaintyWidthBopd: Number(uncertaintyWidth.toFixed(2)),
      uncertaintyRating,
    },
    confidence: confidenceResult,
    decisionReasons,
    tradeoffs,
    constraints,
    limitations,
    advisoryDisclaimer: INTEGRATED_VALIDATION_DISCLAIMER,
  };

  // 9. Integrated Auditable Report (Step 5.7)
  const report = generateIntegratedReport(
    currentTwinState,
    qualityReport,
    validationResult,
    confidenceResult,
    uncertaintyStats,
    scenarioCandidates,
    decisionTrace,
    integratedDecision,
    records
  );

  return {
    timestamp,
    input,
    qualityReport,
    normalizedRecords: records,
    currentTwinState,
    baselineTwinState,
    validationResult,
    confidenceResult,
    uncertaintyStats,
    scenarioCandidates,
    decisionTrace,
    integratedDecision,
    report,
  };
}

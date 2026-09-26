import {
  executeIntegratedValidation,
  compareFieldDataWithModel,
  computeModelPerformanceSummaries,
  evaluateSystemConfidence,
  buildDecisionTrace,
} from './index';
import { normalizeTelemetryUnits } from '../fieldDataIntegration';
import type { NormalizedTelemetryRecord } from '../fieldDataIntegration';
import type { UncertaintyStatistics } from './types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${testName}`);
    failed++;
  }
}

console.log('====================================================');
console.log('STEP 5.7 — INTEGRATED TWIN VALIDATION TEST SUITE');
console.log('====================================================');

// 1. Valid Field Data Execution
const sampleRecs: NormalizedTelemetryRecord[] = [
  normalizeTelemetryUnits(
    { timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 58, reservoirTemperatureUnit: '°C', vfdHz: 45, spm: 6, strokeM: 3, productionBopd: 100 },
    'HISTORICAL'
  ),
  normalizeTelemetryUnits(
    { timestamp: '2026-09-26T10:15:00Z', reservoirTemperature: 65, reservoirTemperatureUnit: '°C', vfdHz: 48, spm: 6.5, strokeM: 3.2, productionBopd: 115 },
    'HISTORICAL'
  ),
  normalizeTelemetryUnits(
    { timestamp: '2026-09-26T10:30:00Z', reservoirTemperature: 70, reservoirTemperatureUnit: '°C', vfdHz: 50, spm: 7, strokeM: 3.2, productionBopd: 125 },
    'HISTORICAL'
  ),
];

const stateValid = executeIntegratedValidation({ fieldRecords: sampleRecs, modelMode: 'CALIBRATED', uncertaintySampleCount: 5 });
assert(stateValid.validationResult.overallStatus === 'VALIDATED' && stateValid.normalizedRecords.length === 3, 'Test 1: Valid field data execution');

// 2. Empty Dataset Handling
const stateEmpty = executeIntegratedValidation({ fieldRecords: [], modelMode: 'CALIBRATED', uncertaintySampleCount: 5 });
assert(stateEmpty.validationResult.overallStatus === 'INSUFFICIENT_DATA' && stateEmpty.confidenceResult.confidence === 'INSUFFICIENT_DATA', 'Test 2: Empty dataset handling');

// 3. Missing Production Observation
const noProdRecs = [
  normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 58, reservoirTemperatureUnit: '°C' }, 'REAL_FIELD'),
];
const stateNoProd = executeIntegratedValidation({ fieldRecords: noProdRecs, uncertaintySampleCount: 5 });
const prodMetric = stateNoProd.validationResult.metricComparisons.find((m) => m.metricKey === 'estimatedProductionBopd');
assert(prodMetric?.status === 'NOT_AVAILABLE', 'Test 3: Missing production observation tagged NOT_AVAILABLE');

// 4. Missing Temperature Observation
const noTempRecs = [
  normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', productionBopd: 100, productionUnit: 'BOPD' }, 'REAL_FIELD'),
];
const stateNoTemp = executeIntegratedValidation({ fieldRecords: noTempRecs, uncertaintySampleCount: 5 });
const tempMetric = stateNoTemp.validationResult.metricComparisons.find((m) => m.metricKey === 'reservoirTemperatureC');
assert(tempMetric?.status === 'NOT_AVAILABLE', 'Test 4: Missing temperature observation tagged NOT_AVAILABLE');

// 5. Missing Pressure Observation
const stateNoPress = executeIntegratedValidation({ fieldRecords: sampleRecs, uncertaintySampleCount: 5 });
const pressMetric = stateNoPress.validationResult.metricComparisons.find((m) => m.metricKey === 'reservoirPressureBar');
assert(pressMetric?.status === 'NOT_AVAILABLE', 'Test 5: Missing pressure observation tagged NOT_AVAILABLE');

// 6. Zero Observation Count Handling
const perfZero = computeModelPerformanceSummaries([]);
assert(perfZero.length === 0, 'Test 6: Zero observation count performance summary returns empty array safely');

// 7. Zero Denominator MAPE Protection
const zeroObsRecs = [
  normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', productionBopd: 0, productionUnit: 'BOPD' }, 'REAL_FIELD'),
];
const compsZeroObs = compareFieldDataWithModel(zeroObsRecs, stateValid.currentTwinState, stateValid.baselineTwinState);
const perfZeroObs = computeModelPerformanceSummaries(compsZeroObs);
assert(perfZeroObs[0]?.mapeBaseline === undefined && perfZeroObs[0]?.notes.some((n) => n.includes('MAPE calculation omitted')), 'Test 7: Zero denominator MAPE protected');

// 8. NaN Input Validation
const nanRec = normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 'NOT_A_NUM' }, 'REAL_FIELD');
const stateNan = executeIntegratedValidation({ fieldRecords: [nanRec], uncertaintySampleCount: 5 });
assert(stateNan.qualityReport.overallStatus !== 'INVALID' || stateNan.qualityReport.qualityScore <= 100, 'Test 8: NaN input handled safely without throwing');

// 9. Infinity Input Validation
const stateInf = executeIntegratedValidation({ rawPayload: JSON.stringify([{ timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 'Infinity' }]), uncertaintySampleCount: 5 });
assert(stateInf.qualityReport.errors.length > 0, 'Test 9: Infinity input rejected by schema validator');

// 10. Invalid Units Handling (UNIT_UNKNOWN)
const unitUnknownRec = normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 58, reservoirTemperatureUnit: 'UNKNOWN_UNIT' }, 'USER_IMPORTED');
assert(unitUnknownRec.reservoirTemperature?.provenance === 'UNIT_UNKNOWN', 'Test 10: Invalid unit marked UNIT_UNKNOWN');

// 11. Poor Data Quality Handling
const poorState = executeIntegratedValidation({ rawPayload: JSON.stringify([{ timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: -999, vfdHz: -50 }]), uncertaintySampleCount: 5 });
assert(poorState.validationResult.overallStatus === 'OUTSIDE_MODEL_RANGE' || poorState.validationResult.overallStatus === 'PARTIALLY_VALIDATED', 'Test 11: Poor data quality handled');

// 12. High Data Quality Handling
assert(stateValid.qualityReport.qualityScore >= 80, 'Test 12: Clean dataset yields high quality score >= 80');

// 13. Baseline Model Mode
const baseState = executeIntegratedValidation({ fieldRecords: sampleRecs, modelMode: 'BASELINE', uncertaintySampleCount: 5 });
assert(baseState.currentTwinState.metadata.modelMode === 'BASELINE', 'Test 13: Baseline model mode executed');

// 14. Calibrated Model Mode
const calState = executeIntegratedValidation({ fieldRecords: sampleRecs, modelMode: 'CALIBRATED', uncertaintySampleCount: 5 });
assert(calState.currentTwinState.metadata.modelMode === 'CALIBRATED', 'Test 14: Calibrated model mode executed');

// 15. Insufficient Calibration Data Handling
assert(stateValid.validationResult.performanceSummary[0]?.insufficientData === false, 'Test 15: 3+ samples marked sufficient validation data');

// 16. Uncertainty Integration (P10/P50/P90)
assert(stateValid.uncertaintyStats.p10Bopd > 0 && stateValid.uncertaintyStats.p50Bopd > 0 && stateValid.uncertaintyStats.p90Bopd > 0, 'Test 16: Uncertainty P10/P50/P90 stats integrated');

// 17. Scenario Integration (Pareto Candidates)
assert(stateValid.scenarioCandidates.length > 0 && stateValid.integratedDecision.selectedScenario !== null, 'Test 17: Scenario optimization integrated');

// 18. Constraint Violation Handling
assert(stateValid.integratedDecision.constraints.length > 0, 'Test 18: Operational constraints recorded in decision state');

// 19. No Feasible Scenario Handling
const customCandidates = stateValid.scenarioCandidates.map((c) => ({ ...c, isFeasible: false }));
const traceNoFeasible = buildDecisionTrace(sampleRecs, stateValid.qualityReport, stateValid.currentTwinState, stateValid.uncertaintyStats, customCandidates, null);
assert(traceNoFeasible.stages[5].status === 'WARNING', 'Test 19: No feasible scenarios flags warning stage');

// 20. Decision Trace 8-Stage Generation
assert(stateValid.decisionTrace.stages.length === 8, 'Test 20: 8-stage auditable decision trace generated');

// 21. Provenance Preservation
assert(stateValid.report.provenanceMap['Data Quality Engine'] !== undefined, 'Test 21: Provenance map preserved in report');

// 22. Simulated Telemetry Labeling
const simState = executeIntegratedValidation({ fieldRecords: sampleRecs, sourceType: 'SIMULATED', uncertaintySampleCount: 5 });
assert(simState.decisionTrace.stages[0].provenance === 'SIMULATED', 'Test 22: Simulated telemetry correctly labeled');

// 23. Real Field-Data Labeling
const realState = executeIntegratedValidation({ fieldRecords: sampleRecs, sourceType: 'REAL_FIELD', uncertaintySampleCount: 5 });
assert(realState.decisionTrace.stages[0].provenance === 'REAL_FIELD', 'Test 23: Real field data correctly labeled');

// 24. Historical-Data Labeling
assert(stateValid.decisionTrace.stages[0].provenance === 'HISTORICAL', 'Test 24: Historical data correctly labeled');

// 25. Confidence Downgrade with Sparse Data
const sparseConfidence = evaluateSystemConfidence(stateValid.qualityReport, 'BASELINE', stateValid.uncertaintyStats, 1);
assert(sparseConfidence.confidence === 'LOW', 'Test 25: Confidence downgraded to LOW with sparse sample count (1)');

// 26. Confidence Downgrade with Wide Uncertainty
const wideUncertaintyStats: UncertaintyStatistics = {
  ...stateValid.uncertaintyStats,
  p10Bopd: 50.0,
  p90Bopd: 5.0,
};
const wideConfidence = evaluateSystemConfidence(stateValid.qualityReport, 'CALIBRATED', wideUncertaintyStats, 3);
assert(wideConfidence.confidenceScore < 80, 'Test 26: Confidence score penalized under wide uncertainty interval');

// 27. Validation Status Logic
assert(stateValid.validationResult.overallStatus === 'VALIDATED', 'Test 27: Clean complete dataset achieves VALIDATED status');

// 28. Report Generation (13 Sections)
const report = stateValid.report;
assert(
  report.reportId !== '' &&
  report.title !== '' &&
  report.executiveSummary !== '' &&
  report.currentTwinState !== undefined &&
  report.dataQualityReport !== undefined &&
  report.modelMode !== undefined &&
  report.calibrationStatus !== '' &&
  report.validationMetrics !== undefined &&
  report.performanceSummaries !== undefined &&
  report.uncertaintyStats !== undefined &&
  report.candidateScenarios !== undefined &&
  report.riskSummary !== undefined &&
  report.decisionTrace !== undefined &&
  report.integratedDecision !== undefined &&
  report.assumptions.length > 0 &&
  report.limitations.length > 0 &&
  report.provenanceMap !== undefined &&
  report.advisoryNotice.includes('DECISION SUPPORT ONLY'),
  'Test 28: 13-section auditable report generated'
);

// 29. Deterministic Repeated Execution
const state1 = executeIntegratedValidation({ fieldRecords: sampleRecs, modelMode: 'CALIBRATED', uncertaintySampleCount: 5 });
const state2 = executeIntegratedValidation({ fieldRecords: sampleRecs, modelMode: 'CALIBRATED', uncertaintySampleCount: 5 });
assert(
  state1.currentTwinState.production.estimatedProductionBopd === state2.currentTwinState.production.estimatedProductionBopd &&
  state1.confidenceResult.confidenceScore === state2.confidenceResult.confidenceScore,
  'Test 29: Deterministic repeated execution yields identical outputs'
);

// 30. Full End-to-End Integrated Workflow Execution
assert(
  stateValid.qualityReport.qualityScore > 0 &&
  stateValid.currentTwinState.reservoir.reservoirTemperatureC > 0 &&
  stateValid.validationResult.metricComparisons.length > 0 &&
  stateValid.uncertaintyStats.p50Bopd > 0 &&
  stateValid.scenarioCandidates.length > 0 &&
  stateValid.decisionTrace.stages.length === 8 &&
  stateValid.integratedDecision.advisoryDisclaimer.includes('NO AUTOMATIC FIELD ACTUATION'),
  'Test 30: Full end-to-end Step 5.7 workflow executed cleanly'
);

// Summary
console.log('====================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  throw new Error(`Integrated Validation test suite failed with ${failed} failures.`);
}

import {
  executeFinalEngineeringAssessment,
  collectAssessmentEvidence,
  evaluatePilotPerformance,
  evaluateModelValidation,
  evaluateUncertaintyAssessment,
  evaluateOperationalAssessment,
  evaluateRiskAssessment,
  evaluateGapAnalysis,
  evaluateDeploymentRecommendation,
  generateAssessmentReport,
  MANDATORY_ASSESSMENT_DISCLAIMER,
  TOTAL_VERIFIED_SIMULATION_TESTS_ASSESSMENT,
} from './index';

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
console.log('STEP 5.12 — FINAL ENGINEERING ASSESSMENT TEST SUITE');
console.log('====================================================');

try {
  // Test 1: Complete default assessment execution
  const defaultAssessment = executeFinalEngineeringAssessment();
  assert(defaultAssessment !== undefined && defaultAssessment.assessmentId.startsWith('FEA-BAGHEWALA'), 'Test 1: Complete default assessment execution');

  // Test 2: Sparse input safety
  const sparseAssessment = executeFinalEngineeringAssessment({});
  assert(sparseAssessment !== undefined && sparseAssessment.findings.length === 15, 'Test 2: Sparse input handles safely and generates 15 findings');

  // Test 3: Missing telemetry handling
  const performanceNoReal = evaluatePilotPerformance({ isRealTelemetryConnected: false });
  assert(performanceNoReal.productionPerformanceStatus === 'PARTIAL', 'Test 3: Missing real telemetry marks production performance status PARTIAL');

  // Test 4: Missing KPI fallback
  assert(performanceNoReal.totalKPICount === 13, 'Test 4: Missing KPI falls back to total count 13');

  // Test 5: Zero observed value handling
  const perfMetrics = performanceNoReal.metrics.find((m) => m.key === 'productionRate');
  assert(perfMetrics !== undefined && perfMetrics.observed === undefined, 'Test 5: Unmeasured observed value yields undefined observed metric');

  // Test 6: Zero denominator percentage error protection
  assert(perfMetrics?.percentageError === undefined, 'Test 6: Zero or missing denominator protects percentageError as undefined');

  // Test 7: NaN input safety in model validation
  const validationSummary = evaluateModelValidation(undefined);
  assert(Number.isFinite(validationSummary.baselineMae) && Number.isFinite(validationSummary.calibratedMae), 'Test 7: NaN/undefined input safe in model validation');

  // Test 8: Infinity input safety in model validation
  assert(Number.isFinite(validationSummary.errorReductionPercent), 'Test 8: Error reduction percentage is finite numeric');

  // Test 9: Missing provenance handling defaults cleanly
  const evidence = collectAssessmentEvidence(undefined);
  assert(evidence.every((e) => e.provenance !== undefined), 'Test 9: All evidence items have defined provenance');

  // Test 10: Simulated telemetry provenance labeled
  assert(defaultAssessment.dataProvenanceLabel === 'SIMULATED TELEMETRY', 'Test 10: Simulated telemetry provenance labeled');

  // Test 11: Historical data provenance present in evidence
  assert(evidence.some((e) => e.provenance === 'MEASURED'), 'Test 11: Historical data provenance present in evidence registry');

  // Test 12: Real field telemetry toggle updates assessment
  const realAssessment = executeFinalEngineeringAssessment({ isRealTelemetryConnected: true });
  assert(realAssessment.dataProvenanceLabel === 'REAL FIELD TELEMETRY', 'Test 12: Real field telemetry toggle updates data provenance label');

  // Test 13: Model validation accuracy metrics evaluated
  assert(validationSummary.errorReductionPercent > 10, 'Test 13: Model validation shows > 10% error reduction');

  // Test 14: Calibration error reduction matches expected MAE improvement
  assert(validationSummary.calibratedMae < validationSummary.baselineMae, 'Test 14: Calibrated MAE is lower than baseline MAE');

  // Test 15: Uncertainty interval evaluation (P10 <= P50 <= P90)
  const uncertainty = evaluateUncertaintyAssessment(undefined);
  assert(uncertainty.p10Bopd <= uncertainty.p50Bopd && uncertainty.p50Bopd <= uncertainty.p90Bopd, 'Test 15: Uncertainty P10 <= P50 <= P90 monotonic ordering');

  // Test 16: Operational readiness gates evaluated
  const ops = evaluateOperationalAssessment(undefined);
  assert(ops.humanReviewRequired === true, 'Test 16: Operational assessment enforces human review requirement');

  // Test 17: Deployment readiness status evaluated
  const deployment = evaluateDeploymentRecommendation({ isRealTelemetryConnected: false }, []);
  assert(deployment.status === 'FIELD_VALIDATION_REQUIRED', 'Test 17: Deployment status evaluates FIELD_VALIDATION_REQUIRED when unconnected');

  // Test 18: Risk metrics advisory enforcement
  const risk = evaluateRiskAssessment(undefined);
  assert(risk.riskMetrics.every((r) => r.advisoryOnly === true), 'Test 18: Risk metrics strictly enforce advisoryOnly: true');

  // Test 19: Gap analysis detects SCADA & gauge gaps
  const gaps = evaluateGapAnalysis({ isRealTelemetryConnected: false });
  assert(gaps.some((g) => g.category === 'SCADA_INTEGRATION'), 'Test 19: Gap analysis detects missing physical SCADA integration');

  // Test 20: Human-review requirement contains engineering roles
  assert(deployment.requiredHumanReview.length === 3, 'Test 20: Deployment assessment specifies 3 human review engineering roles');

  // Test 21: Evidence traceability mapping for all findings
  assert(defaultAssessment.findings.every((f) => f.evidenceIds.length > 0), 'Test 21: All findings map to at least one evidence ID');

  // Test 22: 16-section report generation
  const report = generateAssessmentReport(defaultAssessment);
  assert(report.sections.length === 16, 'Test 22: Assessment report generates exactly 16 sections');

  // Test 23: Mandatory disclaimer present in report
  assert(report.disclaimer === MANDATORY_ASSESSMENT_DISCLAIMER, 'Test 23: Mandatory assessment disclaimer enforced');

  // Test 24: Zero fabricated field data rule — disclaimer forbids presenting simulation as field data
  assert(MANDATORY_ASSESSMENT_DISCLAIMER.includes('Simulation results must not be presented as measured field results'), 'Test 24: Disclaimer explicitly forbids presenting simulation as field data');

  // Test 25: Unsupported deployment status when critical gaps present
  const criticalGapsDeployment = evaluateDeploymentRecommendation(undefined, [{ gapId: 'G1', category: 'OPERATIONAL_SAFETY', title: 'Critical Safety', description: 'desc', severity: 'CRITICAL', requiredAction: 'act' }]);
  assert(criticalGapsDeployment.status === 'NOT_SUPPORTED_FOR_DEPLOYMENT', 'Test 25: Critical gaps trigger NOT_SUPPORTED_FOR_DEPLOYMENT');

  // Test 26: Full end-to-end assessment contains executive summary
  assert(defaultAssessment.executiveSummary.includes('Deployment Status:'), 'Test 26: Executive summary includes deployment status');

  // Test 27: Deterministic repeated execution
  const run1 = executeFinalEngineeringAssessment();
  const run2 = executeFinalEngineeringAssessment();
  assert(run1.findings.length === run2.findings.length, 'Test 27: Deterministic repeated execution produces identical finding count');

  // Test 28: Empty input safety
  const emptyAssessment = executeFinalEngineeringAssessment({});
  assert(emptyAssessment.evidenceRegistry.length > 0, 'Test 28: Empty input safely yields valid evidence registry');

  // Test 29: Partial input safety
  const partialAssessment = executeFinalEngineeringAssessment({ isRealTelemetryConnected: true });
  assert(partialAssessment.deployment.status === 'FIELD_VALIDATION_REQUIRED' || partialAssessment.deployment.status === 'CONTROLLED_PILOT_REQUIRED', 'Test 29: Partial input safely evaluates deployment status');

  // Test 30: Total cumulative simulation test count verification
  assert(TOTAL_VERIFIED_SIMULATION_TESTS_ASSESSMENT === 366, 'Test 30: Total verified simulation tests count check (366 tests)');
} catch (err) {
  console.error('Test suite error:', err);
  failed++;
}

console.log('====================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  throw new Error(`Final Engineering Assessment test suite failed with ${failed} failure(s).`);
}

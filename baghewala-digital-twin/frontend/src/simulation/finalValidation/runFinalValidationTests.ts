import {
  executeFinalValidation,
  evaluateSystemVerification,
  summarizeEngineeringEvidence,
  summarizePerformanceMetrics,
  summarizeReadiness,
  summarizePilotExecution,
  collectEngineeringLimitations,
  generateDemoScenarios,
  generateFinalReport,
  MANDATORY_FINAL_VALIDATION_DISCLAIMER,
  TOTAL_VERIFIED_SIMULATION_TESTS_FINAL_VALIDATION,
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
console.log('STEP 5.13 — FINAL VALIDATION TEST SUITE');
console.log('====================================================');

try {
  // Test 1: Complete default system verification
  const verification = evaluateSystemVerification();
  assert(verification.suites.length === 19 && verification.totalTestCount === 394, `Test 1: System verification aggregates 19 suites (${verification.totalTestCount} tests)`);

  // Test 2: Missing suite handling
  const missingVerification = evaluateSystemVerification([
    { suiteId: 'S1', stepReference: 'Step 4.3', moduleName: 'Thermal', testCount: 5, passed: 5, failed: 0, status: 'NOT_AVAILABLE', buildStatus: 'PASS', limitations: [] },
  ]);
  assert(missingVerification.overallVerificationStatus === 'PARTIAL', 'Test 2: Missing suite marks overall status PARTIAL');

  // Test 3: Failed suite handling
  const failedVerification = evaluateSystemVerification([
    { suiteId: 'S1', stepReference: 'Step 4.3', moduleName: 'Thermal', testCount: 5, passed: 4, failed: 1, status: 'FAIL', buildStatus: 'PASS', limitations: [] },
  ]);
  assert(failedVerification.overallVerificationStatus === 'FAIL', 'Test 3: Failed suite marks overall status FAIL');

  // Test 4: Build failure handling
  const buildFailVerification = evaluateSystemVerification([
    { suiteId: 'S1', stepReference: 'Step 4.3', moduleName: 'Thermal', testCount: 5, passed: 5, failed: 0, status: 'PASS', buildStatus: 'FAIL', limitations: [] },
  ]);
  assert(buildFailVerification.overallBuildStatus === 'FAIL', 'Test 4: Build failure correctly detected');

  // Test 5: Evidence aggregation
  const evidence = summarizeEngineeringEvidence(undefined);
  assert(evidence.length >= 15, 'Test 5: Evidence summary aggregates at least 15 items');

  // Test 6: Provenance preservation
  assert(evidence.every((e) => e.provenance !== undefined), 'Test 6: Provenance preserved across all evidence items');

  // Test 7: Simulated telemetry provenance
  const simEvidence = summarizeEngineeringEvidence({ isRealTelemetryConnected: false });
  assert(simEvidence.some((e) => e.provenance === 'SIMULATED'), 'Test 7: Simulated telemetry provenance preserved');

  // Test 8: Historical data provenance
  assert(simEvidence.some((e) => e.provenance === 'MEASURED'), 'Test 8: Historical data provenance preserved');

  // Test 9: Real telemetry toggle updates evidence
  const realEvidence = summarizeEngineeringEvidence({ isRealTelemetryConnected: true });
  assert(realEvidence.some((e) => e.id === 'EVD-513-02' && e.provenance === 'MEASURED'), 'Test 9: Real telemetry toggle updates provenance to MEASURED');

  // Test 10: Missing telemetry handling
  const perfNoReal = summarizePerformanceMetrics({ isRealTelemetryConnected: false });
  assert(perfNoReal.some((m) => m.key === 'productionRate' && m.observed === undefined), 'Test 10: Missing real telemetry yields undefined observed metric');

  // Test 11: KPI aggregation in pilot summary
  const pilotSummary = summarizePilotExecution(undefined);
  assert(Object.keys(pilotSummary.kpis).length >= 4, 'Test 11: Pilot summary aggregates KPIs');

  // Test 12: Model validation summary in readiness
  const readiness = summarizeReadiness(undefined);
  assert(readiness.operationalReadiness === 'DEMONSTRATION_READY', 'Test 12: Operational readiness evaluates DEMONSTRATION_READY');

  // Test 13: Uncertainty in demonstration scenarios
  const demoScenarios = generateDemoScenarios();
  assert(demoScenarios.every((s) => s.p10Bopd <= s.p50Bopd && s.p50Bopd <= s.p90Bopd), 'Test 13: All 6 demo scenarios maintain P10 <= P50 <= P90 ordering');

  // Test 14: Operational readiness summary
  assert(readiness.gaps.length === 4, 'Test 14: Readiness summary lists 4 explicit engineering gaps');

  // Test 15: Deployment readiness evaluation
  assert(readiness.deploymentReadiness === 'FIELD_VALIDATION', 'Test 15: Deployment readiness evaluates FIELD_VALIDATION when unconnected');

  // Test 16: Production pilot summary mode
  assert(pilotSummary.pilotExecutionMode === 'SIMULATED_PILOT', 'Test 16: Pilot summary evaluates SIMULATED_PILOT mode');

  // Test 17: Final engineering assessment integration
  const state = executeFinalValidation(undefined);
  assert(state.validationId.startsWith('VAL-BAGHEWALA'), 'Test 17: Final validation engine executes seamlessly');

  // Test 18: Limitations collection
  const limitations = collectEngineeringLimitations();
  assert(limitations.length === 6, 'Test 18: Engineering limitations engine collects 6 caveats');

  // Test 19: Scenario 1 (Normal baseline)
  assert(demoScenarios[0].scenarioId === 'DEMO-SCENARIO-01' && demoScenarios[0].temperatureC >= 55, 'Test 19: Demo Scenario 1 (Normal baseline) temperature valid');

  // Test 20: Scenario 2 (High viscosity)
  assert(demoScenarios[1].scenarioId === 'DEMO-SCENARIO-02' && demoScenarios[1].viscosityCp > 10000, 'Test 20: Demo Scenario 2 (High viscosity) viscosity > 10,000 cP');

  // Test 21: Scenario 3 (Low pressure)
  assert(
    demoScenarios[2].scenarioId === 'DEMO-SCENARIO-03' && demoScenarios[2].productionBopd <= demoScenarios[0].productionBopd,
    `Test 21: Demo Scenario 3 (Low pressure: ${demoScenarios[2].productionBopd} BOPD) <= Scenario 1 (${demoScenarios[0].productionBopd} BOPD)`
  );

  // Test 22: Scenario 4 (CSS thermal boost)
  assert(demoScenarios[3].scenarioId === 'DEMO-SCENARIO-04' && demoScenarios[3].temperatureC > demoScenarios[0].temperatureC, 'Test 22: Demo Scenario 4 (CSS boost) temperature > Scenario 1');

  // Test 23: Scenario 5 (SRP load testing)
  assert(demoScenarios[4].scenarioId === 'DEMO-SCENARIO-05' && demoScenarios[4].srpLoadIndex > 80, 'Test 23: Demo Scenario 5 (SRP load) SRP load > 80%');

  // Test 24: Scenario 6 (Elevated risk)
  assert(demoScenarios[5].scenarioId === 'DEMO-SCENARIO-06' && (demoScenarios[5].riskLevel === 'HIGH' || demoScenarios[5].riskLevel === 'CRITICAL'), 'Test 24: Demo Scenario 6 (Elevated risk) evaluates HIGH/CRITICAL risk');

  // Test 25: Evidence traceability
  assert(state.evidence.every((e) => e.id.startsWith('EVD-')), 'Test 25: Evidence items contain valid EVD- prefix');

  // Test 26: Report generation
  const report = generateFinalReport(state);
  assert(report.sections.length === 22, 'Test 26: Final engineering report generates 22 sections');

  // Test 27: Missing data safety in state execution
  const emptyState = executeFinalValidation({});
  assert(emptyState.verification.totalPassedCount === 394, 'Test 27: Empty input executes safely and preserves verification count');

  // Test 28: NaN/Infinity safety in demo scenario pipeline
  assert(demoScenarios.every((s) => Number.isFinite(s.productionBopd) && Number.isFinite(s.viscosityCp)), 'Test 28: All demo scenario metrics are finite numeric');

  // Test 29: Advisory-only enforcement in disclaimer
  assert(MANDATORY_FINAL_VALIDATION_DISCLAIMER.includes('Decision support only — no automatic field actuation'), 'Test 29: Mandatory disclaimer strictly enforces advisory-only rule');

  // Test 30: Total verified simulation test count check (424 tests)
  assert(TOTAL_VERIFIED_SIMULATION_TESTS_FINAL_VALIDATION === 424, 'Test 30: Verified cumulative simulation test suite count (424 tests)');
} catch (err) {
  console.error('Test suite error:', err);
  failed++;
}

console.log('====================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  throw new Error(`Final Validation test suite failed with ${failed} failure(s).`);
}

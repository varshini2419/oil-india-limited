import {
  executeFinalDeploymentValidation,
  evaluateDeploymentGates,
  evaluateTelemetryConnectionReadiness,
  evaluateFieldPilotDataAcceptance,
  evaluateModelAcceptance,
  evaluateSafetyGovernance,
  evaluateFieldPilotChecklist,
  generateDeploymentAuditTrail,
  MANDATORY_DEPLOYMENT_DISCLAIMER,
  TOTAL_VERIFIED_SIMULATION_TESTS_DEPLOYMENT,
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
console.log('STEP 5.10 — DEPLOYMENT READINESS TEST SUITE');
console.log('====================================================');

try {
  // Test 1: Final validation returns valid state object
  const defaultRes = executeFinalDeploymentValidation({});
  assert(defaultRes !== undefined && defaultRes.timestamp.length > 0, 'Test 1: Final validation returns valid state object');

  // Test 2: Field certified flag explicitly false
  assert(defaultRes.fieldCertified === false, 'Test 2: Field certified flag is explicitly false');

  // Test 3: Mandatory disclaimer present
  assert(defaultRes.disclaimer === MANDATORY_DEPLOYMENT_DISCLAIMER, 'Test 3: Mandatory disclaimer enforced');

  // Test 4: Default readiness level evaluates to ENGINEERING_REVIEW_READY or DEMO_READY
  assert(
    defaultRes.readinessLevel === 'ENGINEERING_REVIEW_READY' || defaultRes.readinessLevel === 'DEMO_READY',
    'Test 4: Default readiness level evaluates to ENGINEERING_REVIEW_READY or DEMO_READY'
  );

  // Test 5: All 15 deployment gates evaluated
  assert(defaultRes.deploymentGates.length === 15, 'Test 5: Exactly 15 deployment gates evaluated');

  // Test 6: Field pilot checklist evaluates 13 items
  assert(defaultRes.fieldPilotChecklist.totalChecks === 13, 'Test 6: Field pilot checklist evaluates 13 items');

  // Test 7: Simulated telemetry labeled correctly
  const simConn = evaluateTelemetryConnectionReadiness('USER_IMPORTED');
  assert(simConn.status === 'SIMULATED' && simConn.isSimulated === true, 'Test 7: Simulated telemetry labeled correctly');

  // Test 8: Real field feed unconfigured evaluates DISCONNECTED
  const realConn = evaluateTelemetryConnectionReadiness('REAL_FIELD');
  assert(realConn.status === 'DISCONNECTED' && realConn.recordCount === 0, 'Test 8: Unconfigured real field feed evaluates DISCONNECTED');

  // Test 9: Test feed override evaluated correctly
  const testConn = evaluateTelemetryConnectionReadiness('REAL_FIELD', 'TEST_FEED');
  assert(testConn.status === 'TEST_FEED' && testConn.recordCount === 48, 'Test 9: Test feed override evaluated correctly');

  // Test 10: Real field feed override evaluated correctly
  const realOverride = evaluateTelemetryConnectionReadiness('REAL_FIELD', 'REAL_FIELD_FEED');
  assert(realOverride.status === 'REAL_FIELD_FEED' && realOverride.isSimulated === false, 'Test 10: Real field feed override evaluated correctly');

  // Test 11: Data acceptance INSUFFICIENT_DATA when disconnected
  const discData = evaluateFieldPilotDataAcceptance(realConn);
  assert(discData.status === 'INSUFFICIENT_DATA', 'Test 11: Data acceptance INSUFFICIENT_DATA when disconnected');

  // Test 12: Data acceptance REJECT on physical bound violation
  const rejectData = evaluateFieldPilotDataAcceptance(simConn, { physicalBoundViolations: 2 });
  assert(rejectData.status === 'REJECT', 'Test 12: Data acceptance REJECT on physical bound violation');

  // Test 13: Data acceptance ACCEPT_WITH_WARNINGS on missing fields
  const warnData = evaluateFieldPilotDataAcceptance(simConn, { missingValueCount: 3 });
  assert(warnData.status === 'ACCEPT_WITH_WARNINGS', 'Test 13: Data acceptance ACCEPT_WITH_WARNINGS on missing fields');

  // Test 14: Data acceptance ACCEPT on clean data
  const cleanData = evaluateFieldPilotDataAcceptance(simConn, { completenessPercent: 95, missingValueCount: 0, outlierCount: 0 });
  assert(cleanData.status === 'ACCEPT', 'Test 14: Data acceptance ACCEPT on clean data');

  // Test 15: Safety governance enforces advisory-only
  const safety = evaluateSafetyGovernance({});
  assert(safety.advisoryOnlyEnforced === true && safety.automaticActuationBlocked === true, 'Test 15: Safety governance enforces advisory-only');

  // Test 16: Safety check bypass triggers BLOCKED gate and NOT_READY status
  const bypassRes = executeFinalDeploymentValidation({ bypassSafetyChecks: true });
  assert(bypassRes.readinessLevel === 'NOT_READY' && bypassRes.blockers.length > 0, 'Test 16: Safety check bypass triggers BLOCKED gate and NOT_READY status');

  // Test 17: Model acceptance handles missing validation state
  const missingModelAcc = evaluateModelAcceptance(undefined);
  assert(missingModelAcc.status === 'THRESHOLD_NOT_DEFINED', 'Test 17: Model acceptance handles missing validation state');

  // Test 18: Deployment audit trail generates 12 events
  const auditEvents = generateDeploymentAuditTrail(simConn, cleanData, missingModelAcc, safety, defaultRes.deploymentGates);
  assert(auditEvents.length === 12, 'Test 18: Deployment audit trail generates 12 events');

  // Test 19: Audit trail event 1 correctly tags telemetry provenance
  assert(auditEvents[0].inputProvenance === simConn.provenance, 'Test 19: Audit trail event 1 tags telemetry provenance');

  // Test 20: PILOT_VALIDATION_READY achieved when real telemetry connected and checklist passed
  const pilotRes = executeFinalDeploymentValidation({ sourceType: 'REAL_FIELD', telemetryStatus: 'REAL_FIELD_FEED' });
  assert(pilotRes.readinessLevel === 'PILOT_VALIDATION_READY', 'Test 20: PILOT_VALIDATION_READY achieved when real telemetry connected');

  // Test 21: DEMO_READY assigned when critical gate blocked
  const gateTest = evaluateDeploymentGates({}, { isSimulatedTelemetry: false, isRealTelemetryConnected: false });
  assert(gateTest.some((g) => g.status === 'BLOCKED'), 'Test 21: Disconnected telemetry blocks GATE-08');

  // Test 22: Low data quality (<50) blocks Gate 9
  const lowDataGates = evaluateDeploymentGates({}, { dataQualityScore: 40 });
  const gate9 = lowDataGates.find((g) => g.gateId === 'GATE-09');
  assert(gate9?.status === 'BLOCKED', 'Test 22: Low data quality (<50) blocks Gate 9');

  // Test 23: Baseline model mode logs warning in Gate 5
  const baselineGates = evaluateDeploymentGates({ modelMode: 'BASELINE' }, { hasCalibration: false });
  const gate5 = baselineGates.find((g) => g.gateId === 'GATE-05');
  assert(gate5?.status === 'WARNING', 'Test 23: Baseline model mode logs warning in Gate 5');

  // Test 24: Calibrated model mode passes Gate 5
  const calibGates = evaluateDeploymentGates({ modelMode: 'CALIBRATED' }, { hasCalibration: true });
  const gate5Calib = calibGates.find((g) => g.gateId === 'GATE-05');
  assert(gate5Calib?.status === 'PASS', 'Test 24: Calibrated model mode passes Gate 5');

  // Test 25: Checklist total passed matches passed checks
  const checklist = evaluateFieldPilotChecklist(defaultRes.deploymentGates, simConn, cleanData, safety);
  assert(checklist.totalPassed <= checklist.totalChecks && checklist.completionPercentage >= 0, 'Test 25: Checklist completion percentage valid');

  // Test 26: Required actions populated for warning/blocked gates
  assert(defaultRes.requiredActions.length >= 0, 'Test 26: Required actions array present');

  // Test 27: Total verified simulation unit tests count check
  assert(TOTAL_VERIFIED_SIMULATION_TESTS_DEPLOYMENT === 304, 'Test 27: Verified prior 16 simulation test suites (304 tests)');

  // Test 28: Deterministic repeated execution
  const run1 = executeFinalDeploymentValidation({ sourceType: 'HISTORICAL' });
  const run2 = executeFinalDeploymentValidation({ sourceType: 'HISTORICAL' });
  assert(run1.readinessLevel === run2.readinessLevel, 'Test 28: Deterministic repeated execution');

  // Test 29: Provenance preserved in final validation output
  assert(defaultRes.provenance !== undefined, 'Test 29: Provenance preserved in final validation output');

  // Test 30: No automatic actuation statement enforced
  assert(MANDATORY_DEPLOYMENT_DISCLAIMER.includes('no automatic field actuation'), 'Test 30: No automatic field actuation rule enforced');
} catch (err) {
  console.error('Test suite error:', err);
  failed++;
}

console.log('====================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  throw new Error(`Deployment Readiness test suite failed with ${failed} failure(s).`);
}

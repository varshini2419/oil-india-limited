import {
  getEnvironmentConfig,
  generateDemonstrationScenarios,
  generateReleaseManifest,
  evaluateReleaseChecklist,
  executeReleaseVerification,
  MANDATORY_RELEASE_DISCLAIMER,
  PROJECT_RELEASE_VERSION,
} from './index';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`✓ PASS: Test ${passed}: ${testName}`);
  } else {
    failed++;
    console.error(`✗ FAIL: Test ${passed + failed}: ${testName} - ${detail || ''}`);
  }
}

console.log('====================================================');
console.log('STEP 6.2 — PRODUCTION RELEASE & FINAL FREEZE TEST SUITE');
console.log('====================================================');

try {
  // Test 1: Production environment config defaults
  const envDemo = getEnvironmentConfig('DEMONSTRATION');
  assert(
    envDemo.appMode === 'DEMONSTRATION' && envDemo.isRealFieldConnected === false,
    'Environment configuration defaults to DEMONSTRATION mode safely'
  );

  // Test 2: Production environment mode separation
  const envProd = getEnvironmentConfig('PRODUCTION');
  assert(
    envProd.appMode === 'PRODUCTION' && envProd.featureFlags.enableRealFieldSCADA === true,
    'PRODUCTION environment mode activates production feature flags'
  );

  // Test 3: Feature flags configuration
  assert(
    envDemo.featureFlags.strictAdvisoryOnlyEnforcement === true &&
      envDemo.featureFlags.telemetryStaleThresholdSeconds === 300,
    'Strict advisory-only enforcement and 300s telemetry threshold flags verified'
  );

  // Test 4: Release manifest generation
  const manifest = generateReleaseManifest('DEMONSTRATION');
  assert(
    manifest.projectName.includes('Baghewala') && manifest.releaseId.startsWith('REL-BW-'),
    'Release manifest generates valid project name and REL-BW- release ID'
  );

  // Test 5: Version string verification
  assert(
    manifest.version === PROJECT_RELEASE_VERSION,
    'Release manifest specifies exact project version (v1.0.0-release-freeze)'
  );

  // Test 6: Step 5 freeze status
  assert(
    manifest.step5FreezeStatus === 'FROZEN_VALIDATED',
    'Step 5 freeze status explicitly declared FROZEN_VALIDATED'
  );

  // Test 7: Step 6.1 status
  assert(
    manifest.step61Status === 'BLOCKED_SAFETY_AUDIT',
    'Step 6.1 status reflects unresolved safety audit blockers'
  );

  // Test 8: Step 6.2 status
  assert(
    manifest.step62Status === 'RELEASE_BLOCKED',
    'Step 6.2 status remains blocked until all release gates pass'
  );

  // Test 9: Verified test suites count
  assert(
    manifest.verifiedTestSuitesCount === 23,
    'Release manifest records all 23 discovered simulation and release runners'
  );

  // Test 10: Verified total tests count
  assert(
    manifest.verifiedTotalTestsCount === 518,
    'Release manifest records 518 test checks printed by the discovered runners'
  );

  // Test 11: Build status record
  assert(
    manifest.buildStatus === 'SUCCESS_ZERO_ERRORS',
    'Build status recorded as SUCCESS_ZERO_ERRORS'
  );

  // Test 12: Registered routes count
  assert(
    manifest.registeredRoutesCount === 17,
    'Release manifest lists 17 registered workspace UI routes'
  );

  // Test 13: Real-field connectivity status
  assert(
    manifest.realFieldConnectivityStatus === 'NOT_CONNECTED_DISCONNECTED',
    'Real-field connectivity recorded as DISCONNECTED when physical feed is unconfigured'
  );

  // Test 14: Safety governance status
  assert(
    manifest.safetyGovernanceStatus === 'ADVISORY_ONLY_ENFORCED',
    'Safety governance status declared ADVISORY_ONLY_ENFORCED'
  );

  // Test 15: Mandatory release limitations count
  assert(
    manifest.limitations.length >= 6,
    'Release manifest contains at least 6 explicit engineering caveats'
  );

  // Test 16: Mandatory release disclaimer
  assert(
    manifest.disclaimer === MANDATORY_RELEASE_DISCLAIMER &&
      manifest.disclaimer.includes('Decision support only'),
    'Mandatory release disclaimer contains non-actuation safety statement'
  );

  // Test 17: Demonstration scenarios count
  const demoScenarios = generateDemonstrationScenarios();
  assert(
    demoScenarios.length === 4,
    'Demonstration scenario engine generates exactly 4 deterministic scenarios'
  );

  // Test 18: Demonstration Scenario A (Normal baseline)
  const scA = demoScenarios[0];
  assert(
    scA.id === 'SCENARIO_A_NORMAL' && scA.expectedResults.modeledTemperatureC >= 58.0,
    'Scenario A evaluates nominal heated reservoir baseline (>=58°C)'
  );

  // Test 19: Demonstration Scenario B (Viscosity spike)
  const scB = demoScenarios[1];
  assert(
    scB.id === 'SCENARIO_B_VISCOSITY_SPIKE' && scB.expectedResults.estimatedViscosityCp > 10000,
    'Scenario B evaluates unheated cool reservoir crude viscosity spike (>10,000 cP)'
  );

  // Test 20: Demonstration Scenario C (Thermal degradation & SPM load)
  const scC = demoScenarios[2];
  assert(
    scC.id === 'SCENARIO_C_THERMAL_DEGRADATION' && scC.expectedResults.srpLoadIndex > 80,
    'Scenario C evaluates high SPM pumping speed mechanical load (>80%)'
  );

  // Test 21: Demonstration Scenario D (Corrupt data rejection)
  const scD = demoScenarios[3];
  assert(
    scD.id === 'SCENARIO_D_POOR_DATA_QUALITY' && scD.expectedResults.dataQualityStatus === 'REJECTED',
    'Scenario D evaluates data quality rejection gate for malformed telemetry'
  );

  // Test 22: Demonstration category label
  assert(
    demoScenarios.every((sc) => sc.category === 'SIMULATED DEMONSTRATION SCENARIO'),
    'All demonstration scenarios explicitly labeled SIMULATED DEMONSTRATION SCENARIO'
  );

  // Test 23: Release checklist items count
  const checklist = evaluateReleaseChecklist();
  assert(
    checklist.length === 20,
    'Release checklist evaluates exactly 20 readiness checks'
  );

  // Test 24: Release checklist evaluation status
  assert(
    checklist.length === 20 && checklist.some((item) => !item.passed),
    'Release checklist retains explicit failures for unresolved safety and integrity gates'
  );

  // Test 25: Release verification orchestrator execution
  const verification = executeReleaseVerification('DEMONSTRATION');
  assert(
    verification.isReleaseReady === false && verification.checklistPassedCount < verification.checklistTotalCount,
    'Release verification blocks freeze while checklist blockers remain'
  );

  // Test 26: Final freeze record generation
  assert(
    verification.freezeRecord.freezeId.startsWith('REVIEW-BW-') &&
      verification.freezeRecord.timestamp !== undefined &&
      verification.freezeRecord.freezeStatement.startsWith('NO RELEASE FREEZE'),
    'Blocked verification creates a review record and does not claim a freeze'
  );

  // Test 27: Authorized role in freeze record
  assert(
    verification.freezeRecord.authorizedRole === 'NOT AUTHORIZED — RELEASE BLOCKED',
    'Blocked release record cannot authorize a freeze'
  );

  // Test 28: Freeze statement contents
  assert(
    verification.freezeRecord.freezeStatement.startsWith('NO RELEASE FREEZE') &&
      verification.manifest.disclaimer.includes('Decision support only'),
    'Blocked release preserves the advisory-only disclaimer without claiming a freeze'
  );

  // Test 29: Warnings for disconnected SCADA
  assert(
    verification.warnings.length > 0 && verification.warnings[0].includes('DISCONNECTED'),
    'Verification records clear warning for unconfigured physical SCADA'
  );

  // Test 30: Deterministic repeated execution
  const ver2 = executeReleaseVerification('DEMONSTRATION');
  assert(
    ver2.isReleaseReady === verification.isReleaseReady &&
      ver2.checklistPassedCount === verification.checklistPassedCount,
    'Deterministic repeated verification produces identical checklist pass count'
  );

} catch (err) {
  console.error('Test execution threw an error:', err);
  failed++;
}

console.log('====================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  throw new Error(`Release test suite failed with ${failed} test failures.`);
}

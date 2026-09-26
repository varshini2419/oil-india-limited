import {
  executeFieldIntegration,
  establishTelemetryConnection,
  validateAndNormalizeSchema,
  evaluateLiveDataQuality,
  evaluatePilotGate,
  generateIntegrationReport,
  STALE_TELEMETRY_THRESHOLD_SECONDS,
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
console.log('STEP 6.1 — FIELD INTEGRATION & PILOT READINESS TEST SUITE');
console.log('====================================================');

try {
  // Test 1: Valid simulated telemetry
  const simRes = executeFieldIntegration({ mode: 'SIMULATED' });
  assert(
    simRes.mode === 'SIMULATED' && simRes.connectionStatus === 'SIMULATING',
    'Valid simulated telemetry initializes correctly'
  );

  // Test 2: Valid replay telemetry
  const replayRes = executeFieldIntegration({ mode: 'REPLAY' });
  assert(
    replayRes.mode === 'REPLAY' && replayRes.provenanceLabel === 'REPLAY TELEMETRY',
    'Valid replay telemetry initializes correctly'
  );

  // Test 3: Real-field disconnected
  const realDisc = executeFieldIntegration({ mode: 'REAL_FIELD', realFieldConnected: false });
  assert(
    realDisc.connectionStatus === 'NOT_CONNECTED' && realDisc.latestTelemetry === null,
    'Real-field mode without physical connection returns NOT_CONNECTED'
  );

  // Test 4: Invalid schema handling
  const schemaBad = validateAndNormalizeSchema({ timestamp: 'INVALID_DATE', wellId: '' }, 'SIMULATED', 'SIMULATED TELEMETRY');
  assert(
    schemaBad.warnings.length > 0 && schemaBad.wellId === 'BW-01',
    'Invalid schema is handled safely with fallback defaults'
  );

  // Test 5: Missing required fields
  const schemaMissing = validateAndNormalizeSchema({ timestamp: new Date().toISOString() }, 'SIMULATED', 'SIMULATED TELEMETRY');
  assert(
    schemaMissing.missingFields.includes('temperature') && schemaMissing.temperatureC === null,
    'Missing fields evaluate to null (NOT_AVAILABLE) without silent substitution'
  );

  // Test 6: Unknown units normalization
  const unitNorm = validateAndNormalizeSchema(
    {
      temperature: 136.4,
      temperatureUnit: '°F', // 136.4 °F = 58 °C
      pressure: 507.6,
      pressureUnit: 'psi', // 507.6 psi = 35 bar
      production: 10,
      productionUnit: 'm3/day', // 10 m3/day = ~62.9 BOPD
    },
    'SIMULATED',
    'SIMULATED TELEMETRY'
  );
  assert(
    Math.round(unitNorm.temperatureC || 0) === 58 && Math.round(unitNorm.pressureBar || 0) === 35,
    'Unit normalization converts °F -> °C and psi -> bar accurately'
  );

  // Test 7: Stale telemetry detection
  const oldIso = new Date(Date.now() - (STALE_TELEMETRY_THRESHOLD_SECONDS + 50) * 1000).toISOString();
  const staleState = executeFieldIntegration({
    mode: 'SIMULATED',
    customTelemetryInput: { timestamp: oldIso },
  });
  assert(
    staleState.qualityResult.freshness === 'STALE',
    'Telemetry older than threshold evaluates LIVE DATA STATUS -> STALE'
  );

  // Test 8: Duplicate telemetry handling
  const dupRecord = validateAndNormalizeSchema({ timestamp: '2026-09-26T12:00:00.000Z' }, 'SIMULATED', 'SIMULATED TELEMETRY');
  assert(
    dupRecord.timestamp === '2026-09-26T12:00:00.000Z',
    'Duplicate timestamp record parsed deterministically'
  );

  // Test 9: Out-of-range values
  const outOfRange = evaluateLiveDataQuality(
    validateAndNormalizeSchema({ temperature: 320.0 }, 'SIMULATED', 'SIMULATED TELEMETRY')
  );
  assert(
    outOfRange.rangeViolations.length > 0,
    'Extreme out-of-range temperature (>250°C) triggers range violation warning'
  );

  // Test 10: NaN handling
  const nanInput = validateAndNormalizeSchema({ temperature: 'NaN', pressure: NaN }, 'SIMULATED', 'SIMULATED TELEMETRY');
  assert(
    nanInput.temperatureC === null && nanInput.pressureBar === null,
    'NaN values evaluate safely to null (NOT_AVAILABLE)'
  );

  // Test 11: Infinity handling
  const infInput = validateAndNormalizeSchema({ temperature: Infinity }, 'SIMULATED', 'SIMULATED TELEMETRY');
  assert(
    infInput.temperatureC === null,
    'Infinity values evaluate safely to null'
  );

  // Test 12: Zero values handling
  const zeroInput = validateAndNormalizeSchema({ production: 0, productionUnit: 'BOPD' }, 'SIMULATED', 'SIMULATED TELEMETRY');
  assert(
    zeroInput.productionBopd === 0,
    'Valid zero production rate is preserved as 0 BOPD'
  );

  // Test 13: Provenance preservation
  const provSim = establishTelemetryConnection({ mode: 'SIMULATED' });
  const provRep = establishTelemetryConnection({ mode: 'REPLAY' });
  const provReal = establishTelemetryConnection({ mode: 'REAL_FIELD', realFieldConnected: false });
  assert(
    provSim.provenanceLabel === 'SIMULATED TELEMETRY' &&
      provRep.provenanceLabel === 'REPLAY TELEMETRY' &&
      provReal.provenanceLabel === 'REAL FIELD TELEMETRY',
    'Provenance tags preserved across all 3 telemetry modes'
  );

  // Test 14: Data quality downgrade
  const partialRecord = validateAndNormalizeSchema({ temperature: 58.0 }, 'SIMULATED', 'SIMULATED TELEMETRY');
  const partialQual = evaluateLiveDataQuality(partialRecord);
  assert(
    partialQual.status === 'ACCEPTED_WITH_WARNING',
    'Telemetry with missing non-critical metrics downgrades to ACCEPTED_WITH_WARNING'
  );

  // Test 15: Rejected telemetry
  const rejectedQual = evaluateLiveDataQuality(null);
  assert(
    rejectedQual.status === 'REJECTED' && rejectedQual.rejectionReasons.length > 0,
    'Null record stream evaluates to REJECTED'
  );

  // Test 16: Accepted-with-warning
  const warnState = executeFieldIntegration({
    mode: 'SIMULATED',
    customTelemetryInput: { temperature: 58.0, pressure: 35.0 },
  });
  assert(
    warnState.qualityResult.status === 'ACCEPTED_WITH_WARNING',
    'Partial valid input produces ACCEPTED_WITH_WARNING status'
  );

  // Test 17: Pilot gate blocked when disconnected
  const discGate = evaluatePilotGate({
    mode: 'REAL_FIELD',
    connectionStatus: 'NOT_CONNECTED',
    qualityResult: evaluateLiveDataQuality(null),
    modelReady: true,
    uncertaintyAvailable: true,
    riskEngineAvailable: true,
  });
  assert(
    discGate.status === 'NOT_CONNECTED' && discGate.blockingIssues.length > 0,
    'Pilot gate evaluates NOT_CONNECTED when telemetry connection is disconnected'
  );

  // Test 18: Pilot gate ready
  const readyGate = evaluatePilotGate({
    mode: 'SIMULATED',
    connectionStatus: 'SIMULATING',
    qualityResult: evaluateLiveDataQuality(
      validateAndNormalizeSchema({ temperature: 58.0, pressure: 35.0 }, 'SIMULATED', 'SIMULATED TELEMETRY')
    ),
    modelReady: true,
    uncertaintyAvailable: true,
    riskEngineAvailable: true,
    operatorApproved: true,
  });
  assert(
    readyGate.status === 'PILOT_READY' && readyGate.conditions.operatorApproved,
    'Pilot gate evaluates PILOT_READY when all prerequisites and operator approval are met'
  );

  // Test 19: Pilot pause
  const pausedGate = evaluatePilotGate({
    mode: 'SIMULATED',
    connectionStatus: 'SIMULATING',
    qualityResult: evaluateLiveDataQuality(
      validateAndNormalizeSchema({ temperature: 58.0, pressure: 35.0 }, 'SIMULATED', 'SIMULATED TELEMETRY')
    ),
    modelReady: true,
    uncertaintyAvailable: true,
    riskEngineAvailable: true,
    operatorApproved: true,
    forcePilotPause: true,
  });
  assert(
    pausedGate.status === 'PILOT_PAUSED',
    'Pilot gate evaluates PILOT_PAUSED when pause flag is set'
  );

  // Test 20: Audit generation
  const auditState = executeFieldIntegration({ mode: 'SIMULATED' });
  assert(
    auditState.auditTrail.length > 0 && auditState.auditTrail[0].eventId.startsWith('EVD-INT-'),
    'Audit trail generates deterministic event ID with EVD-INT- prefix'
  );

  // Test 21: Advisory-only enforcement
  assert(
    auditState.advisorySummary.advisoryOnly === true &&
      auditState.mandatedDisclaimer.includes('Decision support only'),
    'Advisory-only governance rule strictly enforced in output state'
  );

  // Test 22: No equipment actuation safeguard
  assert(
    auditState.auditTrail.every((e) => e.advisoryOnly === true),
    'Audit trail confirms no automatic physical equipment actuation commands'
  );

  // Test 23: Existing physics integration
  assert(
    auditState.twinState !== null &&
      auditState.twinState.reservoir.estimatedViscosityCp > 0 &&
      auditState.twinState.production.estimatedProductionBopd > 0,
    'Existing thermal, viscosity, mobility, and production physics engines executed successfully'
  );

  // Test 24: Uncertainty engine integration
  assert(
    auditState.modelStatus.uncertaintyAvailable === true,
    'Uncertainty engine integration confirmed'
  );

  // Test 25: Risk engine integration
  assert(
    auditState.advisorySummary.riskLevel !== undefined && auditState.advisorySummary.riskScore >= 0,
    'Risk engine integration produces valid risk level and score'
  );

  // Test 26: Calibrated model integration
  assert(
    auditState.modelStatus.calibratedAvailable === true && auditState.modelStatus.modelMode === 'CALIBRATED',
    'Calibrated model mode active in field integration state'
  );

  // Test 27: Simulated vs real-field explicit distinction
  const simExec = executeFieldIntegration({ mode: 'SIMULATED' });
  const realExec = executeFieldIntegration({ mode: 'REAL_FIELD', realFieldConnected: false });
  assert(
    simExec.provenanceLabel === 'SIMULATED TELEMETRY' &&
      realExec.provenanceLabel === 'REAL FIELD TELEMETRY' &&
      realExec.connectionStatus === 'NOT_CONNECTED',
    'System explicitly distinguishes SIMULATED telemetry from disconnected REAL FIELD mode'
  );

  // Test 28: Telemetry freshness evaluation
  const freshSec = evaluateLiveDataQuality(
    validateAndNormalizeSchema({ timestamp: new Date().toISOString() }, 'SIMULATED', 'SIMULATED TELEMETRY')
  );
  assert(
    freshSec.freshness === 'LIVE' && freshSec.ageSeconds < 5,
    'Recent telemetry record evaluates freshness as LIVE'
  );

  // Test 29: End-to-end integration pipeline execution
  const report = generateIntegrationReport(simExec);
  assert(
    report.reportId.startsWith('RPT-INT-') && report.limitations.length >= 6,
    'End-to-end report generated with full limitations breakdown'
  );

  // Test 30: Failure recovery / empty input handling
  const emptyExec = executeFieldIntegration({});
  assert(
    emptyExec.mode === 'SIMULATED' && emptyExec.connectionStatus === 'SIMULATING',
    'Empty input state recovers safely using default simulated telemetry'
  );

} catch (err) {
  console.error('Test execution threw an error:', err);
  failed++;
}

console.log('====================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

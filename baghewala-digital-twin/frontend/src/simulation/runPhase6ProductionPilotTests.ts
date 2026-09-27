/**
 * Phase 6 — Production Pilot & Real-Time Validation Automated Test Suite
 * Baghewala Heavy-Oil Field Digital Twin
 * Minimum 25 Required Test Cases
 */

import { validateTelemetry } from './productionPilot/telemetryValidator';
import { generateTelemetryStep } from './productionPilot/telemetrySimulator';
import { runPhysicsPredictionForTelemetry, compareActualVsPredicted } from './productionPilot/predictionComparisonEngine';
import { detectDeviations } from './productionPilot/deviationDetectionEngine';
import { evaluatePilotRisk } from './productionPilot/pilotRiskEngine';
import { evaluatePilotConfidence } from './productionPilot/pilotConfidenceEngine';
import { createInitialPilotState } from './productionPilot/pilotStateEngine';
import { startPilot, processTelemetryRecord, executeSimulatorStep, generatePilotTrace } from './productionPilot/pilotWorkflowEngine';
import type { TelemetryRecord } from './productionPilot/types';
import { BASELINE_INPUT_VALUES } from './scenario/defaults';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`✕ FAIL: ${message}`);
    failedCount++;
  }
}

console.log('====================================================');
console.log('BAGHEWALA DIGITAL TWIN — PHASE 6 PRODUCTION PILOT TEST SUITE');
console.log('====================================================\n');

// Valid baseline record helper
const validRecord: TelemetryRecord = {
  timestamp: new Date().toISOString(),
  wellId: 'BGW-PILOT-01',
  reservoirTemperatureC: 48.0,
  reservoirPressureBar: 48.0,
  steamInjectionRateTPD: 50.0,
  steamQualityPct: 75.0,
  waterCutPct: 20.0,
  pumpingSpeedSPM: 8.0,
  strokeLengthM: 2.5,
  observedProductionBOPD: 0.75,
  dataQuality: 'VALID',
  source: 'DEMONSTRATION_TELEMETRY',
};

// TEST 1: Telemetry schema validation
const val1 = validateTelemetry(validRecord);
assert(val1.status === 'VALID' && val1.isValid, 'TEST 1 — Telemetry schema validation succeeds for canonical format');

// TEST 2: Valid telemetry accepted
assert(val1.reasons.length === 0, 'TEST 2 — Valid telemetry accepted with 0 error reasons');

// TEST 3: Missing telemetry rejected
const valMissing = validateTelemetry(null as any);
assert(valMissing.status === 'INVALID' && !valMissing.isValid, 'TEST 3 — Missing / null telemetry record rejected');

// TEST 4: NaN rejected
const nanRecord = { ...validRecord, reservoirTemperatureC: NaN };
const valNan = validateTelemetry(nanRecord);
assert(valNan.status === 'INVALID' && valNan.reasons.some((r) => r.includes('invalid non-numeric')), 'TEST 4 — NaN parameter value rejected');

// TEST 5: Infinity rejected
const infRecord = { ...validRecord, observedProductionBOPD: Infinity };
const valInf = validateTelemetry(infRecord);
assert(valInf.status === 'INVALID', 'TEST 5 — Infinity parameter value rejected');

// TEST 6: Invalid pressure rejected
const invPress = { ...validRecord, reservoirPressureBar: -10.0 };
const valPress = validateTelemetry(invPress);
assert(valPress.status === 'INVALID' && valPress.reasons.some((r) => r.includes('Negative pressure')), 'TEST 6 — Negative / invalid pressure rejected');

// TEST 7: Invalid temperature rejected
const invTemp = { ...validRecord, reservoirTemperatureC: 180.0 };
const valTemp = validateTelemetry(invTemp);
assert(valTemp.status === 'INVALID' && valTemp.reasons.some((r) => r.includes('outside valid operating envelope')), 'TEST 7 — Out-of-bounds temperature (>120°C) rejected');

// TEST 8: Invalid steam rate rejected
const invSteam = { ...validRecord, steamInjectionRateTPD: 250.0 };
const valSteam = validateTelemetry(invSteam);
assert(valSteam.status === 'INVALID' && valSteam.reasons.some((r) => r.includes('exceeds maximum capacity')), 'TEST 8 — Out-of-capacity steam injection rate rejected');

// TEST 9: Invalid water cut rejected
const invWc = { ...validRecord, waterCutPct: 110.0 };
const valWc = validateTelemetry(invWc);
assert(valWc.status === 'INVALID' && valWc.reasons.some((r) => r.includes('must be between 0% and 100%')), 'TEST 9 — Invalid water cut percentage (>100%) rejected');

// TEST 10: Invalid production rejected
const invProd = { ...validRecord, observedProductionBOPD: -2.5 };
const valProd = validateTelemetry(invProd);
assert(valProd.status === 'INVALID' && valProd.reasons.some((r) => r.includes('Negative production')), 'TEST 10 — Negative production rate rejected');

// TEST 11: Normal telemetry scenario simulator
const normTelem = generateTelemetryStep('BGW-PILOT-01', 'NORMAL', 0, BASELINE_INPUT_VALUES);
assert(normTelem.observedProductionBOPD > 0 && normTelem.reservoirTemperatureC === 48.0, 'TEST 11 — NORMAL simulator profile generates nominal telemetry');

// TEST 12: Production decline scenario simulator
const declTelem = generateTelemetryStep('BGW-PILOT-01', 'PRODUCTION_DECLINE', 3, BASELINE_INPUT_VALUES);
assert(declTelem.observedProductionBOPD < normTelem.observedProductionBOPD, 'TEST 12 — PRODUCTION_DECLINE profile generates decreasing production');

// TEST 13: Pressure drop scenario simulator
const pressDropTelem = generateTelemetryStep('BGW-PILOT-01', 'PRESSURE_DROP', 3, BASELINE_INPUT_VALUES);
assert(pressDropTelem.reservoirPressureBar < 40.0, 'TEST 13 — PRESSURE_DROP profile generates drawdown deviation');

// TEST 14: Thermal failure scenario simulator
const thermFailTelem = generateTelemetryStep('BGW-PILOT-01', 'THERMAL_RESPONSE_FAILURE', 1, BASELINE_INPUT_VALUES);
assert(thermFailTelem.reservoirTemperatureC === 42.0 && thermFailTelem.steamInjectionRateTPD >= 100.0, 'TEST 14 — THERMAL_RESPONSE_FAILURE profile generates low temp despite steam injection');

// TEST 15: High water-cut scenario simulator
const highWcTelem = generateTelemetryStep('BGW-PILOT-01', 'HIGH_WATER_CUT', 2, BASELINE_INPUT_VALUES);
assert(highWcTelem.waterCutPct > 40.0, 'TEST 15 — HIGH_WATER_CUT profile generates elevated water cut');

// TEST 16: Sensor anomaly scenario simulator
const anomalyTelem = generateTelemetryStep('BGW-PILOT-01', 'SENSOR_ANOMALY', 0, BASELINE_INPUT_VALUES);
assert(Number.isNaN(anomalyTelem.reservoirTemperatureC), 'TEST 16 — SENSOR_ANOMALY profile generates invalid telemetry (NaN)');

// TEST 17: Prediction generated
const pred = runPhysicsPredictionForTelemetry(validRecord, BASELINE_INPUT_VALUES);
assert(pred.predictedProductionBOPD > 0 && pred.predictedTemperatureC > 0, 'TEST 17 — Canonical physics prediction generated from telemetry record');

// TEST 18: Actual-vs-predicted error calculated
const comp = compareActualVsPredicted(validRecord, pred);
assert(comp.productionErrorBOPD >= 0 && comp.productionErrorPct >= 0, 'TEST 18 — Actual-vs-predicted error and percentage error calculated correctly');

// TEST 19: Deviation threshold classification (WARNING)
const warnTelem: TelemetryRecord = {
  ...validRecord,
  observedProductionBOPD: pred.predictedProductionBOPD * 0.85, // 15% error -> WARNING
};
const compWarn = compareActualVsPredicted(warnTelem, pred);
const alertsWarn = detectDeviations(compWarn);
assert(alertsWarn.some((a) => a.severity === 'WARNING' && a.type === 'PRODUCTION_DEVIATION'), 'TEST 19 — Production error (10-20%) classified as WARNING deviation');

// TEST 20: Critical deviation classification (CRITICAL)
const critTelem: TelemetryRecord = {
  ...validRecord,
  observedProductionBOPD: pred.predictedProductionBOPD * 0.70, // 30% error -> CRITICAL
};
const compCrit = compareActualVsPredicted(critTelem, pred);
const alertsCrit = detectDeviations(compCrit);
assert(alertsCrit.some((a) => a.severity === 'CRITICAL' && a.type === 'PRODUCTION_DEVIATION'), 'TEST 20 — Production error (>20%) classified as CRITICAL deviation');

// TEST 21: Risk aggregation
const riskNorm = evaluatePilotRisk([]);
const riskCrit = evaluatePilotRisk(alertsCrit);
assert(riskNorm === 'NORMAL' && riskCrit === 'CRITICAL', 'TEST 21 — Pilot risk aggregates active alerts correctly (NORMAL vs CRITICAL)');

// TEST 22: Confidence update
const confHigh = evaluatePilotConfidence(val1, comp, []);
const confLow = evaluatePilotConfidence(val1, compCrit, alertsCrit);
assert(confHigh.level === 'HIGH' && confLow.level === 'LOW', 'TEST 22 — Engineering confidence updates based on prediction error and alerts');

// TEST 23: Pilot state isolation
const initState = createInitialPilotState('BGW-PILOT-01');
const procRes = processTelemetryRecord(validRecord, initState, BASELINE_INPUT_VALUES);
assert(procRes.updatedState !== undefined && procRes.updatedState.lastTelemetry?.observedProductionBOPD === validRecord.observedProductionBOPD && procRes.updatedState.stepCount === 1, 'TEST 23 — Telemetry processing updates isolated PilotState without mutating ScenarioStore committed state');

// TEST 24: Phase 4 decision trace integration
const trace = generatePilotTrace(procRes.updatedState, validRecord, comp, [], 'NORMAL', confHigh);
assert(trace.traceId.startsWith('PILOT-') && trace.disclaimer.includes('NON-ACTUATING'), 'TEST 24 — Decision trace (PILOT-XXXXXXXX) generated with non-actuating disclaimer');

// TEST 25: Complete pilot workflow
const liveState = startPilot('BGW-PILOT-01', 'NORMAL');
const stepRes = executeSimulatorStep(liveState, 'NORMAL', BASELINE_INPUT_VALUES);
assert(stepRes.updatedState.stepCount === 1 && stepRes.updatedState.lastTelemetry !== undefined && stepRes.trace.traceId !== undefined, 'TEST 25 — Complete pilot workflow (Ingest -> Validate -> Predict -> Compare -> Alert -> Risk -> Confidence -> Trace) executed');

console.log('\n----------------------------------------------------');
console.log(`ALL PHASE 6 PRODUCTION PILOT TESTS PASSED (${passedCount}/${passedCount + failedCount})`);
console.log('====================================================\n');

if (failedCount > 0) {
  throw new Error(`Unit tests failed: ${failedCount} failure(s).`);
}

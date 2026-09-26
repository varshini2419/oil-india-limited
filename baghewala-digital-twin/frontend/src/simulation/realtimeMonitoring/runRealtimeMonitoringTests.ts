import { estimateDigitalTwinState } from './stateEstimator';
import { TelemetrySimulator } from './telemetrySimulator';
import { evaluateAlerts } from './alertEngine';
import { runWhatIfSimulation } from './whatIfEngine';
import { createMonitoringSession, pushMonitoringState } from './monitoringEngine';

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

console.log('===================================================');
console.log('RUNNING STEP 5.5 — REAL-TIME MONITORING & WHAT-IF TESTS');
console.log('===================================================');

let passCount = 0;

// 1. Default telemetry state
const defaultState = estimateDigitalTwinState();
assert(defaultState.reservoir.reservoirTemperatureC > 0, 'TEST 1: Default telemetry state initialized');
passCount++;

// 2. Telemetry simulator start
const sim = new TelemetrySimulator({ seed: 42 });
sim.start();
assert(sim.getSimulatorState() === 'RUNNING', 'TEST 2: Telemetry simulator start');
passCount++;

// 3. Telemetry simulator pause
sim.pause();
assert(sim.getSimulatorState() === 'PAUSED', 'TEST 3: Telemetry simulator pause');
passCount++;

// 4. Telemetry simulator reset
sim.reset();
assert(sim.getSimulatorState() === 'STOPPED', 'TEST 4: Telemetry simulator reset');
passCount++;

// 5. Deterministic telemetry sequence
const simA = new TelemetrySimulator({ seed: 100 });
const simB = new TelemetrySimulator({ seed: 100 });
const stepA = simA.stepForward();
const stepB = simB.stepForward();
assert(
  stepA.reservoir.reservoirTemperatureC === stepB.reservoir.reservoirTemperatureC,
  'TEST 5: Deterministic telemetry sequence (same seed produces identical outputs)'
);
passCount++;

// 6. Temperature update
const heatedState = estimateDigitalTwinState({ reservoirTemperatureC: 75.0 });
const coolState = estimateDigitalTwinState({ reservoirTemperatureC: 48.0 });
assert(
  heatedState.reservoir.reservoirTemperatureC > coolState.reservoir.reservoirTemperatureC,
  'TEST 6: Temperature update propagated'
);
passCount++;

// 7. Viscosity propagation
assert(
  coolState.reservoir.estimatedViscosityCp > heatedState.reservoir.estimatedViscosityCp,
  'TEST 7: Viscosity responds inversely to temperature (cool viscosity > heated viscosity)'
);
passCount++;

// 8. Mobility propagation
assert(
  heatedState.reservoir.oilMobilityDcP > coolState.reservoir.oilMobilityDcP,
  'TEST 8: Oil mobility responds directly to viscosity reduction'
);
passCount++;

// 9. Production propagation
assert(
  heatedState.production.estimatedProductionBopd > coolState.production.estimatedProductionBopd,
  'TEST 9: Production rate responds to mobility increase'
);
passCount++;

// 10. SRP state propagation
const highSpeedState = estimateDigitalTwinState({ vfdFrequencyHz: 60.0, spm: 12.0 });
assert(
  highSpeedState.srp.srpLoadIndex > defaultState.srp.srpLoadIndex,
  'TEST 10: SRP load index increases with higher SPM and VFD frequency'
);
passCount++;

// 11. CSS state propagation
const cssState = estimateDigitalTwinState({ steamInjectionRateTpd: 120.0 });
assert(
  cssState.css.steamInjectionRateTpd === 120.0 && cssState.css.thermalGainC > 0,
  'TEST 11: CSS steam injection rate and thermal gain propagated correctly'
);
passCount++;

// 12. Risk propagation
assert(
  Boolean(highSpeedState.risk.riskLevel) && typeof highSpeedState.risk.riskScore === 'number',
  'TEST 12: Risk Engine level and score computed and propagated'
);
passCount++;

// 13. What-if temperature
const whatIfTemp = runWhatIfSimulation(defaultState, { reservoirTemperatureC: 85.0 });
assert(
  whatIfTemp.isFeasible && whatIfTemp.deltas.reservoirTemperatureC > 0,
  'TEST 13: What-if temperature modification computes positive temperature delta'
);
passCount++;

// 14. What-if steam rate
const whatIfSteam = runWhatIfSimulation(defaultState, { steamInjectionRateTpd: 150.0 });
assert(
  whatIfSteam.isFeasible && whatIfSteam.deltas.thermalGainC > 0,
  'TEST 14: What-if steam rate modification computes positive thermal gain delta'
);
passCount++;

// 15. What-if VFD
const whatIfVfd = runWhatIfSimulation(defaultState, { vfdFrequencyHz: 55.0 });
assert(
  whatIfVfd.isFeasible && whatIfVfd.whatIfState.srp.vfdFrequencyHz === 55.0,
  'TEST 15: What-if VFD frequency modification computed successfully'
);
passCount++;

// 16. What-if SPM
const whatIfSpm = runWhatIfSimulation(defaultState, { spm: 11.0 });
assert(
  whatIfSpm.isFeasible && whatIfSpm.whatIfState.srp.spm === 11.0,
  'TEST 16: What-if SPM speed modification computed successfully'
);
passCount++;

// 17. What-if stroke
const whatIfStroke = runWhatIfSimulation(defaultState, { strokeLengthMeters: 3.5 });
assert(
  whatIfStroke.isFeasible && whatIfStroke.whatIfState.srp.strokeLengthMeters === 3.5,
  'TEST 17: What-if stroke length modification computed successfully'
);
passCount++;

// 18. What-if drawdown
const whatIfDrawdown = runWhatIfSimulation(defaultState, { effectiveDrawdownBar: 45.0 });
assert(whatIfDrawdown.isFeasible, 'TEST 18: What-if drawdown pressure modification computed successfully');
passCount++;

// 19. Invalid temperature
const invalidTemp = runWhatIfSimulation(defaultState, { reservoirTemperatureC: 250.0 });
assert(
  !invalidTemp.isFeasible && Boolean(invalidTemp.validationMessage?.includes('OUT OF MODEL RANGE')),
  'TEST 19: Unphysical temperature (>150°C) rejected with OUT OF MODEL RANGE'
);
passCount++;

// 20. Invalid steam rate
const invalidSteam = runWhatIfSimulation(defaultState, { steamInjectionRateTpd: -50.0 });
assert(!invalidSteam.isFeasible, 'TEST 20: Negative steam injection rate rejected');
passCount++;

// 21. Invalid VFD
const invalidVfd = runWhatIfSimulation(defaultState, { vfdFrequencyHz: 90.0 });
assert(!invalidVfd.isFeasible, 'TEST 21: Out-of-range VFD frequency (>65 Hz) rejected');
passCount++;

// 22. Invalid SPM
const invalidSpm = runWhatIfSimulation(defaultState, { spm: 25.0 });
assert(!invalidSpm.isFeasible, 'TEST 22: Out-of-range SPM (>15 SPM) rejected');
passCount++;

// 23. Invalid stroke
const invalidStroke = runWhatIfSimulation(defaultState, { strokeLengthMeters: 0.2 });
assert(!invalidStroke.isFeasible, 'TEST 23: Out-of-range stroke length (<1.0m) rejected');
passCount++;

// 24. Alert generation
const highViscState = estimateDigitalTwinState({ reservoirTemperatureC: 35.0 });
const alertsVisc = evaluateAlerts(highViscState);
assert(
  alertsVisc.alerts.some((a) => a.condition.includes('Viscosity')),
  'TEST 24: Alert generated for high crude viscosity'
);
passCount++;

// 25. Critical alert generation
const criticalSrpState = estimateDigitalTwinState({ vfdFrequencyHz: 65.0, spm: 14.0, strokeLengthMeters: 4.2 });
const alertsSrp = evaluateAlerts(criticalSrpState);
assert(
  alertsSrp.alerts.some((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH'),
  'TEST 25: Critical/High alert generated for elevated SRP mechanical load'
);
passCount++;

// 26. Uncertainty propagation
assert(
  whatIfTemp.uncertainty.isAvailable && whatIfTemp.uncertainty.p50ProductionBopd > 0,
  'TEST 26: Monte Carlo P10/P50/P90 uncertainty propagated to what-if simulation'
);
passCount++;

// 27. Baseline/calibrated mode
const calibState = estimateDigitalTwinState({}, 'CALIBRATED');
const baseState = estimateDigitalTwinState({}, 'BASELINE');
assert(
  calibState.metadata.modelMode === 'CALIBRATED' && baseState.metadata.modelMode === 'BASELINE',
  'TEST 27: Baseline vs Calibrated model mode correctly identified in metadata'
);
passCount++;

// 28. Deterministic output
const res1 = runWhatIfSimulation(defaultState, { reservoirTemperatureC: 70.0 });
const res2 = runWhatIfSimulation(defaultState, { reservoirTemperatureC: 70.0 });
assert(
  res1.deltas.estimatedProductionBopd === res2.deltas.estimatedProductionBopd,
  'TEST 28: What-if simulation runs deterministically'
);
passCount++;

// 29. State immutability
const initialTemp = defaultState.reservoir.reservoirTemperatureC;
runWhatIfSimulation(defaultState, { reservoirTemperatureC: 90.0 });
assert(
  defaultState.reservoir.reservoirTemperatureC === initialTemp,
  'TEST 29: What-if calculation preserves current state immutability'
);
passCount++;

// 30. Full pipeline integration
const session = createMonitoringSession(defaultState);
const updatedSession = pushMonitoringState(session, heatedState);
assert(
  updatedSession.history.length === 2 && updatedSession.eventTimeline.length > 0,
  'TEST 30: Full pipeline integration executed seamlessly in monitoring session'
);
passCount++;

sim.destroy();
simA.destroy();
simB.destroy();

console.log('===================================================');
console.log(`TEST SUMMARY: ${passCount} Passed, 0 Failed`);
console.log('===================================================');

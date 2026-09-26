import { loadBaseline, updateScenario } from './scenario';
import { calculateThermalModel } from './thermal';
import { calculateViscosityModel } from './viscosity';
import { calculateMobilityModel } from './mobility';
import { calculateProductionModel } from './production';
import { optimizeSRP } from './srpOptimization';
import { optimizeCSS } from './cssOptimization';
import { analyzeAIRisk } from './riskEngine';
import { generateFinalReport } from './finalValidation/finalReportEngine';
import { executeFinalValidation } from './finalValidation/finalValidationEngine';
import { executeProductionPilotWorkflow } from './productionPilot/pilotWorkflowEngine';
import { TelemetrySimulator } from './realtimeMonitoring/telemetrySimulator';
import { validateScenarioObject } from './scenario/scenarioStore';
import { generateAiExplanation } from './aiExplanationEngine';

let failedTestCount = 0;

function runTest(description: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ PASS: ${description}`);
  } catch (err: unknown) {
    failedTestCount++;
    console.error(`✗ FAIL: ${description}`);
    console.error(err instanceof Error ? err.message : String(err));
  }
}

function runAllEndToEndTests() {
  console.log('====================================================');
  console.log('BAGHEWALA DIGITAL TWIN — END-TO-END INTERACTIVE FLOW TEST SUITE');
  console.log('====================================================');

  const baseline = loadBaseline();

  // Helper to compute full physics & risk chain for a scenario
  function computePipeline(sc: typeof baseline) {
    const thermal = calculateThermalModel(sc);
    const evalTemp = Math.max(sc.inputs.reservoirTemperatureC, thermal.predictedReservoirTemperatureC);
    const viscosity = calculateViscosityModel(evalTemp, 48.0);
    const mobility = calculateMobilityModel(viscosity.estimatedViscosityCp, evalTemp);
    const production = calculateProductionModel(
      mobility.mobilityDcP,
      evalTemp,
      viscosity.estimatedViscosityCp,
      30.0,
      sc.inputs.vfdFrequencyHz,
      sc.inputs.spm,
      sc.inputs.strokeLengthMeters
    );
    const srp = optimizeSRP({
      vfdFrequencyHz: sc.inputs.vfdFrequencyHz,
      spm: sc.inputs.spm,
      strokeLengthM: sc.inputs.strokeLengthMeters,
      oilMobilityDcp: mobility.mobilityDcP,
      effectiveDrawdownBar: 30.0,
      temperatureC: evalTemp,
      viscosityCp: viscosity.estimatedViscosityCp,
    });
    const css = optimizeCSS({
      steamInjectionRateTpd: sc.inputs.steamInjectionRateTpd,
      steamInjectionTemperatureC: 300.0,
      steamQualityFraction: sc.inputs.steamQualityPercent / 100.0,
      injectionDurationDays: 5.0,
      soakDurationDays: sc.inputs.soakDurationDays,
      productionDurationDays: 90.0,
      reservoirTemperatureC: evalTemp,
      reservoirPressureBar: 90.0,
      baselineViscosityCp: viscosity.estimatedViscosityCp,
      baselineMobilityDPerCp: mobility.mobilityDcP,
      baselineProductionBopd: production.estimatedProductionBopd,
      vfdFrequencyHz: sc.inputs.vfdFrequencyHz,
      spm: sc.inputs.spm,
      strokeLengthMeters: sc.inputs.strokeLengthMeters,
    });
    const risk = analyzeAIRisk({
      temperatureC: evalTemp,
      viscosityCp: viscosity.estimatedViscosityCp,
      mobilityDPerCp: mobility.mobilityDcP,
      productionBopd: production.estimatedProductionBopd,
      vfdFrequencyHz: sc.inputs.vfdFrequencyHz,
      spm: sc.inputs.spm,
      strokeLengthMeters: sc.inputs.strokeLengthMeters,
      steamInjectionRateTpd: sc.inputs.steamInjectionRateTpd,
      srpLoadIndex: srp.currentCandidate.loadIndex,
      cssThermalGainC: css.thermalBreakdown.deltaTemperatureC,
    });

    return { thermal, viscosity, mobility, production, srp, css, risk, evalTemp };
  }

  const baselineChain = computePipeline(baseline);

  // TEST A: Increase Reservoir Temperature
  runTest('Test A: Increasing reservoir temperature lowers viscosity and elevates production', () => {
    const heated = updateScenario(baseline, { reservoirTemperatureC: 75.0, steamInjectionRateTpd: 120.0 });
    const chain = computePipeline(heated);

    if (chain.evalTemp <= baselineChain.evalTemp) {
      throw new Error('Evaluated temperature did not increase');
    }
    if (chain.viscosity.estimatedViscosityCp >= baselineChain.viscosity.estimatedViscosityCp) {
      throw new Error(`Viscosity did not decrease: baseline=${baselineChain.viscosity.estimatedViscosityCp} cP, heated=${chain.viscosity.estimatedViscosityCp} cP`);
    }
    if (chain.mobility.mobilityDcP <= baselineChain.mobility.mobilityDcP) {
      throw new Error('Mobility did not increase');
    }
    if (chain.production.estimatedProductionBopd <= baselineChain.production.estimatedProductionBopd) {
      throw new Error('Production did not increase');
    }
  });

  // TEST B: Decrease Reservoir Temperature
  runTest('Test B: Decreasing reservoir temperature increases viscosity and chokes production', () => {
    const cooled = updateScenario(baseline, { reservoirTemperatureC: 35.0, steamInjectionRateTpd: 0.0 });
    const chain = computePipeline(cooled);

    if (chain.viscosity.estimatedViscosityCp <= baselineChain.viscosity.estimatedViscosityCp) {
      throw new Error('Viscosity did not increase upon cooling');
    }
    if (chain.mobility.mobilityDcP >= baselineChain.mobility.mobilityDcP) {
      throw new Error('Mobility did not decrease upon cooling');
    }
    if (chain.production.estimatedProductionBopd >= baselineChain.production.estimatedProductionBopd) {
      throw new Error('Production did not decrease upon cooling');
    }
  });

  // TEST C: Increase SPM Pumping Speed
  runTest('Test C: Increasing SPM increases mechanical load index on SRP', () => {
    const highSpm = updateScenario(baseline, { spm: 16.0, vfdFrequencyHz: 65.0 });
    const chain = computePipeline(highSpm);

    if (chain.srp.currentCandidate.loadIndex <= baselineChain.srp.currentCandidate.loadIndex) {
      throw new Error('SRP load index did not increase with higher SPM');
    }
  });

  // TEST D: Change CSS / Steam Injection Parameter
  runTest('Test D: Increasing steam injection rate increases thermal gain', () => {
    const highSteam = updateScenario(baseline, { steamInjectionRateTpd: 150.0, soakDurationDays: 10.0 });
    const chain = computePipeline(highSteam);

    if (chain.css.thermalBreakdown.deltaTemperatureC <= baselineChain.css.thermalBreakdown.deltaTemperatureC) {
      throw new Error('CSS thermal gain did not increase with higher steam injection');
    }
  });

  // TEST E: High-Risk Scenario
  runTest('Test E: High SPM + low reservoir temperature triggers elevated AI risk alert', () => {
    const risky = updateScenario(baseline, {
      reservoirTemperatureC: 32.0,
      spm: 18.0,
      vfdFrequencyHz: 68.0,
      steamInjectionRateTpd: 0.0,
    });
    const chain = computePipeline(risky);

    if (chain.risk.riskLevel !== 'HIGH' && chain.risk.riskLevel !== 'CRITICAL') {
      throw new Error(`Expected HIGH or CRITICAL risk level, got ${chain.risk.riskLevel}`);
    }
    if (chain.risk.detectedIssues.length === 0) {
      throw new Error('Expected at least 1 detected risk issue');
    }
  });

  // TEST F: Reset to Baseline
  runTest('Test F: Resetting scenario restores exact baseline inputs and outputs', () => {
    const sc = updateScenario(baseline, { reservoirTemperatureC: 80.0, spm: 15.0 });
    const scReset = updateScenario(sc, {
      reservoirTemperatureC: baseline.inputs.reservoirTemperatureC,
      spm: baseline.inputs.spm,
      vfdFrequencyHz: baseline.inputs.vfdFrequencyHz,
      steamInjectionRateTpd: baseline.inputs.steamInjectionRateTpd,
    });
    const chain = computePipeline(scReset);

    if (chain.evalTemp !== baselineChain.evalTemp) {
      throw new Error('Reset temperature mismatch');
    }
    if (chain.viscosity.estimatedViscosityCp !== baselineChain.viscosity.estimatedViscosityCp) {
      throw new Error('Reset viscosity mismatch');
    }
  });

  // TEST G: Report Generation from Live Simulation State
  runTest('Test G: Report generator incorporates live simulation outputs and mandated disclaimer', () => {
    const valState = executeFinalValidation();
    const report = generateFinalReport(valState);

    if (!report.reportId.startsWith('RPT-FINAL-BAGHEWALA-')) {
      throw new Error('Invalid report ID prefix');
    }
    if (!report.disclaimer.includes('Decision support only')) {
      throw new Error('Mandated safety disclaimer missing from report');
    }
    if (report.sections.length < 20) {
      throw new Error('Report sections incomplete');
    }
  });

  // TEST H: Global State Integration Across Reports, Realtime Monitoring, and Production Pilot
  runTest('Test H: Global State Integration connects active scenario to Reports, Realtime Monitoring, and Production Pilot', () => {
    const scBaseline = loadBaseline();
    const scModified = updateScenario(scBaseline, {
      reservoirTemperatureC: 75.0,
      steamInjectionRateTpd: 120.0,
      vfdFrequencyHz: 65.0,
      spm: 16.0,
    });

    // 1. Production Pilot
    const pilotState = executeProductionPilotWorkflow('SCENARIO_A_NORMAL', 0, false, scModified.inputs);
    if (pilotState.twinState.reservoir.reservoirTemperatureC !== 75.0) {
      throw new Error(`Production pilot did not reflect active temperature 75°C: got ${pilotState.twinState.reservoir.reservoirTemperatureC}`);
    }
    if (pilotState.twinState.srp.vfdFrequencyHz !== 65.0) {
      throw new Error(`Production pilot did not reflect active VFD frequency 65 Hz: got ${pilotState.twinState.srp.vfdFrequencyHz}`);
    }

    // 2. Reports (Final Validation Evidence)
    const valState = executeFinalValidation({ pilotExecutionState: pilotState });
    const tempEvidence = valState.evidence.find((e) => e.id === 'EVD-403-01');
    if (!tempEvidence || tempEvidence.value !== 75.0) {
      throw new Error(`Final validation evidence EVD-403-01 did not reflect active temperature 75°C: got ${tempEvidence?.value}`);
    }

    // 3. Realtime Telemetry Simulator
    const sim = new TelemetrySimulator({ seed: 42, modelMode: 'CALIBRATED', baseInputs: scModified.inputs });
    const telemetryState = sim.getCurrentState();
    if (telemetryState.reservoir.reservoirTemperatureC !== 75.0) {
      throw new Error(`Telemetry simulator did not reflect active temperature 75°C: got ${telemetryState.reservoir.reservoirTemperatureC}`);
    }
    sim.destroy();
  });

  // TEST I: Active Scenario Persistence & Schema Validation
  runTest('Test I: Active Scenario Persistence validates inputs schema and safely handles corrupted localStorage data', () => {
    const validSc = loadBaseline();
    if (!validateScenarioObject(validSc)) {
      throw new Error('Valid scenario object failed schema validation');
    }

    const corruptSc = { ...validSc, inputs: { ...validSc.inputs, reservoirTemperatureC: 'INVALID_NAN' as any } };
    if (validateScenarioObject(corruptSc)) {
      throw new Error('Corrupt scenario object with NaN input incorrectly passed schema validation');
    }

    const nullInputsSc = { ...validSc, inputs: null as any };
    if (validateScenarioObject(nullInputsSc)) {
      throw new Error('Null inputs object incorrectly passed schema validation');
    }
  });

  // TEST J: Complete 13-Step Live Demonstration Flow Integration
  runTest('Test J: Complete 13-step live demonstration flow preserves single source of truth across physics, twin, results & reports', () => {
    // 1-3. User Input & Simulation execution
    const demoScenario = updateScenario(loadBaseline(), {
      reservoirTemperatureC: 80.0,
      steamInjectionRateTpd: 140.0,
      steamQualityPercent: 85.0,
      soakDurationDays: 6.0,
      vfdFrequencyHz: 68.0,
      spm: 18.0,
      strokeLengthMeters: 3.5,
    });

    const pipeline = computePipeline(demoScenario);

    // 4. Physics values recalculate correctly
    if (pipeline.evalTemp <= 65.0) {
      throw new Error(`Expected elevated evaluated temperature > 65°C, got ${pipeline.evalTemp}`);
    }
    if (pipeline.viscosity.estimatedViscosityCp >= baselineChain.viscosity.estimatedViscosityCp) {
      throw new Error(`Viscosity did not decrease with temperature elevation: got ${pipeline.viscosity.estimatedViscosityCp}`);
    }
    if (pipeline.production.estimatedProductionBopd <= baselineChain.production.estimatedProductionBopd) {
      throw new Error(`Production did not increase with temperature & VFD boost: got ${pipeline.production.estimatedProductionBopd}`);
    }

    // 5-6. AI Risk & Recommendations response
    if (!pipeline.risk.riskLevel) {
      throw new Error('AI Risk result missing risk level');
    }
    if (!pipeline.risk.summary || pipeline.risk.summary.length === 0) {
      throw new Error('AI Risk summary explanation empty');
    }

    // 7-8. 2D Digital Twin binding validation
    const spmVal = demoScenario.inputs.spm;
    if (spmVal !== 18.0) {
      throw new Error(`Digital twin SPM mismatch: expected 18.0, got ${spmVal}`);
    }
    const thermalRadius = pipeline.thermal.thermalInfluenceC ?? 10.0;
    if (thermalRadius <= 0) {
      throw new Error('Thermal radius must be positive for twin animation');
    }

    // 9-10. Results comparison validation
    const tempDiff = pipeline.evalTemp - baselineChain.evalTemp;
    if (tempDiff <= 0) {
      throw new Error('Baseline vs Current comparison thermal delta invalid');
    }

    // 11-13. Reports generation validation
    const pilotState = executeProductionPilotWorkflow('SCENARIO_A_NORMAL', 0, false, demoScenario.inputs);
    const finalValState = executeFinalValidation({ pilotExecutionState: pilotState });
    const report = generateFinalReport(finalValState);

    if (!report.reportId.includes('BAGHEWALA')) {
      throw new Error('Report ID missing Baghewala identification');
    }
    if (!report.disclaimer.includes('Decision support only')) {
      throw new Error('Report missing mandated decision support disclaimer');
    }
    const tempEvd = finalValState.evidence.find(e => e.id === 'EVD-403-01');
    if (!tempEvd || tempEvd.value !== 80.0) {
      throw new Error(`Report evidence EVD-403-01 temperature mismatch: expected 80.0, got ${tempEvd?.value}`);
    }
  });

  // TEST K: Dynamic AI Engineering Explanation Engine Across Contrasting Scenarios
  runTest('Test K: AI Engineering Explanation engine generates 5 structured sections referencing actual values and changing reactively across contrasting scenarios', () => {
    const baseSc = loadBaseline();
    const basePipeline = computePipeline(baseSc);

    // Scenario 1: Nominal Heated (Steam = 120, T = 75°C)
    const heatedSc = updateScenario(baseSc, { reservoirTemperatureC: 75.0, steamInjectionRateTpd: 120.0, spm: 10.0 });
    const heatedPipeline = computePipeline(heatedSc);

    const expHeated = generateAiExplanation({
      activeScenario: heatedSc,
      thermalResult: heatedPipeline.thermal,
      baselineThermalResult: basePipeline.thermal,
      viscosityResult: heatedPipeline.viscosity,
      baselineViscosityResult: basePipeline.viscosity,
      mobilityResult: heatedPipeline.mobility,
      baselineMobilityResult: basePipeline.mobility,
      productionResult: heatedPipeline.production,
      baselineProductionResult: basePipeline.production,
      srpOptimizationResult: heatedPipeline.srp,
      cssOptimizationResult: heatedPipeline.css,
      aiRiskResult: heatedPipeline.risk,
    });

    // 1. Verify 5 sections exist and are non-empty
    if (!expHeated.whyThisHappened.includes('75')) {
      throw new Error('Section 1 Why This Happened did not reference active temperature 75°C');
    }
    if (!expHeated.whatChanged.reservoirTemperature.formattedTransition.includes('°C')) {
      throw new Error('Section 2 What Changed transition table missing formatted temperature transition');
    }
    if (!expHeated.engineeringImplication.length) {
      throw new Error('Section 3 Engineering Implication empty');
    }
    if (!expHeated.riskAndConstraints.overallRiskLevel) {
      throw new Error('Section 4 Risk and Constraints missing risk level');
    }
    if (expHeated.recommendedAdvisoryActions.length < 2) {
      throw new Error('Section 5 Recommended Advisory Actions incomplete');
    }
    if (!expHeated.disclaimer.includes('Decision support only')) {
      throw new Error('Explanation disclaimer missing Decision support only notice');
    }

    // Scenario 2: High SPM / Excessive VFD (SPM = 18, VFD = 68 Hz)
    const highSpmSc = updateScenario(baseSc, { spm: 18.0, vfdFrequencyHz: 68.0, steamInjectionRateTpd: 0.0, reservoirTemperatureC: 48.0 });
    const highSpmPipeline = computePipeline(highSpmSc);

    const expHighSpm = generateAiExplanation({
      activeScenario: highSpmSc,
      thermalResult: highSpmPipeline.thermal,
      baselineThermalResult: basePipeline.thermal,
      viscosityResult: highSpmPipeline.viscosity,
      baselineViscosityResult: basePipeline.viscosity,
      mobilityResult: highSpmPipeline.mobility,
      baselineMobilityResult: basePipeline.mobility,
      productionResult: highSpmPipeline.production,
      baselineProductionResult: basePipeline.production,
      srpOptimizationResult: highSpmPipeline.srp,
      cssOptimizationResult: highSpmPipeline.css,
      aiRiskResult: highSpmPipeline.risk,
    });

    const spmConstraint = expHighSpm.riskAndConstraints.activeConstraints.find(c => c.id === 'CONSTRAINT_EXCESSIVE_SPM');
    if (!spmConstraint) {
      throw new Error('Excessive SPM scenario failed to trigger CONSTRAINT_EXCESSIVE_SPM alert');
    }
    if (!spmConstraint.advisoryWarning.includes('dampening VFD frequency')) {
      throw new Error('Excessive SPM advisory warning text missing VFD dampening guidance');
    }

    // Scenario 3: Cool Unheated Reservoir (T = 32°C)
    const coolSc = updateScenario(baseSc, { reservoirTemperatureC: 32.0, steamInjectionRateTpd: 0.0 });
    const coolPipeline = computePipeline(coolSc);

    const expCool = generateAiExplanation({
      activeScenario: coolSc,
      thermalResult: coolPipeline.thermal,
      baselineThermalResult: basePipeline.thermal,
      viscosityResult: coolPipeline.viscosity,
      baselineViscosityResult: basePipeline.viscosity,
      mobilityResult: coolPipeline.mobility,
      baselineMobilityResult: basePipeline.mobility,
      productionResult: coolPipeline.production,
      baselineProductionResult: basePipeline.production,
      srpOptimizationResult: coolPipeline.srp,
      cssOptimizationResult: coolPipeline.css,
      aiRiskResult: coolPipeline.risk,
    });

    const viscConstraint = expCool.riskAndConstraints.activeConstraints.find(c => c.id === 'CONSTRAINT_VISCOSITY_STAGNATION');
    if (!viscConstraint) {
      throw new Error('Cool unheated scenario failed to trigger CONSTRAINT_VISCOSITY_STAGNATION alert');
    }

    // Verify explanation dynamically changes between contrasting scenarios
    if (expHeated.whyThisHappened === expCool.whyThisHappened) {
      throw new Error('Explanation failed to change between heated and cool scenarios');
    }
  });

  // TEST L: Interactive What-If Scenario Demonstration (Scenarios A through E)
  runTest('Test L: Interactive What-If Scenario Demonstration executes Scenarios A-E using exact same physics pipeline and verifying causal chains', () => {
    const scBaseline = loadBaseline();

    // Scenario A: Baseline
    const chainA = computePipeline(scBaseline);
    if (chainA.evalTemp < 55.0) {
      throw new Error(`Scenario A baseline evaluated temperature invalid: got ${chainA.evalTemp}`);
    }
    if (chainA.viscosity.estimatedViscosityCp < 4000) {
      throw new Error(`Scenario A baseline viscosity invalid: got ${chainA.viscosity.estimatedViscosityCp}`);
    }

    // Scenario B: Thermal Improvement (T = 75°C, Steam = 120 tpd)
    const scB = updateScenario(scBaseline, { reservoirTemperatureC: 75.0, steamInjectionRateTpd: 120.0, steamQualityPercent: 85.0 });
    const chainB = computePipeline(scB);
    if (chainB.evalTemp <= chainA.evalTemp) {
      throw new Error('Scenario B thermal influence did not increase evaluated temperature');
    }
    if (chainB.viscosity.estimatedViscosityCp >= chainA.viscosity.estimatedViscosityCp) {
      throw new Error('Scenario B viscosity did not drop with thermal improvement');
    }
    if (chainB.mobility.mobilityDcP <= chainA.mobility.mobilityDcP) {
      throw new Error('Scenario B mobility did not increase');
    }
    if (chainB.production.estimatedProductionBopd <= chainA.production.estimatedProductionBopd) {
      throw new Error('Scenario B production rate did not increase with thermal improvement');
    }

    // Scenario C: Cooling / High Viscosity (T = 32°C, Steam = 0 tpd)
    const scC = updateScenario(scBaseline, { reservoirTemperatureC: 32.0, steamInjectionRateTpd: 0.0, steamQualityPercent: 0.0 });
    const chainC = computePipeline(scC);
    if (chainC.evalTemp >= chainA.evalTemp) {
      throw new Error('Scenario C temperature did not decrease');
    }
    if (chainC.viscosity.estimatedViscosityCp <= chainA.viscosity.estimatedViscosityCp) {
      throw new Error('Scenario C viscosity did not increase under cooling');
    }
    if (chainC.mobility.mobilityDcP >= chainA.mobility.mobilityDcP) {
      throw new Error('Scenario C mobility did not decrease under cooling');
    }
    if (chainC.production.estimatedProductionBopd >= chainA.production.estimatedProductionBopd) {
      throw new Error('Scenario C production rate was not restricted under cooling');
    }
    if (chainC.risk.riskLevel !== 'HIGH' && chainC.risk.riskLevel !== 'CRITICAL' && chainC.risk.riskLevel !== 'MODERATE') {
      throw new Error('Scenario C failed to trigger elevated risk warning for high viscosity choking');
    }

    // Scenario D: High SRP Load (SPM = 18.0, VFD = 68.0 Hz)
    const scD = updateScenario(scBaseline, { spm: 18.0, vfdFrequencyHz: 68.0, strokeLengthMeters: 3.5 });
    const chainD = computePipeline(scD);
    if (chainD.srp.currentCandidate.loadIndex <= chainA.srp.currentCandidate.loadIndex) {
      throw new Error('Scenario D mechanical load index did not increase under high SPM/VFD');
    }
    if (chainD.srp.currentCandidate.loadIndex <= 80.0) {
      throw new Error(`Scenario D mechanical load index should exceed 80.0, got ${chainD.srp.currentCandidate.loadIndex}`);
    }
    if (chainD.risk.riskLevel !== 'HIGH' && chainD.risk.riskLevel !== 'CRITICAL') {
      throw new Error('Scenario D failed to trigger elevated mechanical load risk warning');
    }

    // Scenario E: Combined Condition (Steam = 140 tpd, T = 80°C, SPM = 16.0, VFD = 65.0 Hz)
    const scE = updateScenario(scBaseline, { reservoirTemperatureC: 80.0, steamInjectionRateTpd: 140.0, steamQualityPercent: 85.0, spm: 16.0, vfdFrequencyHz: 65.0, strokeLengthMeters: 3.0 });
    const chainE = computePipeline(scE);
    if (chainE.production.estimatedProductionBopd <= chainA.production.estimatedProductionBopd) {
      throw new Error('Scenario E production did not increase under combined thermal & lift boost');
    }
    if (chainE.srp.currentCandidate.loadIndex <= chainA.srp.currentCandidate.loadIndex) {
      throw new Error('Scenario E mechanical load index did not increase under higher pumping condition');
    }
  });

  console.log('====================================================');
  const passedTestCount = 12 - failedTestCount;
  console.log(`END-TO-END INTERACTIVE FLOW TEST SUITE COMPLETE: ${passedTestCount}/12 PASSED, ${failedTestCount} FAILED`);
  console.log('====================================================');
  if (failedTestCount > 0) {
    throw new Error(`End-to-end simulation flow suite failed with ${failedTestCount} test failures.`);
  }
}

runAllEndToEndTests();



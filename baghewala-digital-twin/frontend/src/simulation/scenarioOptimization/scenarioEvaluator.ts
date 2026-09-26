import { createScenario } from '../scenario/scenarioEngine';
import { calculateThermalModel } from '../thermal/thermalModel';
import { calculateViscosityModel } from '../viscosity/viscosityModel';
import { calculateMobilityModel } from '../mobility/mobilityModel';
import { calculateProductionModel } from '../production/productionModel';
import { optimizeSRP } from '../srpOptimization/optimizationEngine';
import { optimizeCSS } from '../cssOptimization/optimizationEngine';
import { analyzeAIRisk } from '../riskEngine/recommendationEngine';
import { runUncertaintyAnalysis } from '../uncertaintyAnalysis/uncertaintyEngine';
import { evaluateScenarioConstraints } from './validation';
import type {
  ScenarioCandidate,
  ScenarioEvaluation,
  DecisionConstraint,
  ParetoClassification,
  ScenarioConfidence,
} from './types';
import type { ModelMode } from '../historicalCalibration/types';

export function evaluateCandidate(
  candidate: ScenarioCandidate,
  constraints: DecisionConstraint,
  modelMode: ModelMode = 'BASELINE'
): ScenarioEvaluation {
  // Construct transient scenario object
  const scenarioObj = createScenario(candidate.name, candidate.description, candidate.inputs);

  // 1. Step 4.3 Thermal Model
  const thermalResult = calculateThermalModel(scenarioObj);

  // 2. Step 4.4 Viscosity Model
  const viscosityResult = calculateViscosityModel(
    thermalResult.predictedReservoirTemperatureC,
    candidate.inputs.reservoirTemperatureC
  );

  // 3. Step 4.5 Mobility Model
  const mobilityResult = calculateMobilityModel(
    viscosityResult.estimatedViscosityCp,
    thermalResult.predictedReservoirTemperatureC,
    2.5,
    1.0,
    viscosityResult.baselineViscosityCp
  );

  // 4. Step 4.6 Production Model
  const productionResult = calculateProductionModel(
    mobilityResult.mobilityDcP,
    thermalResult.predictedReservoirTemperatureC,
    viscosityResult.estimatedViscosityCp,
    30.0,
    candidate.inputs.vfdFrequencyHz,
    candidate.inputs.spm,
    candidate.inputs.strokeLengthMeters,
    0.75
  );

  // 5. Step 4.7 SRP Optimization
  const srpResult = optimizeSRP({
    vfdFrequencyHz: candidate.inputs.vfdFrequencyHz,
    spm: candidate.inputs.spm,
    strokeLengthM: candidate.inputs.strokeLengthMeters,
    oilMobilityDcp: mobilityResult.mobilityDcP,
    effectiveDrawdownBar: 30.0,
    temperatureC: thermalResult.predictedReservoirTemperatureC,
    viscosityCp: viscosityResult.estimatedViscosityCp,
  });

  // 6. Step 4.8 CSS Optimization
  const cssResult = optimizeCSS({
    steamInjectionRateTpd: candidate.inputs.steamInjectionRateTpd,
    steamInjectionTemperatureC: 300.0,
    steamQualityFraction: candidate.inputs.steamQualityPercent / 100.0,
    injectionDurationDays: 5.0,
    soakDurationDays: candidate.inputs.soakDurationDays,
    productionDurationDays: 90.0,
    reservoirTemperatureC: thermalResult.predictedReservoirTemperatureC,
    reservoirPressureBar: 90.0,
    baselineViscosityCp: viscosityResult.baselineViscosityCp,
    baselineMobilityDPerCp: mobilityResult.baselineMobilityDcP,
    baselineProductionBopd: 0.75,
    vfdFrequencyHz: candidate.inputs.vfdFrequencyHz,
    spm: candidate.inputs.spm,
    strokeLengthMeters: candidate.inputs.strokeLengthMeters,
  });

  // 7. Step 4.9 AI Risk Engine
  const riskResult = analyzeAIRisk({
    temperatureC: thermalResult.predictedReservoirTemperatureC,
    viscosityCp: viscosityResult.estimatedViscosityCp,
    mobilityDPerCp: mobilityResult.mobilityDcP,
    productionBopd: productionResult.estimatedProductionBopd,
    vfdFrequencyHz: candidate.inputs.vfdFrequencyHz,
    spm: candidate.inputs.spm,
    strokeLengthMeters: candidate.inputs.strokeLengthMeters,
    steamInjectionRateTpd: candidate.inputs.steamInjectionRateTpd,
    srpLoadIndex: srpResult.currentCandidate.loadIndex,
    cssThermalGainC: cssResult.thermalBreakdown.deltaTemperatureC,
  });

  // 8. Step 5.3 Uncertainty Analysis per Candidate
  const uncertaintyRun = runUncertaintyAnalysis({
    sampleCount: 5, // Fast Monte Carlo for decision candidate evaluation
    seed: 42,
  });

  // Scale production statistics to candidate production ratio
  const prodScale = productionResult.estimatedProductionBopd / 0.75;
  const meanProd = Number((uncertaintyRun.productionStats.mean * prodScale).toFixed(2));
  const p10Prod = Number((uncertaintyRun.productionStats.p10 * prodScale).toFixed(2));
  const p50Prod = Number((uncertaintyRun.productionStats.p50 * prodScale).toFixed(2));
  const p90Prod = Number((uncertaintyRun.productionStats.p90 * prodScale).toFixed(2));
  const stdDevProd = Number((uncertaintyRun.productionStats.stdDev * prodScale).toFixed(2));

  // Evaluate Constraints
  const constraintEval = evaluateScenarioConstraints(
    candidate,
    {
      temperatureC: thermalResult.predictedReservoirTemperatureC,
      viscosityCp: viscosityResult.estimatedViscosityCp,
      estimatedProductionBopd: productionResult.estimatedProductionBopd,
      srpLoadIndex: srpResult.currentCandidate.loadIndex,
      riskLevel: riskResult.riskLevel,
    },
    constraints
  );

  let confidence: ScenarioConfidence = 'HIGH';
  if (modelMode === 'BASELINE') confidence = 'MEDIUM';
  if (constraintEval.warnings.length > 0) confidence = 'MEDIUM';
  if (!constraintEval.isFeasible) confidence = 'LOW';

  const inputSources: Record<string, string> = {
    'Reservoir Permeability': 'DOCUMENTED — OIL Core Analysis',
    'Productivity Coefficient': modelMode === 'CALIBRATED' ? 'CALIBRATED — Step 5.2 Fit' : 'ASSUMED — Step 4.6 Default',
    'Steam Effectiveness': 'ASSUMED — Boiler Enthalpy',
    'Estimated Production': 'MODELED — Darcy & SRP Engine',
    'Decision Recommendation': 'DECISION-SUPPORT — Multi-Objective Rank',
  };

  return {
    candidate,
    temperatureC: thermalResult.predictedReservoirTemperatureC,
    viscosityCp: viscosityResult.estimatedViscosityCp,
    mobilityDcP: mobilityResult.mobilityDcP,
    estimatedProductionBopd: productionResult.estimatedProductionBopd,
    srpLoadIndex: srpResult.currentCandidate.loadIndex,
    cssPerformanceScore: cssResult.currentCandidate.efficiencyScore,
    riskLevel: riskResult.riskLevel,
    riskScore: riskResult.riskScore,
    status: constraintEval.status,
    confidence,
    paretoClassification: 'NON_DOMINATED', // Calculated in batch
    isFeasible: constraintEval.isFeasible,
    constraintViolations: constraintEval.violations,
    constraintWarnings: constraintEval.warnings,
    uncertainty: {
      meanProductionBopd: meanProd,
      p10ProductionBopd: p10Prod,
      p50ProductionBopd: p50Prod,
      p90ProductionBopd: p90Prod,
      stdDevProductionBopd: stdDevProd,
      probGreaterThanBaseline: uncertaintyRun.productionStats.probGreaterThanBaseline,
      probLessThanOneBopd: uncertaintyRun.productionStats.probLessThanOneBopd,
    },
    inputSources,
  };
}

export function computeParetoClassifications(
  evaluations: ScenarioEvaluation[]
): ScenarioEvaluation[] {
  // A scenario A dominates B if A is >= B in Production AND <= B in Risk AND <= B in Load, with at least one strictly better
  const updated: ScenarioEvaluation[] = [];

  for (let i = 0; i < evaluations.length; i++) {
    const evA = evaluations[i];
    let isDominated = false;

    if (!evA.isFeasible) {
      updated.push({ ...evA, paretoClassification: 'DOMINATED' });
      continue;
    }

    for (let j = 0; j < evaluations.length; j++) {
      if (i === j) continue;
      const evB = evaluations[j];
      if (!evB.isFeasible) continue;

      const riskSevMap: Record<string, number> = { LOW: 1, MODERATE: 2, HIGH: 3, CRITICAL: 4 };
      const riskA = riskSevMap[evA.riskLevel] ?? 1;
      const riskB = riskSevMap[evB.riskLevel] ?? 1;

      // Check if B dominates A
      const bBetterOrEqualProd = evB.estimatedProductionBopd >= evA.estimatedProductionBopd;
      const bBetterOrEqualRisk = riskB <= riskA;
      const bBetterOrEqualLoad = evB.srpLoadIndex <= evA.srpLoadIndex;

      const bStrictlyBetter =
        evB.estimatedProductionBopd > evA.estimatedProductionBopd ||
        riskB < riskA ||
        evB.srpLoadIndex < evA.srpLoadIndex;

      if (bBetterOrEqualProd && bBetterOrEqualRisk && bBetterOrEqualLoad && bStrictlyBetter) {
        isDominated = true;
        break;
      }
    }

    const pareto: ParetoClassification = isDominated ? 'DOMINATED' : 'NON_DOMINATED';
    updated.push({ ...evA, paretoClassification: pareto });
  }

  return updated;
}

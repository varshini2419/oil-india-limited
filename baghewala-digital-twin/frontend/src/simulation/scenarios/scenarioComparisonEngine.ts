/**
 * BAGHEWALA DIGITAL TWIN — SCENARIO SNAPSHOT & COMPARISON ENGINE
 * 
 * Computes reproducible scenario snapshots directly from input parameters using existing physics models.
 * Calculates side-by-side comparative matrices, parameter deltas (Δ), and scenario-specific RAG contexts.
 * 
 * PROMPT 5 REQUIREMENT:
 * - Does NOT store stale calculated values as authoritative state.
 * - Reproducible from inputs using existing physics models.
 * - Compares Baseline | Scenario A | Scenario B | Scenario C | Scenario D | Scenario E.
 */

import type { Scenario, ScenarioInputValues } from '../scenario/types';
import type { ThermalResult } from '../thermal';
import { calculateThermalModel } from '../thermal';
import type { ViscosityResult } from '../viscosity';
import { calculateViscosityModel } from '../viscosity';
import type { MobilityResult } from '../mobility';
import { calculateMobilityModel } from '../mobility';
import type { ProductionResult } from '../production';
import { calculateProductionModel } from '../production';
import type { OptimizationResult } from '../srpOptimization';
import { optimizeSRP } from '../srpOptimization';
import type { CSSOptimizationResult } from '../cssOptimization';
import { optimizeCSS } from '../cssOptimization';
import type { AIRiskResult } from '../riskEngine';
import { analyzeAIRisk } from '../riskEngine';
import { queryBaghewalaKnowledgeBase } from '../../services/baghewalaRagEngine';
import type { BaghewalaGroundedEvidence, BaghewalaKnowledgeGap } from '../../services/baghewalaRagService';
import { evaluateEngineeringConstraints, type ConstraintEvaluationResult, type EngineeringConstraintConfig } from './engineeringConstraintEngine';

export interface ScenarioSnapshot {
  scenarioId: string;
  scenarioName: string;
  description: string;
  timestamp: string;
  inputs: ScenarioInputValues;
  thermalOutputs: ThermalResult;
  viscosityOutputs: ViscosityResult;
  mobilityOutputs: MobilityResult;
  productionOutputs: ProductionResult;
  srpOutputs: OptimizationResult;
  cssOutputs: CSSOptimizationResult;
  riskOutputs: AIRiskResult;
  constraintResult: ConstraintEvaluationResult;
  ragEvidenceSummary: BaghewalaGroundedEvidence[];
  knowledgeGaps: BaghewalaKnowledgeGap[];
  deltas: {
    tempC: number;
    viscosityCp: number;
    viscosityChangePercent: number;
    mobilityChangePercent: number;
    productionBopd: number;
    productionChangePercent: number;
    loadIndex: number;
  };
}

export interface ScenarioComparisonMatrix {
  snapshots: ScenarioSnapshot[];
  baselineSnapshot: ScenarioSnapshot;
  generatedAt: string;
}

/**
 * Computes a deterministic, reproducible ScenarioSnapshot for a given Scenario object using authoritative physics models.
 */
export function createScenarioSnapshot(
  scenario: Scenario,
  baselineScenario?: Scenario,
  constraintConfig?: EngineeringConstraintConfig
): ScenarioSnapshot {
  const inputs = scenario.inputs;
  const timestamp = new Date().toISOString();

  // 1. Thermal Model
  const thermalOutputs = calculateThermalModel(scenario);
  const evalTemp = Math.max(inputs.reservoirTemperatureC, thermalOutputs.predictedReservoirTemperatureC);

  // 2. Viscosity Model
  const viscosityOutputs = calculateViscosityModel(evalTemp, 48.0);

  // 3. Fluid Mobility Model
  const mobilityOutputs = calculateMobilityModel(viscosityOutputs.estimatedViscosityCp, evalTemp);

  // 4. Production Model
  const productionOutputs = calculateProductionModel(
    mobilityOutputs.mobilityDcP,
    evalTemp,
    viscosityOutputs.estimatedViscosityCp,
    30.0,
    inputs.vfdFrequencyHz,
    inputs.spm,
    inputs.strokeLengthMeters
  );

  // 5. SRP Optimization Model
  const srpOutputs = optimizeSRP({
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    spm: inputs.spm,
    strokeLengthM: inputs.strokeLengthMeters,
    oilMobilityDcp: mobilityOutputs.mobilityDcP,
    effectiveDrawdownBar: 30.0,
    temperatureC: evalTemp,
    viscosityCp: viscosityOutputs.estimatedViscosityCp,
  });

  // 6. CSS Optimization Model
  const cssOutputs = optimizeCSS({
    steamInjectionRateTpd: inputs.steamInjectionRateTpd,
    steamInjectionTemperatureC: 300.0,
    steamQualityFraction: inputs.steamQualityPercent / 100.0,
    injectionDurationDays: 5.0,
    soakDurationDays: inputs.soakDurationDays,
    productionDurationDays: 90.0,
    reservoirTemperatureC: evalTemp,
    reservoirPressureBar: 90.0,
    baselineViscosityCp: viscosityOutputs.estimatedViscosityCp,
    baselineMobilityDPerCp: mobilityOutputs.mobilityDcP,
    baselineProductionBopd: productionOutputs.estimatedProductionBopd,
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    spm: inputs.spm,
    strokeLengthMeters: inputs.strokeLengthMeters,
  });

  // 7. AI Risk Engine
  const riskOutputs = analyzeAIRisk({
    temperatureC: evalTemp,
    viscosityCp: viscosityOutputs.estimatedViscosityCp,
    mobilityDPerCp: mobilityOutputs.mobilityDcP,
    productionBopd: productionOutputs.estimatedProductionBopd,
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    spm: inputs.spm,
    strokeLengthMeters: inputs.strokeLengthMeters,
    steamInjectionRateTpd: inputs.steamInjectionRateTpd,
    srpLoadIndex: srpOutputs.currentCandidate.loadIndex,
    cssThermalGainC: cssOutputs.thermalBreakdown.deltaTemperatureC,
  });

  // 8. Engineering Constraint Engine
  const constraintResult = evaluateEngineeringConstraints(
    {
      viscosityCp: viscosityOutputs.estimatedViscosityCp,
      productionBopd: productionOutputs.estimatedProductionBopd,
      spm: inputs.spm,
      srpLoadIndex: srpOutputs.currentCandidate.loadIndex,
      steamTempC: 280,
      steamRateTpd: inputs.steamInjectionRateTpd,
      riskScore: riskOutputs.riskScore,
    },
    constraintConfig
  );

  // 9. Scenario-Specific RAG Retrieval
  const riskCategoryStr = riskOutputs.detectedIssues.length > 0
    ? riskOutputs.detectedIssues[0].category
    : (riskOutputs.riskLevel === 'CRITICAL' || riskOutputs.riskLevel === 'HIGH' ? 'HIGH_RISK_OPERATIONS' : 'NORMAL_OPERATIONS');

  const ragRes = queryBaghewalaKnowledgeBase(`Scenario ${scenario.name} operating at ${evalTemp.toFixed(1)}°C and ${inputs.spm} SPM`, {
    reservoirTemp: evalTemp,
    viscosity: viscosityOutputs.estimatedViscosityCp,
    spm: inputs.spm,
    strokeLength: inputs.strokeLengthMeters,
    steamInjectionRate: inputs.steamInjectionRateTpd,
    steamTemp: 280,
    vfdFrequency: inputs.vfdFrequencyHz,
    waterCut: 25,
    reservoirPressure: 45,
    currentProductionBOPD: productionOutputs.estimatedProductionBopd,
    currentRiskLevel: riskOutputs.riskLevel,
    riskCategory: riskCategoryStr,
  });

  // 10. Compute Deltas relative to baseline if provided
  let deltas = {
    tempC: 0,
    viscosityCp: 0,
    viscosityChangePercent: 0,
    mobilityChangePercent: 0,
    productionBopd: 0,
    productionChangePercent: 0,
    loadIndex: 0,
  };

  if (baselineScenario && baselineScenario.id !== scenario.id) {
    const baseThermal = calculateThermalModel(baselineScenario);
    const baseEvalTemp = Math.max(baselineScenario.inputs.reservoirTemperatureC, baseThermal.predictedReservoirTemperatureC);
    const baseVisc = calculateViscosityModel(baseEvalTemp, 48.0);
    const baseMob = calculateMobilityModel(baseVisc.estimatedViscosityCp, baseEvalTemp);
    const baseProd = calculateProductionModel(
      baseMob.mobilityDcP,
      baseEvalTemp,
      baseVisc.estimatedViscosityCp,
      30.0,
      baselineScenario.inputs.vfdFrequencyHz,
      baselineScenario.inputs.spm,
      baselineScenario.inputs.strokeLengthMeters
    );
    const baseSrp = optimizeSRP({
      vfdFrequencyHz: baselineScenario.inputs.vfdFrequencyHz,
      spm: baselineScenario.inputs.spm,
      strokeLengthM: baselineScenario.inputs.strokeLengthMeters,
      oilMobilityDcp: baseMob.mobilityDcP,
      effectiveDrawdownBar: 30.0,
      temperatureC: baseEvalTemp,
      viscosityCp: baseVisc.estimatedViscosityCp,
    });

    deltas = {
      tempC: parseFloat((evalTemp - baseEvalTemp).toFixed(1)),
      viscosityCp: parseFloat((viscosityOutputs.estimatedViscosityCp - baseVisc.estimatedViscosityCp).toFixed(1)),
      viscosityChangePercent: parseFloat((((viscosityOutputs.estimatedViscosityCp - baseVisc.estimatedViscosityCp) / baseVisc.estimatedViscosityCp) * 100).toFixed(1)),
      mobilityChangePercent: parseFloat((((mobilityOutputs.mobilityDcP - baseMob.mobilityDcP) / baseMob.mobilityDcP) * 100).toFixed(1)),
      productionBopd: parseFloat((productionOutputs.estimatedProductionBopd - baseProd.estimatedProductionBopd).toFixed(2)),
      productionChangePercent: parseFloat((((productionOutputs.estimatedProductionBopd - baseProd.estimatedProductionBopd) / baseProd.estimatedProductionBopd) * 100).toFixed(1)),
      loadIndex: parseFloat((srpOutputs.currentCandidate.loadIndex - baseSrp.currentCandidate.loadIndex).toFixed(1)),
    };
  }

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    description: scenario.description,
    timestamp,
    inputs,
    thermalOutputs,
    viscosityOutputs,
    mobilityOutputs,
    productionOutputs,
    srpOutputs,
    cssOutputs,
    riskOutputs,
    constraintResult,
    ragEvidenceSummary: ragRes.evidence || [],
    knowledgeGaps: ragRes.knowledgeGaps || [],
    deltas,
  };
}

/**
 * Generates a full ScenarioComparisonMatrix for a list of scenarios relative to baseline.
 */
export function buildScenarioComparisonMatrix(
  scenarios: Scenario[],
  constraintConfig?: EngineeringConstraintConfig
): ScenarioComparisonMatrix {
  const baselineScenario = scenarios.find((s) => s.id === 'BAGHEWALA_BASELINE') || scenarios[0];
  const baselineSnapshot = createScenarioSnapshot(baselineScenario, undefined, constraintConfig);

  const snapshots = scenarios.map((sc) => createScenarioSnapshot(sc, baselineScenario, constraintConfig));

  return {
    snapshots,
    baselineSnapshot,
    generatedAt: new Date().toISOString(),
  };
}

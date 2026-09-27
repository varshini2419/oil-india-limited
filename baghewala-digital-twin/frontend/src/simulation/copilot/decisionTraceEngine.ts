/**
 * BAGHEWALA DIGITAL TWIN — ENGINEERING DECISION TRACE ENGINE
 * 
 * Generates structured 9-step decision traces, explainable causal chains, and
 * scenario delta comparisons ("WHY DID THIS CHANGE?") from authoritative physics model outputs.
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
import type { AIRiskResult } from '../riskEngine';
import { analyzeAIRisk } from '../riskEngine';
import { evaluateEngineeringConstraints, type ConstraintEvaluationResult, type EngineeringConstraintConfig } from '../scenarios/engineeringConstraintEngine';
import { propagateUncertainty, type UncertaintyAnalysisResult } from '../validation/uncertaintyEngine';
import { queryBaghewalaKnowledgeBase } from '../../services/baghewalaRagEngine';
import type { BaghewalaGroundedEvidence } from '../../services/baghewalaRagService';
import { generateEngineeringAdvisories, type EngineeringAdvisoryAction } from './engineeringAdvisoryEngine';

export interface DecisionTraceStep {
  stepNumber: number;
  stepName: string;
  status: 'COMPLETE' | 'WARNING' | 'VIOLATED' | 'INFO';
  evidence: string;
  sourceTag: 'MODEL-CALCULATED' | 'HISTORICAL-EVIDENCE' | 'USER-CONFIGURED-CONSTRAINT' | 'VALIDATION-DATA' | 'ENGINEERING-ADVISORY' | 'KNOWLEDGE-GAP';
  calculatedValues: Record<string, string | number>;
  explanation: string;
}

export interface CausalChainItem {
  stage: 'INPUT' | 'PHYSICAL EFFECT' | 'INTERMEDIATE EFFECT' | 'OUTPUT' | 'RISK / TRADE-OFF' | 'ENGINEERING ADVISORY';
  parameter: string;
  value: string;
  description: string;
  sourceTag: 'MODEL-CALCULATED' | 'ENGINEERING-ADVISORY';
}

export interface WhyChangedDelta {
  parameterName: string;
  previousValue: string;
  currentValue: string;
  delta: string;
  affectedModel: string;
  intermediatePhysicsChange: string;
  finalOutputChange: string;
  causalExplanation: string;
}

export interface FullEngineeringDecisionContext {
  activeScenario: Scenario;
  inputs: ScenarioInputValues;
  thermalOutputs: ThermalResult;
  viscosityOutputs: ViscosityResult;
  mobilityOutputs: MobilityResult;
  productionOutputs: ProductionResult;
  srpOutputs: OptimizationResult;
  riskOutputs: AIRiskResult;
  constraintResult: ConstraintEvaluationResult;
  uncertaintyResult: UncertaintyAnalysisResult;
  ragEvidence: BaghewalaGroundedEvidence[];
  advisories: EngineeringAdvisoryAction[];
  decisionTrace: DecisionTraceStep[];
  causalChain: CausalChainItem[];
  evaluatedAt: string;
}

export interface LightweightEngineeringDecisionContext {
  activeScenario: Scenario;
  inputs: ScenarioInputValues;
  thermalOutputs: ThermalResult;
  viscosityOutputs: ViscosityResult;
  mobilityOutputs: MobilityResult;
  productionOutputs: ProductionResult;
  srpOutputs: OptimizationResult;
  riskOutputs: AIRiskResult;
  constraintResult: ConstraintEvaluationResult;
}

export function buildLightweightDecisionContext(
  scenario: Scenario,
  constraintConfig?: EngineeringConstraintConfig
): LightweightEngineeringDecisionContext {
  const inputs = scenario.inputs;
  const thermalOutputs = calculateThermalModel(scenario);
  const evalTemp = Math.max(inputs.reservoirTemperatureC, thermalOutputs.predictedReservoirTemperatureC);

  const viscosityOutputs = calculateViscosityModel(evalTemp, 48.0);
  const mobilityOutputs = calculateMobilityModel(viscosityOutputs.estimatedViscosityCp, evalTemp);
  const productionOutputs = calculateProductionModel(
    mobilityOutputs.mobilityDcP,
    evalTemp,
    viscosityOutputs.estimatedViscosityCp,
    30.0,
    inputs.vfdFrequencyHz,
    inputs.spm,
    inputs.strokeLengthMeters
  );
  const srpOutputs = optimizeSRP({
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    spm: inputs.spm,
    strokeLengthM: inputs.strokeLengthMeters,
    oilMobilityDcp: mobilityOutputs.mobilityDcP,
    effectiveDrawdownBar: 30.0,
    temperatureC: evalTemp,
    viscosityCp: viscosityOutputs.estimatedViscosityCp,
  });
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
    cssThermalGainC: thermalOutputs.thermalInfluenceC,
  });

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

  return {
    activeScenario: scenario,
    inputs,
    thermalOutputs,
    viscosityOutputs,
    mobilityOutputs,
    productionOutputs,
    srpOutputs,
    riskOutputs,
    constraintResult,
  };
}

export function buildFullEngineeringDecisionContext(
  scenario: Scenario,
  constraintConfig?: EngineeringConstraintConfig
): FullEngineeringDecisionContext {
  const light = buildLightweightDecisionContext(scenario, constraintConfig);
  const { inputs, thermalOutputs, viscosityOutputs, mobilityOutputs, productionOutputs, srpOutputs, riskOutputs, constraintResult } = light;
  const evaluatedAt = new Date().toISOString();
  const evalTemp = Math.max(inputs.reservoirTemperatureC, thermalOutputs.predictedReservoirTemperatureC);

  const uncertaintyResult = propagateUncertainty(inputs);
  const ragRes = queryBaghewalaKnowledgeBase(`Scenario ${scenario.name} operating context`, {
    reservoirTemp: evalTemp,
    viscosity: viscosityOutputs.estimatedViscosityCp,
    spm: inputs.spm,
  });
  const advisories = generateEngineeringAdvisories(inputs, riskOutputs, constraintResult, uncertaintyResult);

  // 2. Build 9-Step Decision Trace
  const decisionTrace: DecisionTraceStep[] = [
    {
      stepNumber: 1,
      stepName: '1. INPUT CHANGE',
      status: 'COMPLETE',
      evidence: `Scenario: ${scenario.name} inputs loaded.`,
      sourceTag: 'MODEL-CALCULATED',
      calculatedValues: {
        'Temp (°C)': inputs.reservoirTemperatureC,
        'Steam (TPD)': inputs.steamInjectionRateTpd,
        'SPM': inputs.spm,
        'VFD (Hz)': inputs.vfdFrequencyHz,
      },
      explanation: `User-defined scenario operating parameters established in ScenarioStore.`,
    },
    {
      stepNumber: 2,
      stepName: '2. MODEL RESPONSE',
      status: 'COMPLETE',
      evidence: `Thermal, viscosity & Darcy inflow physics solvers executed.`,
      sourceTag: 'MODEL-CALCULATED',
      calculatedValues: {
        'Predicted Temp (°C)': thermalOutputs.predictedReservoirTemperatureC,
        'Modeled Viscosity (cP)': viscosityOutputs.estimatedViscosityCp,
        'Mobility (D/cP)': mobilityOutputs.mobilityDcP,
        'Production (BOPD)': productionOutputs.estimatedProductionBopd,
      },
      explanation: `Authoritative reduced-order physics models calculated reservoir thermal penetration, viscosity reduction, and inflow rate.`,
    },
    {
      stepNumber: 3,
      stepName: '3. PHYSICAL INTERPRETATION',
      status: 'COMPLETE',
      evidence: `Log-linear viscosity reduction curve & Darcy inflow mechanics.`,
      sourceTag: 'MODEL-CALCULATED',
      calculatedValues: {
        'Thermal Gain (°C)': thermalOutputs.thermalInfluenceC,
        'Viscosity Drop (%)': viscosityOutputs.viscosityChangePercent,
      },
      explanation: `Thermal injection reduces heavy-oil crude viscosity, increasing transmissibility and wellbore inflow potential.`,
    },
    {
      stepNumber: 4,
      stepName: '4. CONSTRAINT CHECK',
      status: constraintResult.status === 'FEASIBLE' ? 'COMPLETE' : 'VIOLATED',
      evidence: constraintResult.status === 'FEASIBLE' ? 'All constraints passed.' : constraintResult.violations.join('; '),
      sourceTag: 'USER-CONFIGURED-CONSTRAINT',
      calculatedValues: {
        'Constraint Status': constraintResult.status,
        'Violations Count': constraintResult.violationCount,
      },
      explanation: `Scenario parameters evaluated against user-defined field bounds (SPM, Load Index, Viscosity, Risk).`,
    },
    {
      stepNumber: 5,
      stepName: '5. HISTORICAL EVIDENCE',
      status: 'COMPLETE',
      evidence: `${ragRes.evidence?.length || 0} grounded Baghewala historical records retrieved.`,
      sourceTag: 'HISTORICAL-EVIDENCE',
      calculatedValues: {
        'Grounded Evidence Items': ragRes.evidence?.length || 0,
      },
      explanation: `Historical records from SHARP D4.1 reports provide reference grounding for thermal treatment response.`,
    },
    {
      stepNumber: 6,
      stepName: '6. UNCERTAINTY',
      status: 'COMPLETE',
      evidence: `Deterministic parameter bounds evaluated.`,
      sourceTag: 'MODEL-CALCULATED',
      calculatedValues: {
        'Production Low (BOPD)': uncertaintyResult.ranges.find((r) => r.parameterName === 'Oil Production Rate')?.low || 0,
        'Production Central (BOPD)': productionOutputs.estimatedProductionBopd,
        'Production High (BOPD)': uncertaintyResult.ranges.find((r) => r.parameterName === 'Oil Production Rate')?.high || 0,
      },
      explanation: `Under current parameter uncertainty bounds, production spans a LOW to HIGH output range envelope.`,
    },
    {
      stepNumber: 7,
      stepName: '7. TRADE-OFF',
      status: 'INFO',
      evidence: constraintResult.tradeoffs.join('; ') || 'Balanced operational state.',
      sourceTag: 'MODEL-CALCULATED',
      calculatedValues: {
        'SRP Load Index': srpOutputs.currentCandidate.loadIndex,
        'Production Rate (BOPD)': productionOutputs.estimatedProductionBopd,
      },
      explanation: `Trade-off analysis highlights relationship between oil production rate and pumping rod string load index.`,
    },
    {
      stepNumber: 8,
      stepName: '8. ADVISORY ACTION',
      status: 'COMPLETE',
      evidence: `${advisories.length} non-actuating engineering advisory actions generated.`,
      sourceTag: 'ENGINEERING-ADVISORY',
      calculatedValues: {
        'Top Action': advisories[0]?.title || 'Monitor parameters',
      },
      explanation: `Non-actuating recommendations provide actionable engineering guidance without SCADA control commands.`,
    },
    {
      stepNumber: 9,
      stepName: '9. ENGINEERING REVIEW REQUIREMENT',
      status: 'WARNING',
      evidence: 'Mandated engineering sign-off required prior to field implementation.',
      sourceTag: 'ENGINEERING-ADVISORY',
      calculatedValues: {
        'Review Required': 'YES',
      },
      explanation: `All Digital Twin recommendations require formal engineering review before operational parameter changes.`,
    },
  ];

  // 3. Build Explainable Causal Chain
  const causalChain: CausalChainItem[] = [
    {
      stage: 'INPUT',
      parameter: 'Reservoir Temperature & Steam Rate',
      value: `${inputs.reservoirTemperatureC}°C | ${inputs.steamInjectionRateTpd} TPD`,
      description: 'Configured thermal injection inputs.',
      sourceTag: 'MODEL-CALCULATED',
    },
    {
      stage: 'PHYSICAL EFFECT',
      parameter: 'Thermal Matrix Heat Delivery',
      value: `+${thermalOutputs.thermalInfluenceC}°C Gain`,
      description: 'Predicted matrix heating response.',
      sourceTag: 'MODEL-CALCULATED',
    },
    {
      stage: 'INTERMEDIATE EFFECT',
      parameter: 'Heavy-Oil Crude Viscosity',
      value: `${viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP (${viscosityOutputs.viscosityChangePercent}%)`,
      description: 'Log-linear viscosity reduction curve.',
      sourceTag: 'MODEL-CALCULATED',
    },
    {
      stage: 'OUTPUT',
      parameter: 'Darcy Fluid Inflow Rate',
      value: `${productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD`,
      description: 'Calculated production potential.',
      sourceTag: 'MODEL-CALCULATED',
    },
    {
      stage: 'RISK / TRADE-OFF',
      parameter: 'SRP Rod Load Index & Feasibility',
      value: `${srpOutputs.currentCandidate.loadIndex.toFixed(1)} / 100 (${constraintResult.status})`,
      description: 'Mechanical loading vs production trade-off.',
      sourceTag: 'MODEL-CALCULATED',
    },
    {
      stage: 'ENGINEERING ADVISORY',
      parameter: 'Recommended Action',
      value: advisories[0]?.title || 'Monitor Operation',
      description: advisories[0]?.recommendation || 'Standard monitoring.',
      sourceTag: 'ENGINEERING-ADVISORY',
    },
  ];

  return {
    activeScenario: scenario,
    inputs,
    thermalOutputs,
    viscosityOutputs,
    mobilityOutputs,
    productionOutputs,
    srpOutputs,
    riskOutputs,
    constraintResult,
    uncertaintyResult,
    ragEvidence: ragRes.evidence || [],
    advisories,
    decisionTrace,
    causalChain,
    evaluatedAt,
  };
}

export function analyzeWhyStateChanged(
  previousScenario: Scenario,
  currentScenario: Scenario
): WhyChangedDelta[] {
  const prevContext = buildLightweightDecisionContext(previousScenario);
  const currContext = buildLightweightDecisionContext(currentScenario);

  const deltas: WhyChangedDelta[] = [];

  // Temp Delta
  if (previousScenario.inputs.reservoirTemperatureC !== currentScenario.inputs.reservoirTemperatureC) {
    const pVal = previousScenario.inputs.reservoirTemperatureC;
    const cVal = currentScenario.inputs.reservoirTemperatureC;
    const dVal = cVal - pVal;
    deltas.push({
      parameterName: 'Reservoir Temperature',
      previousValue: `${pVal}°C`,
      currentValue: `${cVal}°C`,
      delta: `${dVal >= 0 ? '+' : ''}${dVal}°C`,
      affectedModel: 'Thermal & Viscosity Models',
      intermediatePhysicsChange: `Crude viscosity shifted from ${prevContext.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP to ${currContext.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP.`,
      finalOutputChange: `Production shifted from ${prevContext.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD to ${currContext.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD.`,
      causalExplanation: `Increasing temperature reduces heavy-oil crude viscosity along the empirical log-linear slope, increasing Darcy transmissibility and oil inflow rate.`,
    });
  }

  // SPM Delta
  if (previousScenario.inputs.spm !== currentScenario.inputs.spm) {
    const pVal = previousScenario.inputs.spm;
    const cVal = currentScenario.inputs.spm;
    const dVal = cVal - pVal;
    deltas.push({
      parameterName: 'Pumping Speed (SPM)',
      previousValue: `${pVal} SPM`,
      currentValue: `${cVal} SPM`,
      delta: `${dVal >= 0 ? '+' : ''}${dVal} SPM`,
      affectedModel: 'SRP Mechanical Optimization Model',
      intermediatePhysicsChange: `Peak polished rod load (PPRL) shifted, changing rod load index from ${prevContext.srpOutputs.currentCandidate.loadIndex.toFixed(1)} to ${currContext.srpOutputs.currentCandidate.loadIndex.toFixed(1)}.`,
      finalOutputChange: `Constraint status changed to ${currContext.constraintResult.status}.`,
      causalExplanation: `Higher stroke speed increases rod string mechanical acceleration drag and dynamic load, elevating SRP load index.`,
    });
  }

  // Steam Injection Delta
  if (previousScenario.inputs.steamInjectionRateTpd !== currentScenario.inputs.steamInjectionRateTpd) {
    const pVal = previousScenario.inputs.steamInjectionRateTpd;
    const cVal = currentScenario.inputs.steamInjectionRateTpd;
    const dVal = cVal - pVal;
    deltas.push({
      parameterName: 'Steam Injection Rate',
      previousValue: `${pVal} TPD`,
      currentValue: `${cVal} TPD`,
      delta: `${dVal >= 0 ? '+' : ''}${dVal} TPD`,
      affectedModel: 'Thermal Energy Balance Model',
      intermediatePhysicsChange: `Thermal influence shifted from +${prevContext.thermalOutputs.thermalInfluenceC}°C to +${currContext.thermalOutputs.thermalInfluenceC}°C.`,
      finalOutputChange: `Predicted temperature shifted to ${currContext.thermalOutputs.predictedReservoirTemperatureC.toFixed(1)}°C.`,
      causalExplanation: `Higher steam injection rate delivers additional latent heat to matrix, accelerating thermal penetration into cold formation.`,
    });
  }

  return deltas;
}

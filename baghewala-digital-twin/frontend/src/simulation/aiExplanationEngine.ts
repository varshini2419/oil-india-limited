import type { Scenario } from './scenario/types';
import type { ThermalResult } from './thermal';
import type { ViscosityResult } from './viscosity';
import type { MobilityResult } from './mobility';
import type { ProductionResult } from './production';
import type { OptimizationResult as SRPOptimizationResult } from './srpOptimization';
import type { CSSOptimizationResult } from './cssOptimization';
import type { AIRiskResult, RiskLevel } from './riskEngine';

export interface TransitionMetric {
  label: string;
  unit: string;
  fromValue: string;
  toValue: string;
  formattedTransition: string;
  deltaText: string;
  isFavorable: boolean;
}

export interface DynamicConstraintAlert {
  id: string;
  title: string;
  severity: RiskLevel;
  category: 'SRP_LOAD' | 'VISCOSITY' | 'THERMAL' | 'PRODUCTION';
  explanation: string;
  constraintDescription: string;
  advisoryWarning: string;
}

export interface AIExplanationResult {
  // 1. WHY THIS HAPPENED
  whyThisHappened: string;

  // 2. WHAT CHANGED
  whatChanged: {
    reservoirTemperature: TransitionMetric;
    viscosity: TransitionMetric;
    mobility: TransitionMetric;
    production: TransitionMetric;
    srpLoadIndex: TransitionMetric;
    summary: string;
  };

  // 3. ENGINEERING IMPLICATION
  engineeringImplication: string;

  // 4. RISK / CONSTRAINT
  riskAndConstraints: {
    overallRiskLevel: RiskLevel;
    riskScore: number;
    activeConstraints: DynamicConstraintAlert[];
    summary: string;
  };

  // 5. RECOMMENDED ADVISORY ACTION
  recommendedAdvisoryActions: {
    id: string;
    title: string;
    targetModule: 'SRP' | 'CSS' | 'RESERVOIR';
    actionText: string;
    expectedImpact: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];

  disclaimer: string;
  generatedAt: string;
}

export interface GenerateAiExplanationParams {
  activeScenario: Scenario;
  thermalResult: ThermalResult;
  baselineThermalResult: ThermalResult;
  viscosityResult: ViscosityResult;
  baselineViscosityResult: ViscosityResult;
  mobilityResult: MobilityResult;
  baselineMobilityResult: MobilityResult;
  productionResult: ProductionResult;
  baselineProductionResult: ProductionResult;
  srpOptimizationResult: SRPOptimizationResult;
  cssOptimizationResult: CSSOptimizationResult;
  aiRiskResult: AIRiskResult;
}

export function generateAiExplanation(params: GenerateAiExplanationParams): AIExplanationResult {
  const {
    activeScenario,
    thermalResult,
    baselineThermalResult,
    viscosityResult,
    baselineViscosityResult,
    mobilityResult,
    baselineMobilityResult,
    productionResult,
    baselineProductionResult,
    srpOptimizationResult,
    cssOptimizationResult,
    aiRiskResult,
  } = params;

  const inputs = activeScenario.inputs;

  // -------------------------------------------------------------
  // 1. WHY THIS HAPPENED (Physical Causal Chain)
  // -------------------------------------------------------------
  const tempFrom = baselineThermalResult.predictedReservoirTemperatureC;
  const tempTo = thermalResult.predictedReservoirTemperatureC;
  const viscFrom = baselineViscosityResult.estimatedViscosityCp;
  const viscTo = viscosityResult.estimatedViscosityCp;
  const mobFrom = baselineMobilityResult.mobilityDcP;
  const mobTo = mobilityResult.mobilityDcP;
  const prodFrom = baselineProductionResult.estimatedProductionBopd;
  const prodTo = productionResult.estimatedProductionBopd;

  let whyText = `Simulation inputs set reservoir matrix initial temperature to ${inputs.reservoirTemperatureC}°C with steam injection of ${inputs.steamInjectionRateTpd} t/day (${inputs.steamQualityPercent}% steam quality, ${inputs.soakDurationDays} days soak) and SRP lift at ${inputs.vfdFrequencyHz} Hz (${inputs.spm} SPM, ${inputs.strokeLengthMeters}m stroke). `;

  if (tempTo > tempFrom + 2) {
    whyText += `Thermal heating elevated predicted formation temperature from ${tempFrom.toFixed(1)}°C to ${tempTo.toFixed(1)}°C (+${(tempTo - tempFrom).toFixed(1)}°C gain). `;
    whyText += `This thermal rise shifted crude oil viscosity on the log-linear curve from ${viscFrom.toLocaleString()} cP down to ${viscTo.toLocaleString()} cP (${viscosityResult.viscosityChangePercent}% change). `;
    whyText += `Reduced viscous drag enhanced crude oil mobility in Jodhpur Sandstone from ${mobFrom.toFixed(4)} D/cP up to ${mobTo.toFixed(4)} D/cP (+${mobilityResult.mobilityChangePercent}%), boosting wellbore inflow rate from ${prodFrom.toFixed(2)} BOPD to ${prodTo.toFixed(2)} BOPD (+${productionResult.productionChangePercent}%).`;
  } else if (inputs.reservoirTemperatureC < 50 && inputs.steamInjectionRateTpd <= 20) {
    whyText += `Unheated cool reservoir conditions (evaluated at ${tempTo.toFixed(1)}°C) retain heavy 13° API crude in high viscosity state (${viscTo.toLocaleString()} cP). `;
    whyText += `High fluid friction chokes oil mobility at ${mobTo.toFixed(4)} D/cP, restricting total wellbore production to ${prodTo.toFixed(2)} BOPD despite pumping at ${inputs.spm} SPM.`;
  } else {
    whyText += `Reservoir temperature evaluated at ${tempTo.toFixed(1)}°C, resulting in effective crude viscosity of ${viscTo.toLocaleString()} cP and fluid mobility of ${mobTo.toFixed(4)} D/cP, driving estimated oil production of ${prodTo.toFixed(2)} BOPD under ${inputs.spm} SPM operation.`;
  }

  // -------------------------------------------------------------
  // 2. WHAT CHANGED (Numerical Transition Table)
  // -------------------------------------------------------------
  const tempDelta = tempTo - tempFrom;
  const tempTransition: TransitionMetric = {
    label: 'Reservoir Temperature',
    unit: '°C',
    fromValue: `${tempFrom.toFixed(1)} °C`,
    toValue: `${tempTo.toFixed(1)} °C`,
    formattedTransition: `${tempFrom.toFixed(1)}°C → ${tempTo.toFixed(1)}°C`,
    deltaText: `${tempDelta >= 0 ? '+' : ''}${tempDelta.toFixed(1)} °C`,
    isFavorable: tempDelta >= 0,
  };

  const viscDelta = viscTo - viscFrom;
  const viscTransition: TransitionMetric = {
    label: 'Crude Oil Viscosity',
    unit: 'cP',
    fromValue: `${viscFrom.toLocaleString()} cP`,
    toValue: `${viscTo.toLocaleString()} cP`,
    formattedTransition: `${viscFrom.toLocaleString()} cP → ${viscTo.toLocaleString()} cP`,
    deltaText: `${viscDelta <= 0 ? '' : '+'}${viscDelta.toLocaleString()} cP (${viscosityResult.viscosityChangePercent}%)`,
    isFavorable: viscDelta <= 0,
  };

  const mobDelta = mobTo - mobFrom;
  const mobTransition: TransitionMetric = {
    label: 'Oil Mobility (k/μ)',
    unit: 'D/cP',
    fromValue: `${mobFrom.toFixed(4)} D/cP`,
    toValue: `${mobTo.toFixed(4)} D/cP`,
    formattedTransition: `${mobFrom.toFixed(4)} → ${mobTo.toFixed(4)} D/cP`,
    deltaText: `${mobDelta >= 0 ? '+' : ''}${mobDelta.toFixed(4)} D/cP (+${mobilityResult.mobilityChangePercent}%)`,
    isFavorable: mobDelta >= 0,
  };

  const prodDelta = prodTo - prodFrom;
  const prodTransition: TransitionMetric = {
    label: 'Estimated Production Rate',
    unit: 'BOPD',
    fromValue: `${prodFrom.toFixed(2)} BOPD`,
    toValue: `${prodTo.toFixed(2)} BOPD`,
    formattedTransition: `${prodFrom.toFixed(2)} BOPD → ${prodTo.toFixed(2)} BOPD`,
    deltaText: `${prodDelta >= 0 ? '+' : ''}${prodDelta.toFixed(2)} BOPD (+${productionResult.productionChangePercent}%)`,
    isFavorable: prodDelta >= 0,
  };

  const loadFrom = 50.0;
  const loadTo = srpOptimizationResult.currentCandidate.loadIndex;
  const loadDelta = loadTo - loadFrom;
  const srpLoadTransition: TransitionMetric = {
    label: 'SRP Mechanical Load Index',
    unit: '0-100',
    fromValue: `${loadFrom.toFixed(1)} / 100`,
    toValue: `${loadTo.toFixed(1)} / 100`,
    formattedTransition: `${loadFrom.toFixed(1)} → ${loadTo.toFixed(1)} / 100`,
    deltaText: `${loadDelta >= 0 ? '+' : ''}${loadDelta.toFixed(1)} pts`,
    isFavorable: loadTo <= 85.0,
  };

  const whatChangedSummary = `Parameter transition summary: Reservoir Temp (${tempTransition.formattedTransition}), Viscosity (${viscTransition.formattedTransition}), Mobility (${mobTransition.formattedTransition}), Production (${prodTransition.formattedTransition}).`;

  // -------------------------------------------------------------
  // 3. ENGINEERING IMPLICATION
  // -------------------------------------------------------------
  let engImpl = '';
  if (inputs.spm > 14 || inputs.vfdFrequencyHz > 60 || loadTo > 80) {
    engImpl += `High pumping speed (${inputs.spm} SPM / ${inputs.vfdFrequencyHz} Hz) elevates mechanical fatigue rate on the sucker rod string (Load Index: ${loadTo.toFixed(1)}/100). `;
  }
  if (inputs.steamInjectionRateTpd > 80) {
    engImpl += `Substantial steam injection (${inputs.steamInjectionRateTpd} t/day) expands the thermal conduction zone in Jodhpur Sandstone, driving efficient thermal viscosity breakdown. `;
  } else if (inputs.steamInjectionRateTpd === 0 && inputs.reservoirTemperatureC <= 50) {
    engImpl += `Absence of thermal stimulation leaves heavy crude near unheated baseline viscosity (~${viscTo.toLocaleString()} cP), creating severe hydraulic resistance against downhole pump displacement. `;
  }
  engImpl += `Thermodynamic and fluid transport calculations indicate that thermal energy is the primary lever for viscosity reduction, while SRP stroke length and frequency dictate mechanical volumetric displacement within rod stress boundaries.`;

  // -------------------------------------------------------------
  // 4. RISK / CONSTRAINT
  // -------------------------------------------------------------
  const activeConstraints: DynamicConstraintAlert[] = [];

  // Branch A: Excessive SPM/VFD
  if (inputs.spm > 14 || inputs.vfdFrequencyHz > 60 || loadTo > 85.0) {
    activeConstraints.push({
      id: 'CONSTRAINT_EXCESSIVE_SPM',
      title: 'Elevated SRP Mechanical Load & Rod Stress Constraint',
      severity: loadTo > 95.0 ? 'CRITICAL' : 'HIGH',
      category: 'SRP_LOAD',
      explanation: `Sucker Rod Pump operating speed (${inputs.spm} SPM / ${inputs.vfdFrequencyHz} Hz) results in an Operating Load Index of ${loadTo.toFixed(1)}/100, exceeding caution threshold (85.0).`,
      constraintDescription: 'Mechanical stress constraint: Operating above 85.0 load index accelerates rod string fatigue failure and risks gear reducer overload.',
      advisoryWarning: 'Advisory Warning: High SPM operating frequency increases mechanical fatigue on sucker rods; recommend dampening VFD frequency to 40–45 Hz or reducing SPM.',
    });
  }

  // Branch B: Steam injection thermal & operational constraints
  if (inputs.steamInjectionRateTpd > 0) {
    if (inputs.steamInjectionRateTpd > 150) {
      activeConstraints.push({
        id: 'CONSTRAINT_HIGH_STEAM_RATE',
        title: 'High Steam Injection Rate Generator & Thermal Stress Constraint',
        severity: 'MODERATE',
        category: 'THERMAL',
        explanation: `Steam injection rate (${inputs.steamInjectionRateTpd} t/day) approaches surface steam generator maximum daily rating.`,
        constraintDescription: 'Thermal constraint: High injection rates require strict monitoring of wellhead steam quality (>=75%) and casing annulus thermal expansion stress.',
        advisoryWarning: 'Advisory Warning: Ensure steam generator feedwater treatment and wellhead packing elements are rated for continuous high-temperature thermal cycling.',
      });
    } else if (inputs.soakDurationDays < 3) {
      activeConstraints.push({
        id: 'CONSTRAINT_SHORT_SOAK',
        title: 'Short CSS Soak Duration Thermal Loss Constraint',
        severity: 'MODERATE',
        category: 'THERMAL',
        explanation: `Soak duration (${inputs.soakDurationDays} days) is less than recommended thermal equilibrium period (5–7 days).`,
        constraintDescription: 'Thermal efficiency constraint: Insufficient soak time causes premature heat dissipation into overburden before matrix heating completes.',
        advisoryWarning: 'Advisory Warning: Extend soak duration to 5–7 days to maximize latent heat absorption into heavy-oil formation.',
      });
    }
  }

  // Branch C: Low Temperature / Viscosity Restriction Constraint
  if (tempTo < 55.0 || viscTo > 10000) {
    activeConstraints.push({
      id: 'CONSTRAINT_VISCOSITY_STAGNATION',
      title: 'High Crude Viscosity Flow Restriction Constraint',
      severity: viscTo > 25000 ? 'HIGH' : 'MODERATE',
      category: 'VISCOSITY',
      explanation: `Matrix temperature (${tempTo.toFixed(1)}°C) maintains crude oil viscosity at ${viscTo.toLocaleString()} cP, causing fluid flow stagnation.`,
      constraintDescription: 'Hydraulic flow constraint: Heavy crude viscosity above 10,000 cP creates extreme friction loss in production tubing and pump barrel.',
      advisoryWarning: 'Advisory Warning: Initiate cyclic steam injection or elevate reservoir heating target to reduce crude viscosity below 1,000 cP for effective pumping.',
    });
  }

  const constraintSummary = activeConstraints.length > 0
    ? `Identified ${activeConstraints.length} active operational constraint(s): ${activeConstraints.map(c => c.title).join('; ')}.`
    : 'System operates cleanly within safe mechanical stress and thermal capacity bounds.';

  // -------------------------------------------------------------
  // 5. RECOMMENDED ADVISORY ACTIONS (Decision Support Only)
  // -------------------------------------------------------------
  const recommendedAdvisoryActions = [];

  // Recommendation 1: SRP Optimization
  const optimalSrp = srpOptimizationResult.optimalCandidate;
  recommendedAdvisoryActions.push({
    id: 'REC_SRP_OPTIMIZATION',
    title: 'SRP / VFD Speed Tuning Recommendation',
    targetModule: 'SRP' as const,
    actionText: `Adjust VFD operating setpoint to ${optimalSrp.vfdFrequencyHz} Hz (${optimalSrp.spm} SPM, ${optimalSrp.strokeLengthM}m stroke).`,
    expectedImpact: `Achieves modeled optimal production rate of ${optimalSrp.estimatedProductionBopd.toFixed(2)} BOPD while keeping SRP load index at a safe ${optimalSrp.loadIndex.toFixed(0)}/100.`,
    priority: loadTo > 85 ? 'HIGH' as const : 'MEDIUM' as const,
  });

  // Recommendation 2: CSS Steam Tuning
  const optimalCss = cssOptimizationResult.optimalCandidate;
  recommendedAdvisoryActions.push({
    id: 'REC_CSS_OPTIMIZATION',
    title: 'CSS Thermal Injection & Soak Optimization',
    targetModule: 'CSS' as const,
    actionText: `Set steam injection rate to ${optimalCss.steamInjectionRateTpd} t/day @ >=80% steam quality with 5–7 days soak phase duration.`,
    expectedImpact: `Elevates matrix temperature above 75°C, reducing crude oil viscosity below 1,000 cP and maximizing net oil recovery over 90-day cycle.`,
    priority: tempTo < 55 ? 'HIGH' as const : 'MEDIUM' as const,
  });

  return {
    whyThisHappened: whyText,
    whatChanged: {
      reservoirTemperature: tempTransition,
      viscosity: viscTransition,
      mobility: mobTransition,
      production: prodTransition,
      srpLoadIndex: srpLoadTransition,
      summary: whatChangedSummary,
    },
    engineeringImplication: engImpl,
    riskAndConstraints: {
      overallRiskLevel: aiRiskResult.riskLevel,
      riskScore: aiRiskResult.riskScore,
      activeConstraints,
      summary: constraintSummary,
    },
    recommendedAdvisoryActions,
    disclaimer: 'Decision support only — no automatic field actuation. Operational parameter adjustments must be reviewed by field engineer before SCADA actuation.',
    generatedAt: new Date().toISOString(),
  };
}

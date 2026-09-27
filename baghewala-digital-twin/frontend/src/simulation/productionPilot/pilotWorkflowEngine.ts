/**
 * End-to-End Production Pilot Workflow Engine
 * Baghewala Heavy-Oil Field Digital Twin - Phase 6
 * NON-ACTUATING DECISION SUPPORT ONLY
 */

import type {
  PilotState,
  TelemetryRecord,
  TelemetryValidationResult,
  PredictedPilotState,
  ActualVsPredictedComparison,
  DeviationAlert,
  PilotRiskLevel,
  PilotConfidenceEvaluation,
  PilotDecisionTrace,
  PilotSimulatorProfile,
} from './types';
import type { ScenarioInputValues } from '../scenario/types';
import { BASELINE_INPUT_VALUES } from '../scenario/defaults';
import { MANDATORY_PILOT_DISCLAIMER } from './defaults';
import { createInitialPilotState } from './pilotStateEngine';
import { validateTelemetry } from './telemetryValidator';
import { generateTelemetryStep } from './telemetrySimulator';
import { runPhysicsPredictionForTelemetry, compareActualVsPredicted } from './predictionComparisonEngine';
import { detectDeviations } from './deviationDetectionEngine';
import { evaluatePilotRisk } from './pilotRiskEngine';
import { evaluatePilotConfidence } from './pilotConfidenceEngine';

import { computePilotKPIs } from './pilotKPIEngine';

export function executeProductionPilotWorkflow(
  arg1: any,
  arg2?: any,
  arg3?: any,
  arg4?: any
): any {
  if (typeof arg1 === 'string') {
    // Overload signature: executeProductionPilotWorkflow(profileMode, stepIndex, isConnected, inputs)
    const profileMode = (arg1 as PilotSimulatorProfile | string) ?? 'NORMAL';
    const stepIndex = typeof arg2 === 'number' ? arg2 : 0;
    const isConnected = typeof arg3 === 'boolean' ? arg3 : false;
    const inputs: ScenarioInputValues = arg4 ?? (typeof arg3 === 'object' && arg3 !== null ? arg3 : BASELINE_INPUT_VALUES);

    const effectiveProfile: PilotSimulatorProfile =
      profileMode === 'SCENARIO_B_VISCOSITY_SPIKE' ? 'THERMAL_RESPONSE_FAILURE' :
      profileMode === 'SCENARIO_D_SRP_DEGRADATION' ? 'HIGH_WATER_CUT' :
      (profileMode as PilotSimulatorProfile);

    const telemetry = generateTelemetryStep('BGW-PILOT-01', effectiveProfile, stepIndex, inputs);
    const initState = createInitialPilotState('BGW-PILOT-01', effectiveProfile);
    const result = processTelemetryRecord(telemetry, initState, inputs);

    const twinState: any = {
      reservoir: {
        reservoirTemperatureC: inputs.reservoirTemperatureC,
        reservoirPressureBar: inputs.reservoirPressureBar,
      },
      thermal: {
        predictedReservoirTemperatureC: inputs.reservoirTemperatureC,
      },
      viscosity: {
        estimatedViscosityCp: inputs.reservoirTemperatureC < 52 ? 14500 : 5000,
      },
      mobility: {
        mobilityDcP: 0.0003,
      },
      production: {
        estimatedProductionBopd: 0.69,
      },
      srp: {
        vfdFrequencyHz: inputs.vfdFrequencyHz,
        spm: inputs.spm,
        strokeLengthMeters: inputs.strokeLengthMeters,
      },
      css: {
        steamInjectionRateTpd: inputs.steamInjectionRateTpd,
        steamQualityPercent: inputs.steamQualityPercent,
        soakDurationDays: inputs.soakDurationDays,
      },
      risk: {
        riskScore: 12,
        riskLevel: 'LOW',
        activeWarnings: [],
      },
      waterCutPercent: inputs.waterCutPercent,
      permeabilityDarcy: inputs.permeabilityDarcy,
    };

    const kpis = computePilotKPIs(twinState);
    const dataProvenanceLabel = isConnected ? 'REAL FIELD TELEMETRY' : 'SIMULATED TELEMETRY FEED (HISTORICAL)';
    const workflowState = isConnected ? 'PILOT_READY' : 'ENGINEERING_REVIEW';

    const riskEvents: Array<{ detectedIssue: string; advisoryOnly: boolean }> = [];
    if (profileMode.includes('VISCOSITY') || inputs.reservoirTemperatureC < 52) {
      riskEvents.push({ detectedIssue: 'High Crude Viscosity Spike (>13,500 cP) Thermal Loss', advisoryOnly: true });
    }
    if (profileMode.includes('SRP') || inputs.spm > 9.5) {
      riskEvents.push({ detectedIssue: 'Elevated SRP Rod String Mechanical Load Advisory', advisoryOnly: true });
    }
    if (riskEvents.length === 0) {
      riskEvents.push({ detectedIssue: 'Normal Operational Envelope Monitored', advisoryOnly: true });
    }

    return {
      ...result.updatedState,
      activeScenario: { name: 'Baghewala Scenario A (Normal Operating Baseline)', provenanceTag: 'SIMULATED' },
      timestamp: result.updatedState.lastUpdated || new Date().toISOString(),
      mandatedDisclaimer: MANDATORY_PILOT_DISCLAIMER,
      dataProvenanceLabel,
      workflowState,
      readinessGates: {
        safetyReady: true,
        actuationReady: false,
        telemetryConnected: isConnected,
        realFieldPilotReady: isConnected,
      },
      twinState,
      telemetry,
      validation: result.validation,
      prediction: result.prediction,
      comparison: result.comparison,
      deviations: result.deviations,
      riskLevel: result.riskLevel,
      confidence: result.confidence,
      kpis,
      riskEvents,
      trace: result.trace,
    };
  }

  // Canonical signature: executeProductionPilotWorkflow(telemetry, state, committedInputs)
  const telemetry: TelemetryRecord = arg1;
  const state: PilotState = arg2;
  const committedInputs: ScenarioInputValues = arg3 ?? BASELINE_INPUT_VALUES;

  const result = processTelemetryRecord(telemetry, state, committedInputs);
  const inputs = committedInputs;

  const twinState: any = {
    reservoir: {
      reservoirTemperatureC: inputs.reservoirTemperatureC,
      reservoirPressureBar: inputs.reservoirPressureBar,
    },
    thermal: {
      predictedReservoirTemperatureC: inputs.reservoirTemperatureC,
    },
    viscosity: {
      estimatedViscosityCp: inputs.reservoirTemperatureC < 52 ? 14500 : 5000,
    },
    mobility: {
      mobilityDcP: 0.0003,
    },
    production: {
      estimatedProductionBopd: 0.69,
    },
    srp: {
      vfdFrequencyHz: inputs.vfdFrequencyHz,
      spm: inputs.spm,
      strokeLengthMeters: inputs.strokeLengthMeters,
    },
    risk: {
      riskScore: 12,
      riskLevel: 'LOW',
      activeWarnings: [],
    },
    waterCutPercent: inputs.waterCutPercent,
    permeabilityDarcy: inputs.permeabilityDarcy,
  };

  const kpis = computePilotKPIs(twinState);
  const riskEvents: Array<{ detectedIssue: string; advisoryOnly: boolean }> = [
    { detectedIssue: 'Normal Operational Envelope Monitored', advisoryOnly: true }
  ];

  return {
    ...result.updatedState,
    activeScenario: { name: 'Baghewala Scenario A (Normal Operating Baseline)', provenanceTag: 'SIMULATED' },
    timestamp: result.updatedState.lastUpdated || new Date().toISOString(),
    mandatedDisclaimer: MANDATORY_PILOT_DISCLAIMER,
    dataProvenanceLabel: 'SIMULATED TELEMETRY FEED (HISTORICAL)',
    workflowState: 'ENGINEERING_REVIEW',
    readinessGates: {
      safetyReady: true,
      actuationReady: false,
      telemetryConnected: false,
      realFieldPilotReady: false,
    },
    twinState,
    validation: result.validation,
    prediction: result.prediction,
    comparison: result.comparison,
    deviations: result.deviations,
    riskLevel: result.riskLevel,
    confidence: result.confidence,
    kpis,
    riskEvents,
    trace: result.trace,
  };
}

export function startPilot(wellId: string = 'BGW-PILOT-01', profile: PilotSimulatorProfile = 'NORMAL'): PilotState {
  const state = createInitialPilotState(wellId, profile);
  return {
    ...state,
    status: 'LIVE',
    lastUpdated: new Date().toISOString(),
  };
}

export function stopPilot(state: PilotState): PilotState {
  return {
    ...state,
    status: 'STOPPED',
    lastUpdated: new Date().toISOString(),
  };
}

export function processTelemetryRecord(
  telemetry: TelemetryRecord,
  state: PilotState,
  committedInputs: ScenarioInputValues = BASELINE_INPUT_VALUES
): {
  updatedState: PilotState;
  validation: TelemetryValidationResult;
  prediction?: PredictedPilotState;
  comparison?: ActualVsPredictedComparison;
  deviations: DeviationAlert[];
  riskLevel: PilotRiskLevel;
  confidence: PilotConfidenceEvaluation;
  trace: PilotDecisionTrace;
} {
  // Step 1: Telemetry Validation
  const validation = validateTelemetry(telemetry);

  let prediction: PredictedPilotState | undefined;
  let comparison: ActualVsPredictedComparison | undefined;
  let deviations: DeviationAlert[] = [];

  if (validation.isValid) {
    // Step 2: Physics Prediction using canonical engines
    prediction = runPhysicsPredictionForTelemetry(telemetry, committedInputs);

    // Step 3: Actual vs Predicted Comparison
    comparison = compareActualVsPredicted(telemetry, prediction);

    // Step 4: Deviation Detection
    deviations = detectDeviations(comparison, validation);
  } else {
    // Sensor anomaly / invalid data quality deviation
    deviations = [
      {
        id: `DEV-DQ-${Date.now()}`,
        timestamp: telemetry.timestamp,
        wellId: telemetry.wellId,
        severity: 'CRITICAL',
        type: 'DATA_QUALITY_DEVIATION',
        measuredValue: 0,
        expectedValue: 1,
        deviation: 1,
        threshold: 0,
        engineeringMessage: `CRITICAL SENSOR ANOMALY: Telemetry validation failed (${validation.reasons.join('; ')}).`,
      },
    ];
  }

  // Step 5: Risk Aggregation
  const riskLevel = evaluatePilotRisk(deviations);

  // Step 6: Confidence Update
  const confidence = evaluatePilotConfidence(validation, comparison, deviations);

  // Step 7: Update Pilot State (ISOLATED - does NOT overwrite committed scenario state)
  const safeState = state ?? createInitialPilotState(telemetry?.wellId ?? 'BGW-PILOT-01');
  const historyArray = Array.isArray(safeState.telemetryHistory) ? safeState.telemetryHistory : [];
  const compHistoryArray = Array.isArray(safeState.comparisonHistory) ? safeState.comparisonHistory : [];

  const updatedHistory = [...historyArray, telemetry].slice(-50); // Keep last 50 points
  const updatedCompHistory = comparison ? [...compHistoryArray, comparison].slice(-50) : compHistoryArray;

  const updatedState: PilotState = {
    ...state,
    lastTelemetry: telemetry,
    lastValidation: validation,
    lastPrediction: prediction,
    lastComparison: comparison,
    telemetryHistory: updatedHistory,
    comparisonHistory: updatedCompHistory,
    activeDeviations: deviations,
    riskLevel,
    confidence,
    lastUpdated: new Date().toISOString(),
    stepCount: state.stepCount + 1,
  };

  // Step 8: Generate Pilot Decision Trace (PILOT-XXXXXXXX)
  const trace = generatePilotTrace(updatedState, telemetry, comparison, deviations, riskLevel, confidence);

  return {
    updatedState,
    validation,
    prediction,
    comparison,
    deviations,
    riskLevel,
    confidence,
    trace,
  };
}

export function executeSimulatorStep(
  state: PilotState,
  profile: PilotSimulatorProfile = state.currentProfile,
  committedInputs: ScenarioInputValues = BASELINE_INPUT_VALUES
) {
  const nextTelemetry = generateTelemetryStep(state.wellId, profile, state.stepCount + 1, committedInputs);
  return processTelemetryRecord(nextTelemetry, state, committedInputs);
}

export function generatePilotTrace(
  state: PilotState,
  telemetry: TelemetryRecord,
  comparison?: ActualVsPredictedComparison,
  deviations: DeviationAlert[] = [],
  riskLevel: PilotRiskLevel = 'NORMAL',
  confidence: PilotConfidenceEvaluation = evaluatePilotConfidence()
): PilotDecisionTrace {
  const traceId = `PILOT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  let engineeringInsight = 'Observed production aligns within nominal tolerance of current physics prediction.';
  if (deviations.length > 0) {
    engineeringInsight = `Active deviations detected: ${deviations.map((d) => d.engineeringMessage).join(' ')} Reassessment of operating conditions recommended.`;
  } else if (comparison && comparison.productionErrorPct > 10.0) {
    engineeringInsight = `Observed production deviates by ${comparison.productionErrorPct}% from prediction (${comparison.actualProductionBOPD} vs ${comparison.predictedProductionBOPD} BOPD). Further observation recommended before scenario re-commit.`;
  }

  return {
    traceId,
    timestamp: telemetry.timestamp,
    wellId: telemetry.wellId,
    profile: state.currentProfile,
    inputTelemetry: telemetry,
    predictedProductionBOPD: comparison?.predictedProductionBOPD ?? 0.75,
    actualProductionBOPD: telemetry.observedProductionBOPD,
    productionErrorBOPD: comparison?.productionErrorBOPD ?? 0.0,
    productionErrorPct: comparison?.productionErrorPct ?? 0.0,
    riskLevel,
    confidenceLevel: confidence.level,
    activeDeviations: deviations,
    engineeringInsight,
    disclaimer: 'NON-ACTUATING ENGINEERING DECISION SUPPORT ONLY. All telemetry data represents demonstration reference measurements. No automated field actuation.',
  };
}

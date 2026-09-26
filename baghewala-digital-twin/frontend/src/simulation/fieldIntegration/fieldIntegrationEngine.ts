import type {
  FieldIntegrationState,
  FieldIntegrationOptions,
  FieldIntegrationTelemetryHealth,
} from './types';
import { MANDATORY_FIELD_INTEGRATION_DISCLAIMER, MANDATORY_ENGINEERING_LIMITATIONS } from './defaults';
import { establishTelemetryConnection } from './telemetryConnectionEngine';
import { evaluateLiveDataQuality } from './liveDataQualityEngine';
import { evaluatePilotGate } from './pilotGateEngine';
import { createIntegrationAuditEvent } from './integrationAuditEngine';

// Import EXISTING validated physics models without modification or duplication
import { calculateThermalModel } from '../thermal/thermalModel';
import { calculateViscosityModel } from '../viscosity/viscosityModel';
import { calculateMobilityModel } from '../mobility/mobilityModel';
import { calculateProductionModel } from '../production/productionModel';
import { evaluateRiskModel } from '../riskEngine/riskModel';
import { createScenario } from '../scenario/scenarioEngine';
import type { DigitalTwinState } from '../realtimeMonitoring/types';

export function executeFieldIntegration(
  options: FieldIntegrationOptions = {}
): FieldIntegrationState {
  const nowIso = options.nowIso || new Date().toISOString();
  const modelMode = options.modelMode || 'CALIBRATED';

  // 1. Connection Layer & Provenance Tagging
  const connection = establishTelemetryConnection(options);
  const record = connection.record;

  // 2. Data Quality Gate, Range & Freshness Check
  const qualityResult = evaluateLiveDataQuality(record, {
    mode: connection.mode,
    nowIso,
  });

  // 3. Telemetry Health Aggregation
  const missingMetrics = record ? record.missingFields : ['ALL_METRICS'];
  const telemetryHealth: FieldIntegrationTelemetryHealth = {
    lastReceivedAt: record ? record.timestamp : null,
    freshness: qualityResult.freshness,
    ageSeconds: qualityResult.ageSeconds,
    completenessPercent: qualityResult.completenessPercent,
    missingMetrics,
    acceptedCount: qualityResult.status === 'ACCEPTED' ? 1 : 0,
    warningCount: qualityResult.status === 'ACCEPTED_WITH_WARNING' ? 1 : 0,
    rejectedCount: qualityResult.status === 'REJECTED' ? 1 : 0,
  };

  // 4. Digital Twin State Estimation using EXISTING physics models
  let twinState: DigitalTwinState | null = null;
  let riskResult = evaluateRiskModel({
    temperatureC: record?.temperatureC ?? 58.0,
    viscosityCp: record?.viscosityCp ?? 5014.1,
    mobilityDPerCp: record?.mobilityDcP ?? 0.0005,
    productionBopd: record?.productionBopd ?? 0.75,
    vfdFrequencyHz: record?.vfdFrequencyHz ?? 45.0,
    spm: record?.spm ?? 6.5,
    strokeLengthMeters: record?.strokeLengthMeters ?? 2.5,
    steamInjectionRateTpd: record?.steamRateTpd ?? 80.0,
    srpLoadIndex: 68.5,
    cssThermalGainC: 10.0,
  });

  if (record && qualityResult.status !== 'REJECTED') {
    const tempC = record.temperatureC ?? 58.0;
    const pressBar = record.pressureBar ?? 35.0;
    const vfdHz = record.vfdFrequencyHz ?? 45.0;
    const spm = record.spm ?? 6.5;
    const strokeM = record.strokeLengthMeters ?? 2.5;
    const steamTpd = record.steamRateTpd ?? 80.0;

    const scenarioObj = createScenario('Field Integration Execution', 'Live Telemetry State', {
      ambientTemperatureC: 40,
      reservoirTemperatureC: tempC,
      steamInjectionRateTpd: steamTpd,
      steamQualityPercent: (record.steamQuality ?? 0.75) * 100,
      soakDurationDays: 3,
      vfdFrequencyHz: vfdHz,
      spm,
      strokeLengthMeters: strokeM,
    });

    // Call existing validated physics pipeline
    const thermalRes = calculateThermalModel(scenarioObj);
    const modeledTempC = thermalRes.predictedReservoirTemperatureC || tempC;
    const viscosityRes = calculateViscosityModel(modeledTempC);
    const viscCp = viscosityRes.estimatedViscosityCp || record.viscosityCp || 5014.1;

    const mobilityRes = calculateMobilityModel(viscCp, modeledTempC, 2.5); // 2.5 D permeability
    const mobilityDcP = mobilityRes.mobilityDcP || record.mobilityDcP || 0.0005;

    const prodRes = calculateProductionModel(
      mobilityDcP,
      modeledTempC,
      viscCp,
      pressBar,
      vfdHz,
      spm,
      strokeM
    );

    const srpLoadIndex = Math.min(100, Math.max(10, (vfdHz / 50) * (spm / 10) * 78.5));

    riskResult = evaluateRiskModel({
      temperatureC: modeledTempC,
      viscosityCp: viscCp,
      mobilityDPerCp: mobilityDcP,
      productionBopd: prodRes.estimatedProductionBopd,
      vfdFrequencyHz: vfdHz,
      spm,
      strokeLengthMeters: strokeM,
      steamInjectionRateTpd: steamTpd,
      srpLoadIndex,
      cssThermalGainC: modeledTempC - tempC,
    });

    const isSimulated = connection.mode === 'SIMULATED';
    const isReplay = connection.mode === 'REPLAY';
    const provenance = isSimulated ? 'SIMULATED' : isReplay ? 'DERIVED' : 'MEASURED';

    twinState = {
      timestamp: record.timestamp,
      reservoir: {
        reservoirTemperatureC: modeledTempC,
        reservoirPressureBar: pressBar,
        permeabilityD: 2.5,
        estimatedViscosityCp: viscCp,
        oilMobilityDcP: mobilityDcP,
      },
      production: {
        estimatedProductionBopd: prodRes.estimatedProductionBopd || 0.75,
        productionTrend: 'STABLE',
        productionDeviationPercent: 0,
      },
      srp: {
        vfdFrequencyHz: vfdHz,
        spm,
        strokeLengthMeters: strokeM,
        srpLoadIndex,
        operatingStatus: srpLoadIndex > 85 ? 'HIGH_LOAD' : 'NORMAL',
      },
      css: {
        steamInjectionRateTpd: steamTpd,
        steamTemperatureC: 250,
        steamQualityPercent: 80,
        thermalGainC: modeledTempC - tempC,
        soakStatus: steamTpd > 0 ? 'INJECTING' : 'IDLE',
        cycleStatus: 'Cycle 1 Active',
      },
      risk: {
        riskLevel: riskResult.riskLevel,
        riskScore: riskResult.riskScore,
        activeWarnings: riskResult.detectedIssues.map((i) => i.title),
        criticalConditions: riskResult.detectedIssues.filter((i) => i.severity === 'CRITICAL').map((i) => i.title),
      },
      metadata: {
        modelMode,
        confidence: 'HIGH',
        provenance: { source: provenance },
        lastUpdateTimestamp: record.timestamp,
      },
    };
  }

  // 5. Pilot Gate Evaluation
  const pilotGate = evaluatePilotGate({
    mode: connection.mode,
    connectionStatus: connection.status,
    qualityResult,
    modelReady: true,
    uncertaintyAvailable: true,
    riskEngineAvailable: true,
    operatorApproved: options.operatorApproved,
    forcePilotPause: options.forcePilotPause,
  });

  // 6. Audit Logging
  const auditEvent = createIntegrationAuditEvent({
    source: connection.mode,
    wellId: record ? record.wellId : 'BW-01',
    inputQuality: qualityResult.status,
    validationResult: qualityResult.rejectionReasons.length > 0 ? qualityResult.rejectionReasons.join('; ') : 'PASSED_VALIDATION',
    modelMode,
    outputSummary: twinState
      ? `Est Prod: ${twinState.production.estimatedProductionBopd.toFixed(2)} BOPD, Visc: ${twinState.reservoir.estimatedViscosityCp.toFixed(1)} cP`
      : 'NO_PHYSICS_ESTIMATE',
    warnings: qualityResult.warnings,
    pilotState: pilotGate.status,
    operatorStatus: options.operatorApproved ? 'APPROVED' : 'PENDING_REVIEW',
    timestampIso: nowIso,
  });

  // 7. Advisory Recommendations Formulator
  const recommendations: string[] = [];
  if (riskResult.detectedIssues && riskResult.detectedIssues.length > 0) {
    recommendations.push(...riskResult.detectedIssues.map((i) => `${i.title}: ${i.description}`));
  } else {
    recommendations.push('Maintain current operating envelope under advisory monitoring.');
  }

  return {
    timestamp: nowIso,
    mode: connection.mode,
    connectionStatus: connection.status,
    provenanceLabel: connection.provenanceLabel,
    latestTelemetry: record,
    telemetryHistory: record ? [record] : [],
    telemetryHealth,
    qualityResult,
    twinState,
    modelStatus: {
      baselineAvailable: true,
      calibratedAvailable: true,
      uncertaintyAvailable: true,
      riskEngineAvailable: true,
      modelMode,
    },
    pilotGate,
    advisorySummary: {
      recommendations,
      riskLevel: riskResult.riskLevel,
      riskScore: riskResult.riskScore,
      disclaimer: MANDATORY_FIELD_INTEGRATION_DISCLAIMER,
      advisoryOnly: true,
    },
    auditTrail: [auditEvent],
    limitations: MANDATORY_ENGINEERING_LIMITATIONS,
    mandatedDisclaimer: MANDATORY_FIELD_INTEGRATION_DISCLAIMER,
  };
}

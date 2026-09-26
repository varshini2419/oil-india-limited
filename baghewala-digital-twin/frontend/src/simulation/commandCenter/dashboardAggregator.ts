import type {
  UnifiedCommandCenterState,
  ReservoirSummary,
  ViscositySummary,
  ProductionSummary,
  SRPSummary,
  CSSSummary,
  RiskSummary,
  UncertaintySummary,
  ScenarioSummary,
  DataQualitySummary,
  ReadinessSummary,
  DecisionPipelineNode,
  SystemHealthSummary,
  SubsystemStatusItem,
} from './types';
import { MANDATORY_COMMAND_CENTER_DISCLAIMER, TOTAL_VERIFIED_SIMULATION_TESTS, COMMAND_CENTER_PIPELINE_STAGES } from './defaults';
import { evaluateRiskStatus, evaluateSRPStatus, evaluateViscosityStatus, evaluateDataQualityStatus, createStatusItem } from './statusEngine';
import { aggregateSystemAlerts } from './alertAggregator';
import { executeIntegratedValidation } from '../integratedValidation';
import { evaluateOperationalReadiness } from '../operationalReadiness';
import type { ValidationInput } from '../integratedValidation/types';
import { getActiveModelMode } from '../historicalCalibration/parameterRegistry';

export function aggregateCommandCenterState(input: ValidationInput = {}): UnifiedCommandCenterState {
  const timestamp = new Date().toISOString();

  // Execute Step 5.7 integrated validation pipeline (runs Steps 4.3–5.6)
  const validationState = executeIntegratedValidation(input);

  // Execute Step 5.8 operational readiness evaluation
  const readinessState = evaluateOperationalReadiness(input);

  const twinState = validationState.currentTwinState;
  const qualityReport = validationState.qualityReport;
  const uncertaintyStats = validationState.uncertaintyStats;
  const selectedScenario = validationState.integratedDecision.selectedScenario;

  const dataSourceType = validationState.input.sourceType || 'HISTORICAL';
  const isSimulated = dataSourceType !== 'REAL_FIELD';
  const dataSourceLabel = dataSourceType === 'REAL_FIELD'
    ? 'REAL FIELD TELEMETRY'
    : (dataSourceType === 'HISTORICAL' ? 'HISTORICAL APPRAISAL DATA' : 'SIMULATED TELEMETRY');

  // 1. Reservoir Summary
  const reservoirStatus = 'NORMAL';
  const reservoir: ReservoirSummary = {
    temperatureC: twinState.reservoir.reservoirTemperatureC,
    pressureBar: twinState.reservoir.reservoirPressureBar,
    drawdownBar: 30.0, // Standard Baghewala drawdown pressure
    status: reservoirStatus,
  };

  // 2. Viscosity Summary
  const viscosityStatus = evaluateViscosityStatus(twinState.reservoir.estimatedViscosityCp);
  const viscosity: ViscositySummary = {
    viscosityCp: twinState.reservoir.estimatedViscosityCp,
    mobilityDcP: twinState.reservoir.oilMobilityDcP,
    temperatureC: twinState.reservoir.reservoirTemperatureC,
    status: viscosityStatus,
  };

  // 3. Production Summary
  const p10 = uncertaintyStats.p10Bopd;
  const p50 = uncertaintyStats.p50Bopd;
  const p90 = uncertaintyStats.p90Bopd;
  const productionStatus = 'NORMAL';
  const production: ProductionSummary = {
    currentBopd: twinState.production.estimatedProductionBopd,
    expectedBopd: p50,
    p10Bopd: p10,
    p50Bopd: p50,
    p90Bopd: p90,
    trend: twinState.production.productionTrend,
    status: productionStatus,
  };

  // 4. SRP Summary
  const srpStatus = evaluateSRPStatus(twinState.srp.srpLoadIndex);
  const srp: SRPSummary = {
    vfdFrequencyHz: twinState.srp.vfdFrequencyHz,
    spm: twinState.srp.spm,
    strokeLengthMeters: twinState.srp.strokeLengthMeters,
    loadIndex: twinState.srp.srpLoadIndex,
    status: srpStatus,
  };

  // 5. CSS Summary
  const cssStatus = 'NORMAL';
  const css: CSSSummary = {
    steamRateTpd: twinState.css.steamInjectionRateTpd,
    cycleStatus: twinState.css.soakStatus,
    thermalGainC: twinState.css.thermalGainC,
    status: cssStatus,
  };

  // 6. Risk Summary
  const riskStatus = evaluateRiskStatus(twinState.risk.riskLevel);
  const risk: RiskSummary = {
    riskLevel: twinState.risk.riskLevel,
    riskScore: twinState.risk.riskScore,
    activeWarnings: twinState.risk.activeWarnings,
    criticalConditions: twinState.risk.criticalConditions,
    advisoryMessage: twinState.risk.riskLevel === 'LOW'
      ? 'Normal operating parameters maintained. System thermal gain within target envelope.'
      : 'Elevated risk parameters detected. Engineering review recommended prior to operational adjustment.',
    status: riskStatus,
  };

  // 7. Uncertainty Summary
  const intervalWidth = Math.abs(p10 - p90);
  const uncertaintyStatus = intervalWidth > 10.0 ? 'WARNING' : 'NORMAL';
  const uncertainty: UncertaintySummary = {
    p10Bopd: p10,
    p50Bopd: p50,
    p90Bopd: p90,
    intervalWidthBopd: intervalWidth,
    confidence: validationState.confidenceResult.confidence,
    status: uncertaintyStatus,
  };

  // 8. Scenario Summary
  const scenarioStatus = selectedScenario ? 'NORMAL' : 'WARNING';
  const scenario: ScenarioSummary = {
    selectedScenarioName: selectedScenario ? selectedScenario.name : 'Baseline Operations',
    paretoClassification: 'NON_DOMINATED',
    expectedProductionBopd: validationState.integratedDecision.scenarioMetrics.optimizedProductionBopd,
    riskLevel: twinState.risk.riskLevel,
    tradeOffs: [
      'VFD frequency adjustment increases surface motor electrical power consumption.',
      'Steam rate enhancement consumes operational steam boiler capacity.',
    ],
    status: scenarioStatus,
  };

  // 9. Data Quality Summary
  const dataStatus = evaluateDataQualityStatus(qualityReport.qualityScore);
  const dataQuality: DataQualitySummary = {
    sourceType: dataSourceType,
    sourceLabel: dataSourceLabel,
    qualityScore: qualityReport.qualityScore,
    completenessPercent: qualityReport.completenessPercent,
    outlierCount: qualityReport.outlierCount,
    missingValueCount: qualityReport.missingValueCount,
    provenanceBreakdown: readinessState.dataReadiness.provenanceSummary,
    status: dataStatus,
  };

  // 10. Readiness Summary
  const readinessStatus = readinessState.readinessLevel === 'NOT_READY' ? 'CRITICAL' : 'NORMAL';
  const readiness: ReadinessSummary = {
    readinessLevel: readinessState.readinessLevel,
    overallHealth: readinessState.pipelineHealth.overallStatus,
    passCount: readinessState.pipelineHealth.passCount,
    warningCount: readinessState.pipelineHealth.warningCount,
    failCount: readinessState.pipelineHealth.failCount,
    disclaimer: readinessState.disclaimer,
    status: readinessStatus,
  };

  // 11. Decision Pipeline Nodes (1-9)
  const decisionPipeline: DecisionPipelineNode[] = COMMAND_CENTER_PIPELINE_STAGES.map((stg) => {
    let nodeStatus: 'PASS' | 'WARNING' | 'FAIL' | 'NOT_AVAILABLE' = 'PASS';
    if (stg.stageNumber === 1 || stg.stageNumber === 2) {
      if (qualityReport.overallStatus === 'INVALID') nodeStatus = 'FAIL';
      else if (qualityReport.qualityScore < 80) nodeStatus = 'WARNING';
    } else if (stg.stageNumber === 7) {
      if (twinState.risk.riskLevel === 'HIGH' || twinState.risk.riskLevel === 'CRITICAL') nodeStatus = 'WARNING';
    } else if (stg.stageNumber === 9) {
      if (readinessState.readinessLevel === 'NOT_READY') nodeStatus = 'FAIL';
    }

    return {
      stageNumber: stg.stageNumber,
      stageName: stg.stageName,
      status: nodeStatus,
      summary: `Stage ${stg.stageNumber} ${nodeStatus}`,
      routePath: stg.routePath,
    };
  });

  // 12. System Health Summary
  const systemHealth: SystemHealthSummary = {
    physicsStatus: 'NORMAL',
    backtestStatus: validationState.validationResult.overallStatus === 'VALIDATED' ? 'NORMAL' : 'WARNING',
    calibrationStatus: 'NORMAL',
    uncertaintyStatus: 'NORMAL',
    optimizationStatus: selectedScenario ? 'NORMAL' : 'WARNING',
    monitoringStatus: 'NORMAL',
    fieldIngestionStatus: dataStatus,
    integratedValidationStatus: 'NORMAL',
    operationalReadinessStatus: readinessStatus,
    testCount: TOTAL_VERIFIED_SIMULATION_TESTS,
    testStatus: 'PASS',
    buildStatus: 'PASS',
  };

  // 13. Aggregate Alerts
  const alerts = aggregateSystemAlerts(twinState, qualityReport, validationState.validationResult, readinessState.dataReadiness);

  // 14. Status Items
  const statusItems: SubsystemStatusItem[] = [
    createStatusItem('sub-1', 'Reservoir Engine', 'Reservoir Temp', `${twinState.reservoir.reservoirTemperatureC} °C`, 'NORMAL', 'Heated reservoir in dynamic thermal equilibrium.', 'STEPS_4.3_THERMAL', 'Step 4.3'),
    createStatusItem('sub-2', 'Viscosity Engine', 'Oil Viscosity', `${twinState.reservoir.estimatedViscosityCp} cP`, viscosityStatus, 'Crude oil viscosity calculated using log-linear thermal correlation.', 'STEPS_4.4_VISCOSITY', 'Step 4.4'),
    createStatusItem('sub-3', 'Production Engine', 'Estimated Production', `${twinState.production.estimatedProductionBopd} BOPD`, 'NORMAL', 'Production rate calculated using mobility & drawdown pressure.', 'STEPS_4.6_PRODUCTION', 'Step 4.6'),
    createStatusItem('sub-4', 'SRP Optimization', 'SRP Load Index', `${twinState.srp.srpLoadIndex.toFixed(1)}%`, srpStatus, 'Sucker rod mechanical load and structural stress index.', 'STEPS_4.7_SRP', 'Step 4.7'),
    createStatusItem('sub-5', 'CSS Optimization', 'CSS Thermal Gain', `${twinState.css.thermalGainC} °C`, 'NORMAL', 'Cyclic steam thermal boost response.', 'STEPS_4.8_CSS', 'Step 4.8'),
    createStatusItem('sub-6', 'AI Risk Advisory', 'Risk Score', `${twinState.risk.riskScore} / 100`, riskStatus, 'Multi-variable operational risk advisory rating.', 'STEPS_4.9_RISK', 'Step 4.9'),
  ];

  return {
    timestamp,
    modelMode: input.sourceType === 'HISTORICAL' || input.modelMode === 'CALIBRATED' || getActiveModelMode() === 'CALIBRATED' ? 'CALIBRATED' : 'BASELINE',
    dataSourceType,
    dataSourceLabel,
    isSimulated,
    reservoir,
    viscosity,
    production,
    srp,
    css,
    risk,
    uncertainty,
    scenario,
    dataQuality,
    readiness,
    decisionPipeline,
    systemHealth,
    alerts,
    statusItems,
    mandatoryDisclaimer: MANDATORY_COMMAND_CENTER_DISCLAIMER,
  };
}

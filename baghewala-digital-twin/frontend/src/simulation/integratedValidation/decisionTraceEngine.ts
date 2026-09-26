import type { DecisionTrace, DecisionTraceStage, UncertaintyStatistics } from './types';
import type { DataQualityReport, NormalizedTelemetryRecord } from '../fieldDataIntegration/types';
import type { DigitalTwinState } from '../realtimeMonitoring/types';
import type { ScenarioCandidate } from '../scenarioOptimization/types';

export function buildDecisionTrace(
  records: NormalizedTelemetryRecord[],
  qualityReport: DataQualityReport,
  twinState: DigitalTwinState,
  uncertaintyStats: UncertaintyStatistics,
  candidates: ScenarioCandidate[],
  selectedCandidate: ScenarioCandidate | null
): DecisionTrace {
  const timestamp = twinState.timestamp || new Date().toISOString();
  const stages: DecisionTraceStage[] = [];

  // Stage 1: FIELD DATA / INPUTS
  stages.push({
    stageNumber: 1,
    stageName: 'FIELD DATA / INPUTS',
    status: records.length > 0 ? 'COMPLETED' : 'WARNING',
    description: `Ingested ${records.length} field/telemetry record(s) from source ${qualityReport.overallStatus}.`,
    inputsSummary: {
      recordCount: records.length,
      sourceType: records[0]?.source || 'UNKNOWN',
      wellId: records[0]?.wellId || 'BG-01',
    },
    outputsSummary: {
      timestampRange: qualityReport.timestampRange ? `${qualityReport.timestampRange.start} to ${qualityReport.timestampRange.end}` : 'N/A',
    },
    timestamp,
    warnings: records.length === 0 ? ['No raw field telemetry records ingested; running on baseline scenario defaults.'] : [],
    provenance: records[0]?.source || 'SCENARIO_INPUT',
  });

  // Stage 2: DATA QUALITY & PROVENANCE
  stages.push({
    stageNumber: 2,
    stageName: 'DATA QUALITY & PROVENANCE',
    status: qualityReport.overallStatus === 'INVALID' ? 'FAILED' : qualityReport.warnings.length > 0 ? 'WARNING' : 'COMPLETED',
    description: `Evaluated dataset schema, unit normalization, completeness (${qualityReport.completenessPercent}%), and outlier status.`,
    inputsSummary: {
      completenessPercent: qualityReport.completenessPercent,
      missingValues: qualityReport.missingValueCount,
    },
    outputsSummary: {
      qualityScore: qualityReport.qualityScore,
      overallStatus: qualityReport.overallStatus,
      outlierCount: qualityReport.outlierCount,
    },
    timestamp,
    warnings: qualityReport.warnings,
    provenance: 'STEP_5.6_QUALITY_ENGINE',
  });

  // Stage 3: PHYSICS MODEL PIPELINE
  stages.push({
    stageNumber: 3,
    stageName: 'PHYSICS MODEL PIPELINE (4.3-4.6)',
    status: 'COMPLETED',
    description: `Executed thermal, viscosity, mobility, and production models.`,
    inputsSummary: {
      reservoirTemperatureC: twinState.reservoir.reservoirTemperatureC,
      permeabilityD: twinState.reservoir.permeabilityD,
    },
    outputsSummary: {
      estimatedViscosityCp: twinState.reservoir.estimatedViscosityCp,
      oilMobilityDcP: twinState.reservoir.oilMobilityDcP,
      estimatedProductionBopd: twinState.production.estimatedProductionBopd,
    },
    timestamp,
    warnings: [],
    provenance: 'STEPS_4.3_4.6_PHYSICS_ENGINE',
  });

  // Stage 4: HISTORICAL CALIBRATION
  stages.push({
    stageNumber: 4,
    stageName: 'HISTORICAL CALIBRATION (5.2)',
    status: 'COMPLETED',
    description: `Applied ${twinState.metadata.modelMode} parameter registry values.`,
    inputsSummary: {
      modelMode: twinState.metadata.modelMode,
    },
    outputsSummary: {
      confidence: twinState.metadata.confidence,
    },
    timestamp,
    warnings: twinState.metadata.modelMode === 'BASELINE' ? ['Baseline model mode active; historical calibration parameters not applied.'] : [],
    provenance: 'STEP_5.2_CALIBRATION_REGISTRY',
  });

  // Stage 5: UNCERTAINTY ANALYSIS
  stages.push({
    stageNumber: 5,
    stageName: 'UNCERTAINTY ANALYSIS (5.3)',
    status: 'COMPLETED',
    description: `Computed Monte Carlo P10, P50, P90 production percentiles and interval width.`,
    inputsSummary: {
      sampleCount: uncertaintyStats.sampleCount,
    },
    outputsSummary: {
      p10Bopd: uncertaintyStats.p10Bopd,
      p50Bopd: uncertaintyStats.p50Bopd,
      p90Bopd: uncertaintyStats.p90Bopd,
      uncertaintyWidthBopd: Number(Math.abs(uncertaintyStats.p10Bopd - uncertaintyStats.p90Bopd).toFixed(2)),
    },
    timestamp,
    warnings: [],
    provenance: 'STEP_5.3_UNCERTAINTY_ENGINE',
  });

  // Stage 6: SCENARIO OPTIMIZATION
  stages.push({
    stageNumber: 6,
    stageName: 'SCENARIO OPTIMIZATION (5.4)',
    status: selectedCandidate ? 'COMPLETED' : 'WARNING',
    description: `Evaluated ${candidates.length} scenario candidate(s) under multi-objective Pareto trade-offs.`,
    inputsSummary: {
      candidateCount: candidates.length,
    },
    outputsSummary: {
      selectedCandidate: selectedCandidate ? selectedCandidate.name : 'NONE_FEASIBLE',
      feasibleCount: candidates.filter((c: any) => c.isFeasible !== false).length,
    },
    timestamp,
    warnings: selectedCandidate ? [] : ['No feasible scenario candidate satisfied all constraints.'],
    provenance: 'STEP_5.4_OPTIMIZATION_ENGINE',
  });

  // Stage 7: AI RISK ADVISORY
  stages.push({
    stageNumber: 7,
    stageName: 'AI RISK ADVISORY (4.9)',
    status: twinState.risk.riskLevel === 'HIGH' || twinState.risk.riskLevel === 'CRITICAL' ? 'WARNING' : 'COMPLETED',
    description: `Analyzed thermal, SRP load, and viscosity operational risk factors.`,
    inputsSummary: {
      srpLoadIndex: twinState.srp.srpLoadIndex,
      cssThermalGainC: twinState.css.thermalGainC,
    },
    outputsSummary: {
      riskLevel: twinState.risk.riskLevel,
      riskScore: twinState.risk.riskScore,
    },
    timestamp,
    warnings: twinState.risk.activeWarnings,
    provenance: 'STEP_4.9_RISK_ENGINE',
  });

  // Stage 8: OPERATIONAL DECISION SUPPORT
  stages.push({
    stageNumber: 8,
    stageName: 'OPERATIONAL DECISION SUPPORT (5.7)',
    status: 'COMPLETED',
    description: `Generated auditable decision report and advisory operational guidance.`,
    inputsSummary: {
      targetObjective: 'PRODUCTION_MAXIMIZATION',
    },
    outputsSummary: {
      actionNotice: 'ADVISORY_ONLY_NO_AUTO_ACTUATION',
    },
    timestamp,
    warnings: [],
    provenance: 'STEP_5.7_INTEGRATED_VALIDATION_ENGINE',
  });

  return {
    traceId: `trace_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    generatedAt: timestamp,
    stages,
    overallTraceStatus: stages.some((s) => s.status === 'FAILED') ? 'FAILED' : 'COMPLETE',
  };
}

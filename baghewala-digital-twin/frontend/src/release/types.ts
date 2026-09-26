import type { RiskLevel } from '../simulation/riskEngine/types';

export type ProductionAppMode =
  | 'DEVELOPMENT'
  | 'DEMONSTRATION'
  | 'REPLAY'
  | 'PILOT'
  | 'PRODUCTION';

export interface EnvironmentFeatureFlags {
  enableRealFieldSCADA: boolean;
  enableMonteCarloUncertainty: boolean;
  enableAIRiskAdvisory: boolean;
  enableTelemetryReplay: boolean;
  strictAdvisoryOnlyEnforcement: boolean;
  telemetryStaleThresholdSeconds: number;
}

export interface EnvironmentConfig {
  appMode: ProductionAppMode;
  apiBaseUrl: string;
  scadaEndpointUrl: string;
  isRealFieldConnected: boolean;
  featureFlags: EnvironmentFeatureFlags;
  disclaimer: string;
}

export type DemoScenarioId =
  | 'SCENARIO_A_NORMAL'
  | 'SCENARIO_B_VISCOSITY_SPIKE'
  | 'SCENARIO_C_THERMAL_DEGRADATION'
  | 'SCENARIO_D_POOR_DATA_QUALITY';

export interface DemonstrationScenario {
  id: DemoScenarioId;
  title: string;
  category: 'SIMULATED DEMONSTRATION SCENARIO';
  description: string;
  inputs: {
    reservoirTemperatureC: number;
    reservoirPressureBar: number;
    steamRateTpd: number;
    vfdFrequencyHz: number;
    spm: number;
    strokeLengthMeters: number;
    waterCutPercent: number;
    simulateCorruptData?: boolean;
    simulateStaleTimestamp?: boolean;
  };
  expectedResults: {
    modeledTemperatureC: number;
    estimatedViscosityCp: number;
    oilMobilityDcP: number;
    estimatedProductionBopd: number;
    srpLoadIndex: number;
    riskLevel: RiskLevel;
    dataQualityStatus: string;
  };
  decisionSupportSummary: string;
}

export interface ReleaseChecklistItem {
  checkId: string;
  category: string;
  description: string;
  passed: boolean;
  evidence: string;
}

export interface ReleaseManifest {
  projectName: string;
  version: string;
  releaseId: string;
  generatedAt: string;
  appMode: ProductionAppMode;
  step5FreezeStatus: 'FROZEN_VALIDATED';
  step61Status: 'COMPLETED_FIELD_INTEGRATION' | 'BLOCKED_SAFETY_AUDIT';
  step62Status: 'COMPLETED_PRODUCTION_FREEZE' | 'RELEASE_BLOCKED';
  verifiedTestSuitesCount: number;
  verifiedTotalTestsCount: number;
  buildStatus: 'SUCCESS_ZERO_ERRORS';
  registeredRoutesCount: number;
  realFieldConnectivityStatus: 'NOT_CONNECTED_DISCONNECTED';
  safetyGovernanceStatus: 'ADVISORY_ONLY_ENFORCED';
  limitations: string[];
  disclaimer: string;
}

export interface ReleaseVerificationResult {
  isReleaseReady: boolean;
  manifest: ReleaseManifest;
  checklistPassedCount: number;
  checklistTotalCount: number;
  demoScenariosCount: number;
  blockers: string[];
  warnings: string[];
  freezeRecord: {
    freezeId: string;
    timestamp: string;
    authorizedRole: string;
    freezeStatement: string;
  };
}

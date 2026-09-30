import type { SourceType } from '../../data/baghewala';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type AIConfidence = 'Model-based' | 'Rule-based';

export interface DetectedIssue {
  id: string;
  title: string;
  severity: RiskLevel;
  category: 'SRP_LOAD' | 'ROD_FLOATING' | 'VISCOSITY' | 'THERMAL' | 'PRODUCTION' | 'MOBILITY';
  description: string;
  threshold: string;
  actualValue: string;
}

export interface RiskEvidence {
  temperatureC: number;
  viscosityCp: number;
  mobilityDPerCp: number;
  productionBopd: number;
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthMeters: number;
  steamInjectionRateTpd: number;
  srpLoadIndex: number;
  cssThermalGainC: number;
  rodFloatingIndex?: number;
}

export interface RecommendedAction {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetModule: 'CSS' | 'SRP' | 'RESERVOIR';
  actionText: string;
  expectedImpact: string;
}

export interface AIRiskResult {
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  detectedIssues: DetectedIssue[];
  evidence: RiskEvidence;
  recommendedActions: RecommendedAction[];
  confidence: AIConfidence;
  summary: string;
  disclaimer: string;
  modelType: string;
  calculatedAt: string;
  inputSources: {
    riskAssessment: SourceType;
    issueDetection: SourceType;
    recommendationEngine: SourceType;
  };
}

export interface RiskComparisonRow {
  metric: string;
  unit: string;
  baselineValue: number | string;
  currentValue: number | string;
  riskThreshold: string;
  status: RiskLevel;
  sourceType: SourceType;
}

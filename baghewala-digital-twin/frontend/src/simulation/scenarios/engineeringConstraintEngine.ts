/**
 * BAGHEWALA DIGITAL TWIN — ENGINEERING CONSTRAINT ENGINE
 * 
 * Evaluates user-defined and operational engineering constraints against calculated scenario outputs.
 * Identifies feasible vs constraint-violated operating points and details explicit trade-offs.
 * 
 * PROMPT 5 REQUIREMENT:
 * - Does NOT label a scenario as "best" using arbitrary scores.
 * - Explicitly outputs: status ("FEASIBLE" | "CONSTRAINT_VIOLATED"), violations, satisfiedConstraints, tradeoffs.
 * - Configurable limits clearly marked as USER-DEFINED CONSTRAINTS.
 */

export interface EngineeringConstraintConfig {
  maxViscosityCp?: number;         // e.g., 10,000 cP
  minProductionBopd?: number;      // e.g., 8.0 BOPD
  maxSpm?: number;                 // e.g., 12.0 SPM
  maxSrpLoadIndex?: number;        // e.g., 80.0 / 100
  maxSteamTempC?: number;          // e.g., 320°C (TWCCEP limit)
  maxSteamRateTpd?: number;        // e.g., 200 TPD
  maxRiskScore?: number;           // e.g., 60 / 100
}

export interface ConstraintEvaluationResult {
  status: 'FEASIBLE' | 'CONSTRAINT_VIOLATED';
  violations: string[];
  satisfiedConstraints: string[];
  tradeoffs: string[];
  violationCount: number;
}

export const DEFAULT_ENGINEERING_CONSTRAINTS: Required<EngineeringConstraintConfig> = {
  maxViscosityCp: 10000,
  minProductionBopd: 8.0,
  maxSpm: 12.0,
  maxSrpLoadIndex: 80.0,
  maxSteamTempC: 320,
  maxSteamRateTpd: 200,
  maxRiskScore: 60,
};

export function evaluateEngineeringConstraints(
  scenarioData: {
    viscosityCp: number;
    productionBopd: number;
    spm: number;
    srpLoadIndex: number;
    steamTempC?: number;
    steamRateTpd?: number;
    riskScore: number;
  },
  userConfig: EngineeringConstraintConfig = {}
): ConstraintEvaluationResult {
  const config = { ...DEFAULT_ENGINEERING_CONSTRAINTS, ...userConfig };
  const violations: string[] = [];
  const satisfiedConstraints: string[] = [];
  const tradeoffs: string[] = [];

  // 1. Viscosity Constraint
  if (config.maxViscosityCp !== undefined) {
    if (scenarioData.viscosityCp > config.maxViscosityCp) {
      violations.push(
        `Viscosity Exceeded: ${scenarioData.viscosityCp.toLocaleString()} cP > ${config.maxViscosityCp.toLocaleString()} cP [USER CONSTRAINT]`
      );
    } else {
      satisfiedConstraints.push(
        `Viscosity Safe: ${scenarioData.viscosityCp.toLocaleString()} cP <= ${config.maxViscosityCp.toLocaleString()} cP`
      );
    }
  }

  // 2. Minimum Production Constraint
  if (config.minProductionBopd !== undefined) {
    if (scenarioData.productionBopd < config.minProductionBopd) {
      violations.push(
        `Production Below Target: ${scenarioData.productionBopd.toFixed(2)} BOPD < ${config.minProductionBopd.toFixed(2)} BOPD [USER CONSTRAINT]`
      );
    } else {
      satisfiedConstraints.push(
        `Production Target Met: ${scenarioData.productionBopd.toFixed(2)} BOPD >= ${config.minProductionBopd.toFixed(2)} BOPD`
      );
    }
  }

  // 3. Maximum SPM Constraint
  if (config.maxSpm !== undefined) {
    if (scenarioData.spm > config.maxSpm) {
      violations.push(
        `Pumping Speed Overload: ${scenarioData.spm} SPM > ${config.maxSpm} SPM [USER CONSTRAINT]`
      );
    } else {
      satisfiedConstraints.push(
        `Pumping Speed Safe: ${scenarioData.spm} SPM <= ${config.maxSpm} SPM`
      );
    }
  }

  // 4. Maximum SRP Load Index Constraint
  if (config.maxSrpLoadIndex !== undefined) {
    if (scenarioData.srpLoadIndex > config.maxSrpLoadIndex) {
      violations.push(
        `SRP Load Index Exceeded: ${scenarioData.srpLoadIndex.toFixed(1)} / 100 > ${config.maxSrpLoadIndex.toFixed(1)} / 100 [USER CONSTRAINT]`
      );
    } else {
      satisfiedConstraints.push(
        `SRP Load Safe: ${scenarioData.srpLoadIndex.toFixed(1)} / 100 <= ${config.maxSrpLoadIndex.toFixed(1)} / 100`
      );
    }
  }

  // 5. Maximum Steam Temperature Constraint (TWCCEP)
  const actualSteamTemp = scenarioData.steamTempC ?? 280;
  if (config.maxSteamTempC !== undefined) {
    if (actualSteamTemp > config.maxSteamTempC) {
      violations.push(
        `Thermal Limit Exceeded: ${actualSteamTemp}°C > ${config.maxSteamTempC}°C (ISO/PAS 12835 TWCCEP) [USER CONSTRAINT]`
      );
    } else {
      satisfiedConstraints.push(
        `Thermal Limit Safe: ${actualSteamTemp}°C <= ${config.maxSteamTempC}°C`
      );
    }
  }

  // 6. Maximum Risk Score Constraint
  if (config.maxRiskScore !== undefined) {
    if (scenarioData.riskScore > config.maxRiskScore) {
      violations.push(
        `System Risk Score Exceeded: ${scenarioData.riskScore}/100 > ${config.maxRiskScore}/100 [USER CONSTRAINT]`
      );
    } else {
      satisfiedConstraints.push(
        `Risk Score Safe: ${scenarioData.riskScore}/100 <= ${config.maxRiskScore}/100`
      );
    }
  }

  // Engineering Trade-offs Identification
  if (scenarioData.productionBopd > 12.0 && scenarioData.srpLoadIndex > 75.0) {
    tradeoffs.push('Higher production rate achieved at the expense of elevated SRP mechanical load index.');
  }
  if (scenarioData.viscosityCp < 1000 && actualSteamTemp > 300) {
    tradeoffs.push('Substantial viscosity reduction achieved via high thermal steam injection, increasing casing thermal elongation stress.');
  }
  if (scenarioData.productionBopd < 8.0 && scenarioData.srpLoadIndex < 60.0) {
    tradeoffs.push('Lower mechanical stress on SRP equipment, but production rate falls below commercial threshold.');
  }

  const status = violations.length === 0 ? 'FEASIBLE' : 'CONSTRAINT_VIOLATED';

  return {
    status,
    violations,
    satisfiedConstraints,
    tradeoffs,
    violationCount: violations.length,
  };
}

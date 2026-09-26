import type {
  ProductionResult,
  ProductionStatus,
  ProductionConfidence,
  ProductionBreakdown,
  ProductionComparisonRow,
} from './types';
import {
  PRODUCTIVITY_MOBILITY_COEFFICIENT,
  DEFAULT_EFFECTIVE_DRAWDOWN_BAR,
  REFERENCE_SPM,
  REFERENCE_STROKE_LENGTH_M,
  REFERENCE_VFD_HZ,
  MAX_ESTIMATED_PRODUCTION_BOPD,
  MIN_ESTIMATED_PRODUCTION_BOPD,
  PRODUCTION_MODEL_ASSUMPTIONS,
} from './defaults';
import { validateProductionInputs } from './validation';

export const calculateProductionModel = (
  oilMobilityDcp: number,
  temperatureC: number,
  viscosityCp: number,
  effectiveDrawdownBar: number = DEFAULT_EFFECTIVE_DRAWDOWN_BAR,
  vfdFrequencyHz: number = REFERENCE_VFD_HZ,
  spm: number = REFERENCE_SPM,
  strokeLengthM: number = REFERENCE_STROKE_LENGTH_M,
  baselineProductionInputBopd?: number
): ProductionResult => {
  const validation = validateProductionInputs(
    oilMobilityDcp,
    effectiveDrawdownBar,
    vfdFrequencyHz,
    spm,
    strokeLengthM
  );
  const warnings: string[] = [...validation.warnings];

  // Handle invalid inputs safely
  if (!validation.isValid) {
    const fallbackBopd = 0.0;
    return {
      estimatedProductionBopd: fallbackBopd,
      productionUnit: 'BOPD',
      baselineProductionBopd: fallbackBopd,
      productionChangeBopd: 0.0,
      productionChangePercent: 0.0,
      oilMobilityDcp: Math.max(0.0001, oilMobilityDcp || 0.0005),
      effectiveDrawdownBar: Math.max(0, effectiveDrawdownBar || 30.0),
      productivityIndexBopdBar: 0.0,
      pumpOperationFactor: 1.0,
      temperatureC: temperatureC || 48.0,
      viscosityCp: viscosityCp || 15000.0,
      status: 'INVALID',
      confidence: 'LOW',
      modelType: 'Baghewala Heavy-Oil Screening Production Model',
      warnings: validation.errors,
      assumptions: PRODUCTION_MODEL_ASSUMPTIONS,
      breakdown: {
        temperatureC: temperatureC || 48.0,
        viscosityCp: viscosityCp || 15000.0,
        oilMobilityDcp: oilMobilityDcp || 0.0005,
        productivityIndexBopdBar: 0.0,
        effectiveDrawdownBar: effectiveDrawdownBar || 30.0,
        pumpOperationFactor: 1.0,
        unconstrainedFlowBopd: 0.0,
        estimatedProductionBopd: fallbackBopd,
        baselineProductionBopd: fallbackBopd,
        productionChangeBopd: 0.0,
        productionChangePercent: 0.0,
      },
      inputSources: {
        mobility: 'derived',
        drawdown: 'assumption',
        pumpOperation: 'scenario',
        calibrationFactor: 'assumption',
      },
      calculatedAt: new Date().toISOString(),
    };
  }

  // 1. Productivity Index calculation (J_o = C_prod * oilMobilityDcp)
  const productivityIndexBopdBar = Number(
    (PRODUCTIVITY_MOBILITY_COEFFICIENT * oilMobilityDcp).toFixed(4)
  );

  // 2. Normalized Pump Operation Factor
  const normSpm = spm / REFERENCE_SPM;
  const normStroke = strokeLengthM / REFERENCE_STROKE_LENGTH_M;
  const normVfd = Math.sqrt(Math.max(0.1, vfdFrequencyHz / REFERENCE_VFD_HZ));

  const rawPumpFactor = normSpm * normStroke * normVfd;
  const pumpOperationFactor = Number(
    Math.min(2.5, Math.max(0.2, rawPumpFactor)).toFixed(3)
  );

  // 3. Unconstrained Potential & Estimated Production
  const unconstrainedFlowBopd = productivityIndexBopdBar * effectiveDrawdownBar;
  let rawProductionBopd = unconstrainedFlowBopd * pumpOperationFactor;

  // Clamping and safety bounds
  if (rawProductionBopd > MAX_ESTIMATED_PRODUCTION_BOPD) {
    rawProductionBopd = MAX_ESTIMATED_PRODUCTION_BOPD;
    warnings.push(
      `Estimated production (${rawProductionBopd.toFixed(1)} BOPD) reached prototype safety ceiling (${MAX_ESTIMATED_PRODUCTION_BOPD} BOPD) and was clamped.`
    );
  } else if (rawProductionBopd < MIN_ESTIMATED_PRODUCTION_BOPD) {
    rawProductionBopd = MIN_ESTIMATED_PRODUCTION_BOPD;
  }

  const estimatedProductionBopd = Number(rawProductionBopd.toFixed(2));

  // 4. Baseline Production comparison
  const baselineProductionBopd = baselineProductionInputBopd ?? 0.75; // Default unheated baseline ~0.75 BOPD
  const productionChangeBopd = Number((estimatedProductionBopd - baselineProductionBopd).toFixed(2));

  let productionChangePercent = 0.0;
  if (baselineProductionBopd > 0) {
    productionChangePercent = Number(
      (((estimatedProductionBopd - baselineProductionBopd) / baselineProductionBopd) * 100).toFixed(1)
    );
  }

  const status: ProductionStatus = warnings.length > 1 ? 'WARNING' : 'VALID';
  const confidence: ProductionConfidence = 'MEDIUM';

  const breakdown: ProductionBreakdown = {
    temperatureC: Number(temperatureC.toFixed(1)),
    viscosityCp: Number(viscosityCp.toFixed(1)),
    oilMobilityDcp: Number(oilMobilityDcp.toFixed(6)),
    productivityIndexBopdBar,
    effectiveDrawdownBar: Number(effectiveDrawdownBar.toFixed(1)),
    pumpOperationFactor,
    unconstrainedFlowBopd: Number(unconstrainedFlowBopd.toFixed(2)),
    estimatedProductionBopd,
    baselineProductionBopd,
    productionChangeBopd,
    productionChangePercent,
  };

  return {
    estimatedProductionBopd,
    productionUnit: 'BOPD',
    baselineProductionBopd,
    productionChangeBopd,
    productionChangePercent,
    oilMobilityDcp: Number(oilMobilityDcp.toFixed(6)),
    effectiveDrawdownBar: Number(effectiveDrawdownBar.toFixed(1)),
    productivityIndexBopdBar,
    pumpOperationFactor,
    temperatureC: Number(temperatureC.toFixed(1)),
    viscosityCp: Number(viscosityCp.toFixed(1)),
    status,
    confidence,
    modelType: 'Baghewala Heavy-Oil Screening Production Model',
    warnings,
    assumptions: PRODUCTION_MODEL_ASSUMPTIONS,
    breakdown,
    inputSources: {
      mobility: 'derived',
      drawdown: 'assumption',
      pumpOperation: 'scenario',
      calibrationFactor: 'assumption',
    },
    calculatedAt: new Date().toISOString(),
  };
};

export const compareProductionResults = (
  baselineResult: ProductionResult,
  scenarioResult: ProductionResult
): ProductionComparisonRow[] => {
  return [
    {
      parameter: 'Effective Drawdown',
      unit: 'bar',
      baselineValue: baselineResult.effectiveDrawdownBar,
      scenarioValue: scenarioResult.effectiveDrawdownBar,
      delta: Number((scenarioResult.effectiveDrawdownBar - baselineResult.effectiveDrawdownBar).toFixed(1)),
      percentChange: 0,
      sourceType: 'assumption',
    },
    {
      parameter: 'Pump Operation Factor',
      unit: 'factor',
      baselineValue: baselineResult.pumpOperationFactor,
      scenarioValue: scenarioResult.pumpOperationFactor,
      delta: Number((scenarioResult.pumpOperationFactor - baselineResult.pumpOperationFactor).toFixed(3)),
      percentChange: Number((((scenarioResult.pumpOperationFactor - baselineResult.pumpOperationFactor) / baselineResult.pumpOperationFactor) * 100).toFixed(1)),
      sourceType: 'scenario',
    },
    {
      parameter: 'Estimated Oil Production',
      unit: 'BOPD',
      baselineValue: baselineResult.estimatedProductionBopd,
      scenarioValue: scenarioResult.estimatedProductionBopd,
      delta: scenarioResult.productionChangeBopd,
      percentChange: scenarioResult.productionChangePercent,
      sourceType: 'derived',
    },
  ];
};

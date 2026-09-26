import { evaluateSRPCandidate } from './srpOptimizationModel';
import { OPERATION_BOUNDS, MODEL_ASSUMPTIONS, MODEL_DISCLAIMERS } from './defaults';
import type { OptimizationCandidate, OptimizationComparisonRow, OptimizationResult, OperatingWindow, SRPOptimizationInput } from './types';

export function optimizeSRP(input: SRPOptimizationInput): OptimizationResult {
  const currentCandidate = evaluateSRPCandidate(input);
  const candidates: OptimizationCandidate[] = [];

  let safeCandidatesCount = 0;
  let cautionCandidatesCount = 0;
  let highLoadCandidatesCount = 0;

  let minVFD: number = OPERATION_BOUNDS.vfd.max;
  let maxVFD: number = OPERATION_BOUNDS.vfd.min;
  let minSPM: number = OPERATION_BOUNDS.spm.max;
  let maxSPM: number = OPERATION_BOUNDS.spm.min;
  let minStroke: number = OPERATION_BOUNDS.stroke.max;
  let maxStroke: number = OPERATION_BOUNDS.stroke.min;

  // Grid search
  for (let vfd = OPERATION_BOUNDS.vfd.min; vfd <= OPERATION_BOUNDS.vfd.max; vfd += OPERATION_BOUNDS.vfd.step) {
    for (let spm = OPERATION_BOUNDS.spm.min; spm <= OPERATION_BOUNDS.spm.max; spm += OPERATION_BOUNDS.spm.step) {
      for (let stroke = OPERATION_BOUNDS.stroke.min; stroke <= OPERATION_BOUNDS.stroke.max; stroke += OPERATION_BOUNDS.stroke.step) {
        const candidateInput: SRPOptimizationInput = {
          ...input,
          vfdFrequencyHz: vfd,
          spm,
          strokeLengthM: stroke,
        };

        const candidate = evaluateSRPCandidate(candidateInput);
        candidates.push(candidate);

        if (candidate.status === 'NORMAL') safeCandidatesCount++;
        else if (candidate.status === 'CAUTION') cautionCandidatesCount++;
        else if (candidate.status === 'HIGH_LOAD') highLoadCandidatesCount++;

        if (candidate.isValid) {
          if (vfd < minVFD) minVFD = vfd;
          if (vfd > maxVFD) maxVFD = vfd;
          if (spm < minSPM) minSPM = spm;
          if (spm > maxSPM) maxSPM = spm;
          if (stroke < minStroke) minStroke = stroke;
          if (stroke > maxStroke) maxStroke = stroke;
        }
      }
    }
  }

  // Find optimal candidate
  const validCandidates = candidates.filter((c) => c.isValid);
  let optimalCandidate: OptimizationCandidate;

  if (validCandidates.length > 0) {
    optimalCandidate = validCandidates.reduce((best, curr) =>
      curr.efficiencyIndex > best.efficiencyIndex ? curr : best
    );
  } else {
    optimalCandidate = candidates.reduce((best, curr) =>
      curr.loadIndex < best.loadIndex ? curr : best
    );
  }

  const operatingWindow: OperatingWindow = {
    minVFD: minVFD <= maxVFD ? minVFD : OPERATION_BOUNDS.vfd.min,
    maxVFD: minVFD <= maxVFD ? maxVFD : OPERATION_BOUNDS.vfd.max,
    minSPM: minSPM <= maxSPM ? minSPM : OPERATION_BOUNDS.spm.min,
    maxSPM: minSPM <= maxSPM ? maxSPM : OPERATION_BOUNDS.spm.max,
    minStroke: minStroke <= maxStroke ? minStroke : OPERATION_BOUNDS.stroke.min,
    maxStroke: minStroke <= maxStroke ? maxStroke : OPERATION_BOUNDS.stroke.max,
    safeCandidatesCount,
    cautionCandidatesCount,
    highLoadCandidatesCount,
    totalCandidatesCount: candidates.length,
  };

  const productionDeltaBopd = Number(
    (optimalCandidate.estimatedProductionBopd - currentCandidate.estimatedProductionBopd).toFixed(2)
  );

  let productionDeltaPercent = 0.0;
  if (currentCandidate.estimatedProductionBopd > 0) {
    productionDeltaPercent = Number(
      ((productionDeltaBopd / currentCandidate.estimatedProductionBopd) * 100).toFixed(1)
    );
  }

  const loadDeltaIndex = Number(
    (optimalCandidate.loadIndex - currentCandidate.loadIndex).toFixed(2)
  );

  const efficiencyDelta = Number(
    (optimalCandidate.efficiencyIndex - currentCandidate.efficiencyIndex).toFixed(4)
  );

  const isOptimized =
    optimalCandidate.vfdFrequencyHz !== currentCandidate.vfdFrequencyHz ||
    optimalCandidate.spm !== currentCandidate.spm ||
    optimalCandidate.strokeLengthM !== currentCandidate.strokeLengthM;

  const warnings: string[] = [];
  if (currentCandidate.status === 'HIGH_LOAD') {
    warnings.push(`Current operating point is in HIGH LOAD status (Load Index: ${currentCandidate.loadIndex}). Optimization recommended.`);
  }

  return {
    currentCandidate,
    optimalCandidate,
    candidates,
    operatingWindow,
    productionDeltaBopd,
    productionDeltaPercent,
    loadDeltaIndex,
    efficiencyDelta,
    status: currentCandidate.status,
    isOptimized,
    warnings,
    assumptions: [...MODEL_ASSUMPTIONS],
    disclaimers: [...MODEL_DISCLAIMERS],
    modelType: 'Baghewala SRP + VFD Optimization Engine',
    calculatedAt: new Date().toISOString(),
    inputSources: {
      vfdFrequency: 'scenario',
      spm: 'scenario',
      strokeLength: 'scenario',
      loadIndexModel: 'derived',
      gridSearchModel: 'derived',
    },
  };
}

export function compareOptimizationResults(
  result: OptimizationResult
): OptimizationComparisonRow[] {
  const cur = result.currentCandidate;
  const opt = result.optimalCandidate;

  return [
    {
      parameter: 'VFD Frequency',
      unit: 'Hz',
      currentValue: cur.vfdFrequencyHz,
      optimizedValue: opt.vfdFrequencyHz,
      delta: Number((opt.vfdFrequencyHz - cur.vfdFrequencyHz).toFixed(1)),
      percentChange: cur.vfdFrequencyHz > 0 ? Number((((opt.vfdFrequencyHz - cur.vfdFrequencyHz) / cur.vfdFrequencyHz) * 100).toFixed(1)) : 0,
      sourceType: 'scenario',
    },
    {
      parameter: 'Surface SPM',
      unit: 'SPM',
      currentValue: cur.spm,
      optimizedValue: opt.spm,
      delta: Number((opt.spm - cur.spm).toFixed(1)),
      percentChange: cur.spm > 0 ? Number((((opt.spm - cur.spm) / cur.spm) * 100).toFixed(1)) : 0,
      sourceType: 'scenario',
    },
    {
      parameter: 'Stroke Length',
      unit: 'm',
      currentValue: cur.strokeLengthM,
      optimizedValue: opt.strokeLengthM,
      delta: Number((opt.strokeLengthM - cur.strokeLengthM).toFixed(2)),
      percentChange: cur.strokeLengthM > 0 ? Number((((opt.strokeLengthM - cur.strokeLengthM) / cur.strokeLengthM) * 100).toFixed(1)) : 0,
      sourceType: 'scenario',
    },
    {
      parameter: 'Pump Operation Factor',
      unit: 'factor',
      currentValue: cur.pumpCapacityFactor,
      optimizedValue: opt.pumpCapacityFactor,
      delta: Number((opt.pumpCapacityFactor - cur.pumpCapacityFactor).toFixed(3)),
      percentChange: cur.pumpCapacityFactor > 0 ? Number((((opt.pumpCapacityFactor - cur.pumpCapacityFactor) / cur.pumpCapacityFactor) * 100).toFixed(1)) : 0,
      sourceType: 'derived',
    },
    {
      parameter: 'Operating Load Index',
      unit: 'index (0-100)',
      currentValue: cur.loadIndex,
      optimizedValue: opt.loadIndex,
      delta: result.loadDeltaIndex,
      percentChange: cur.loadIndex > 0 ? Number(((result.loadDeltaIndex / cur.loadIndex) * 100).toFixed(1)) : 0,
      sourceType: 'derived',
    },
    {
      parameter: 'Efficiency Index',
      unit: 'index',
      currentValue: cur.efficiencyIndex,
      optimizedValue: opt.efficiencyIndex,
      delta: result.efficiencyDelta,
      percentChange: cur.efficiencyIndex > 0 ? Number(((result.efficiencyDelta / cur.efficiencyIndex) * 100).toFixed(1)) : 0,
      sourceType: 'derived',
    },
    {
      parameter: 'Estimated Production',
      unit: 'BOPD',
      currentValue: cur.estimatedProductionBopd,
      optimizedValue: opt.estimatedProductionBopd,
      delta: result.productionDeltaBopd,
      percentChange: result.productionDeltaPercent,
      sourceType: 'derived',
    },
  ];
}

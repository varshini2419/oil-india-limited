export interface CoolingTimelineInput {
  initialTemperatureC: number;
  initialViscosityCp: number;
  initialProductionBopd: number;
  baselineSpm: number;
  baselineStrokeLengthM: number;
  baselineVfdHz: number;
  coolingRateCPerDay?: number;
}

export interface CoolingTimelinePoint {
  daysAfterSteam: number;
  temperatureC: number;
  viscosityCp: number;
  productionBopd: number;
  recommendedSpm: number;
  recommendedStrokeLengthM: number;
  recommendedVfdHz: number;
  reason: string;
  provenance: 'MODELED' | 'ASSUMPTION';
}

export function buildCssCoolingTimeline(input: CoolingTimelineInput): CoolingTimelinePoint[] {
  const coolingRate = input.coolingRateCPerDay ?? 1.8;
  return [0, 3, 7, 14, 21, 30].map((daysAfterSteam) => {
    const temperatureC = Math.max(30, input.initialTemperatureC - coolingRate * daysAfterSteam);
    const viscosityCp = input.initialViscosityCp * Math.exp((input.initialTemperatureC - temperatureC) * 0.028);
    const productionBopd = input.initialProductionBopd * Math.max(0.45, 1 - (viscosityCp / input.initialViscosityCp - 1) * 0.32);
    const speedFactor = Math.max(0.72, 1 - daysAfterSteam / 115);
    return {
      daysAfterSteam,
      temperatureC: Number(temperatureC.toFixed(1)),
      viscosityCp: Math.round(viscosityCp),
      productionBopd: Number(productionBopd.toFixed(1)),
      recommendedSpm: Number((input.baselineSpm * speedFactor).toFixed(1)),
      recommendedStrokeLengthM: Number(Math.max(1.8, input.baselineStrokeLengthM * (0.96 - daysAfterSteam / 300)).toFixed(2)),
      recommendedVfdHz: Number(Math.max(42, input.baselineVfdHz * speedFactor).toFixed(1)),
      reason: daysAfterSteam === 0
        ? 'Start at the post-steam setpoint while pump fill is strongest.'
        : 'Reduce lift demand as cooling raises viscosity and rod-floating risk.',
      provenance: coolingRate === 1.8 ? 'ASSUMPTION' : 'MODELED',
    };
  });
}

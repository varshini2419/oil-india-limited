export interface CycleEconomicsInputs {
  steamInjectedTonnes: number;
  oilProducedBarrels: number;
  steamRateTpd: number;
  steamQualityFraction: number;
  steamEnergyPerTonneKwh?: number;
  vfdFrequencyHz: number;
  loadIndex: number;
  productionBopd: number;
  steamCostPerTonne?: number;
  powerTariffPerKwh?: number;
}

export interface CycleEconomicsResult {
  sor: number;
  pumpEnergyKwhPerDay: number;
  steamEnergyKwhPerDay: number;
  energyKwhPerBarrel: number;
  operatingCostPerBarrel: number;
  assumptions: string[];
  provenance: 'MODELED';
}

export function calculateCycleEconomics(inputs: CycleEconomicsInputs): CycleEconomicsResult {
  const steamEnergyPerTonneKwh = inputs.steamEnergyPerTonneKwh ?? 680;
  const steamCostPerTonne = inputs.steamCostPerTonne ?? 18;
  const powerTariffPerKwh = inputs.powerTariffPerKwh ?? 0.11;
  const oilProduced = Math.max(inputs.oilProducedBarrels, 0.01);
  const pumpEnergyKwhPerDay = Math.max(0, inputs.vfdFrequencyHz / 50 * inputs.loadIndex / 100 * 24 * 18);
  const steamEnergyKwhPerDay = Math.max(0, inputs.steamRateTpd * inputs.steamQualityFraction * steamEnergyPerTonneKwh);
  const energyKwhPerBarrel = (pumpEnergyKwhPerDay + steamEnergyKwhPerDay) / Math.max(inputs.productionBopd, 0.01);
  const operatingCostPerBarrel = (inputs.steamRateTpd * steamCostPerTonne + pumpEnergyKwhPerDay * powerTariffPerKwh) / Math.max(inputs.productionBopd, 0.01);

  return {
    sor: inputs.steamInjectedTonnes / oilProduced,
    pumpEnergyKwhPerDay,
    steamEnergyKwhPerDay,
    energyKwhPerBarrel,
    operatingCostPerBarrel,
    assumptions: [
      `Steam energy assumed ${steamEnergyPerTonneKwh} kWh/t`,
      `Steam cost assumed ${steamCostPerTonne} currency/t`,
      `Power tariff assumed ${powerTariffPerKwh} currency/kWh`,
    ],
    provenance: 'MODELED',
  };
}

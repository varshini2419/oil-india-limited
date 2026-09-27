import type { DemonstrationScenario, DemoScenarioId } from './types';
import { calculateThermalModel } from '../simulation/thermal/thermalModel';
import { calculateViscosityModel } from '../simulation/viscosity/viscosityModel';
import { calculateMobilityModel } from '../simulation/mobility/mobilityModel';
import { calculateProductionModel } from '../simulation/production/productionModel';
import { evaluateRiskModel } from '../simulation/riskEngine/riskModel';
import { createScenario } from '../simulation/scenario/scenarioEngine';
import { BASELINE_INPUT_VALUES } from '../simulation/scenario/defaults';
import { validateAndNormalizeSchema } from '../simulation/fieldIntegration/telemetrySchemaEngine';
import { evaluateLiveDataQuality } from '../simulation/fieldIntegration/liveDataQualityEngine';

export function generateDemonstrationScenarios(): DemonstrationScenario[] {
  // Helper to execute existing physics pipeline deterministically
  const runDemoPipeline = (
    id: DemoScenarioId,
    title: string,
    description: string,
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
    }
  ): DemonstrationScenario => {
    const scenarioObj = createScenario(title, description, {
      ...BASELINE_INPUT_VALUES,
      ambientTemperatureC: 40,
      reservoirTemperatureC: inputs.reservoirTemperatureC,
      reservoirPressureBar: inputs.reservoirPressureBar,
      waterCutPercent: inputs.waterCutPercent,
      steamInjectionRateTpd: inputs.steamRateTpd,
      steamQualityPercent: 80,
      soakDurationDays: 3,
      vfdFrequencyHz: inputs.vfdFrequencyHz,
      spm: inputs.spm,
      strokeLengthMeters: inputs.strokeLengthMeters,
    });

    const thermalRes = calculateThermalModel(scenarioObj);
    const tempC = thermalRes.predictedReservoirTemperatureC || inputs.reservoirTemperatureC;
    const viscRes = calculateViscosityModel(tempC);
    const viscCp = viscRes.estimatedViscosityCp || 5014.1;

    const mobRes = calculateMobilityModel(viscCp, tempC, 2.5);
    const mobDcP = mobRes.mobilityDcP || 0.0005;

    const prodRes = calculateProductionModel(
      mobDcP,
      tempC,
      viscCp,
      inputs.reservoirPressureBar,
      inputs.vfdFrequencyHz,
      inputs.spm,
      inputs.strokeLengthMeters
    );

    const srpLoadIndex = Math.min(100, Math.max(10, (inputs.vfdFrequencyHz / 50) * (inputs.spm / 10) * 78.5));

    const riskRes = evaluateRiskModel({
      temperatureC: tempC,
      viscosityCp: viscCp,
      mobilityDPerCp: mobDcP,
      productionBopd: prodRes.estimatedProductionBopd,
      vfdFrequencyHz: inputs.vfdFrequencyHz,
      spm: inputs.spm,
      strokeLengthMeters: inputs.strokeLengthMeters,
      steamInjectionRateTpd: inputs.steamRateTpd,
      srpLoadIndex,
      cssThermalGainC: tempC - inputs.reservoirTemperatureC,
    });

    // Evaluate telemetry quality via field integration schema engine
    const rawData = inputs.simulateCorruptData
      ? { temperature: 'INVALID_NaN', pressure: -10 }
      : {
          timestamp: inputs.simulateStaleTimestamp
            ? new Date(Date.now() - 600 * 1000).toISOString()
            : new Date().toISOString(),
          wellId: 'BW-DEMO-01',
          temperature: inputs.reservoirTemperatureC,
          pressure: inputs.reservoirPressureBar,
          production: prodRes.estimatedProductionBopd,
          viscosity: viscCp,
          vfdHz: inputs.vfdFrequencyHz,
          spm: inputs.spm,
          strokeM: inputs.strokeLengthMeters,
        };

    const normRec = validateAndNormalizeSchema(rawData, 'SIMULATED', 'SIMULATED TELEMETRY');
    const qualityRes = evaluateLiveDataQuality(normRec);

    let summary = 'Nominal operating envelope. Advisory monitoring active.';
    if (inputs.simulateCorruptData) {
      summary = 'Data quality alert triggered. Malformed/out-of-range sensor readings rejected by integration gate.';
    } else if (viscCp > 10000) {
      summary = 'High crude viscosity spike detected (>10,000 cP). Recommended Action: Initiate CSS steam thermal soak cycle.';
    } else if (srpLoadIndex > 85) {
      summary = 'Elevated SRP mechanical rod stress. Recommended Action: Reduce VFD drive frequency to 48 Hz.';
    }

    return {
      id,
      title,
      category: 'SIMULATED DEMONSTRATION SCENARIO',
      description,
      inputs,
      expectedResults: {
        modeledTemperatureC: Number(tempC.toFixed(1)),
        estimatedViscosityCp: Number(viscCp.toFixed(1)),
        oilMobilityDcP: Number(mobDcP.toFixed(5)),
        estimatedProductionBopd: Number((prodRes.estimatedProductionBopd || 0.75).toFixed(2)),
        srpLoadIndex: Number(srpLoadIndex.toFixed(1)),
        riskLevel: riskRes.riskLevel,
        dataQualityStatus: qualityRes.status,
      },
      decisionSupportSummary: summary,
    };
  };

  return [
    runDemoPipeline(
      'SCENARIO_A_NORMAL',
      'Scenario A: Nominal Heated Operating Baseline',
      'Standard Baghewala operating state with CSS steam injection maintaining reservoir temperature ~58°C and steady SRP inflow.',
      {
        reservoirTemperatureC: 58,
        reservoirPressureBar: 35,
        steamRateTpd: 80,
        vfdFrequencyHz: 45,
        spm: 6.5,
        strokeLengthMeters: 2.5,
        waterCutPercent: 15,
      }
    ),
    runDemoPipeline(
      'SCENARIO_B_VISCOSITY_SPIKE',
      'Scenario B: Cool Reservoir & Heavy Crude Viscosity Spike',
      'Cool reservoir condition (48°C) causing heavy crude viscosity spike above 13,000 cP and severe inflow restriction.',
      {
        reservoirTemperatureC: 48,
        reservoirPressureBar: 35,
        steamRateTpd: 0,
        vfdFrequencyHz: 45,
        spm: 6.5,
        strokeLengthMeters: 2.5,
        waterCutPercent: 15,
      }
    ),
    runDemoPipeline(
      'SCENARIO_C_THERMAL_DEGRADATION',
      'Scenario C: Thermal Soak Dissipation & High Mechanical Load',
      'Insufficient thermal gain combined with elevated SPM pump speed (11.5) testing sucker rod mechanical load limits.',
      {
        reservoirTemperatureC: 50,
        reservoirPressureBar: 30,
        steamRateTpd: 30,
        vfdFrequencyHz: 55,
        spm: 11.5,
        strokeLengthMeters: 2.8,
        waterCutPercent: 20,
      }
    ),
    runDemoPipeline(
      'SCENARIO_D_POOR_DATA_QUALITY',
      'Scenario D: Corrupt Sensor & Telemetry Quality Failure',
      'Malformed sensor measurements and missing metric telemetry stream testing system error resilience and data rejection gates.',
      {
        reservoirTemperatureC: 58,
        reservoirPressureBar: 35,
        steamRateTpd: 80,
        vfdFrequencyHz: 45,
        spm: 6.5,
        strokeLengthMeters: 2.5,
        waterCutPercent: 15,
        simulateCorruptData: true,
      }
    ),
  ];
}

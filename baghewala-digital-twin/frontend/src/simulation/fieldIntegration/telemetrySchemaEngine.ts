import type {
  NormalizedFieldTelemetryRecord,
  TelemetryMode,
  TelemetryProvenanceLabel,
} from './types';

export function parseNumericField(
  val: unknown,
  unit?: string,
  fieldCategory?: 'temp' | 'pressure' | 'prod' | 'visc' | 'rate'
): { value: number | null; warning?: string } {
  if (val === null || val === undefined || val === '') {
    return { value: null };
  }

  let num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num) || !isFinite(num)) {
    return { value: null, warning: `Invalid non-numeric value '${String(val)}' provided` };
  }

  let warning: string | undefined;

  // Unit Normalization Logic
  if (unit) {
    const normUnit = unit.trim().toLowerCase();

    if (fieldCategory === 'temp') {
      if (normUnit === '°f' || normUnit === 'f' || normUnit === 'fahrenheit') {
        num = (num - 32) * (5 / 9);
      } else if (normUnit === 'k' || normUnit === 'kelvin') {
        num = num - 273.15;
      }
    } else if (fieldCategory === 'pressure') {
      if (normUnit === 'psi') {
        num = num * 0.0689476;
      } else if (normUnit === 'mpa') {
        num = num * 10.0;
      } else if (normUnit === 'kpa') {
        num = num * 0.01;
      }
    } else if (fieldCategory === 'prod') {
      if (normUnit === 'm3/day' || normUnit === 'm3/d' || normUnit === 'm3d') {
        num = num * 6.28981;
      }
    } else if (fieldCategory === 'rate') {
      if (normUnit === 'kg/day' || normUnit === 'kg/d') {
        num = num / 1000.0;
      }
    }
  }

  return { value: Number(num.toFixed(4)), warning };
}

export function validateAndNormalizeSchema(
  rawInput: Record<string, unknown>,
  mode: TelemetryMode,
  provenanceLabel: TelemetryProvenanceLabel,
  nowIso?: string
): NormalizedFieldTelemetryRecord {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Parse Timestamp
  let timestamp = String(rawInput.timestamp || rawInput.time || nowIso || new Date().toISOString());
  const parsedTime = new Date(timestamp).getTime();
  if (isNaN(parsedTime)) {
    warnings.push(`Invalid timestamp string '${timestamp}'; resetting to current ISO time.`);
    timestamp = nowIso || new Date().toISOString();
  }

  // Parse Well ID
  const wellId = String(rawInput.wellId || rawInput.well_id || 'BW-01');

  // Temperature (°C)
  const tempRes = parseNumericField(
    rawInput.temperature ?? rawInput.reservoirTemperature ?? rawInput.temp,
    String(rawInput.temperatureUnit ?? rawInput.tempUnit ?? '°C'),
    'temp'
  );
  if (tempRes.warning) warnings.push(tempRes.warning);
  if (tempRes.value === null) missingFields.push('temperature');

  // Pressure (bar)
  const pressRes = parseNumericField(
    rawInput.pressure ?? rawInput.reservoirPressure ?? rawInput.press,
    String(rawInput.pressureUnit ?? rawInput.pressUnit ?? 'bar'),
    'pressure'
  );
  if (pressRes.warning) warnings.push(pressRes.warning);
  if (pressRes.value === null) missingFields.push('pressure');

  // Production (BOPD)
  const prodRes = parseNumericField(
    rawInput.production ?? rawInput.productionBopd ?? rawInput.oilRate,
    String(rawInput.productionUnit ?? rawInput.prodUnit ?? 'BOPD'),
    'prod'
  );
  if (prodRes.warning) warnings.push(prodRes.warning);
  if (prodRes.value === null) missingFields.push('productionBopd');

  // Viscosity (cP)
  const viscRes = parseNumericField(
    rawInput.viscosity ?? rawInput.viscosityCp ?? rawInput.visc,
    String(rawInput.viscosityUnit ?? 'cP'),
    'visc'
  );
  if (viscRes.warning) warnings.push(viscRes.warning);
  if (viscRes.value === null) missingFields.push('viscosity');

  // Oil Mobility (D/cP)
  const mobRes = parseNumericField(rawInput.mobility ?? rawInput.oilMobility, undefined);
  if (mobRes.warning) warnings.push(mobRes.warning);
  if (mobRes.value === null) missingFields.push('mobility');

  // VFD Frequency (Hz)
  const vfdRes = parseNumericField(rawInput.vfdHz ?? rawInput.vfdFrequency, undefined);
  if (vfdRes.warning) warnings.push(vfdRes.warning);
  if (vfdRes.value === null) missingFields.push('vfdFrequencyHz');

  // Strokes Per Minute (SPM)
  const spmRes = parseNumericField(rawInput.spm ?? rawInput.strokesPerMinute, undefined);
  if (spmRes.warning) warnings.push(spmRes.warning);
  if (spmRes.value === null) missingFields.push('spm');

  // Stroke Length (m)
  const strokeRes = parseNumericField(
    rawInput.strokeM ?? rawInput.strokeLengthMeters ?? rawInput.strokeLength,
    String(rawInput.strokeUnit ?? 'm')
  );
  if (strokeRes.warning) warnings.push(strokeRes.warning);
  if (strokeRes.value === null) missingFields.push('strokeLengthMeters');

  // Steam Rate (TPD)
  const steamRes = parseNumericField(
    rawInput.steamRateTpd ?? rawInput.steamRate,
    String(rawInput.steamRateUnit ?? 'TPD'),
    'rate'
  );
  if (steamRes.warning) warnings.push(steamRes.warning);
  if (steamRes.value === null) missingFields.push('steamRateTpd');

  // Steam Quality (fraction)
  const steamQualRes = parseNumericField(rawInput.steamQuality, undefined);
  if (steamQualRes.warning) warnings.push(steamQualRes.warning);
  if (steamQualRes.value === null) missingFields.push('steamQuality');

  // Water Cut (%)
  const waterCutRes = parseNumericField(rawInput.waterCut ?? rawInput.waterCutPercent, undefined);
  if (waterCutRes.warning) warnings.push(waterCutRes.warning);

  // Motor Load (%)
  const motorLoadRes = parseNumericField(rawInput.motorLoad ?? rawInput.motorLoadPercent, undefined);
  if (motorLoadRes.warning) warnings.push(motorLoadRes.warning);

  const recordId = `REC-${mode}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    recordId,
    timestamp,
    wellId,
    mode,
    provenanceLabel,
    temperatureC: tempRes.value,
    pressureBar: pressRes.value,
    productionBopd: prodRes.value,
    viscosityCp: viscRes.value,
    mobilityDcP: mobRes.value,
    vfdFrequencyHz: vfdRes.value,
    spm: spmRes.value,
    strokeLengthMeters: strokeRes.value,
    steamRateTpd: steamRes.value,
    steamQuality: steamQualRes.value,
    waterCutPercent: waterCutRes.value,
    motorLoadPercent: motorLoadRes.value,
    rawInput,
    missingFields,
    warnings,
  };
}

import type { TelemetryValue, ValueProvenance, RawTelemetryInput, FieldDataSource, NormalizedTelemetryRecord } from './types';
import { TARGET_UNITS } from './defaults';

export interface NormalizedValueResult<T = number> {
  normalized: TelemetryValue<T>;
  warning?: string;
  isUnsupportedUnit?: boolean;
}

export function normalizeValue(
  val: number,
  unit?: string,
  category?: keyof typeof TARGET_UNITS,
  defaultProvenance: ValueProvenance = 'MEASURED'
): NormalizedValueResult<number> {
  if (val === undefined || val === null || isNaN(val)) {
    return {
      normalized: {
        value: NaN,
        provenance: defaultProvenance,
      },
    };
  }

  // Handle absent unit
  if (!unit || unit.trim() === '') {
    const targetUnit = category ? TARGET_UNITS[category] : undefined;
    return {
      normalized: {
        value: val,
        unit: targetUnit,
        provenance: 'UNIT_UNKNOWN',
        originalValue: val,
      },
      warning: `Unit metadata absent for category "${category ?? 'generic'}". Value marked as UNIT_UNKNOWN.`,
    };
  }

  const cleanUnit = unit.trim();
  const lowerUnit = cleanUnit.toLowerCase();

  // Category 1: Temperature (°C, °F, K)
  if (category === 'temperature' || lowerUnit === 'c' || lowerUnit === '°c' || lowerUnit === 'deg c' || lowerUnit === 'f' || lowerUnit === '°f' || lowerUnit === 'deg f' || lowerUnit === 'k') {
    if (lowerUnit === 'c' || lowerUnit === '°c' || lowerUnit === 'deg c' || lowerUnit === 'celsius') {
      return {
        normalized: {
          value: Number(val.toFixed(2)),
          unit: TARGET_UNITS.temperature,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
      };
    }
    if (lowerUnit === 'f' || lowerUnit === '°f' || lowerUnit === 'deg f' || lowerUnit === 'fahrenheit') {
      const converted = (val - 32) * (5 / 9);
      return {
        normalized: {
          value: Number(converted.toFixed(2)),
          unit: TARGET_UNITS.temperature,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
        warning: `Converted temperature from ${val} ${cleanUnit} to ${converted.toFixed(2)} °C.`,
      };
    }
    if (lowerUnit === 'k' || lowerUnit === 'kelvin') {
      const converted = val - 273.15;
      return {
        normalized: {
          value: Number(converted.toFixed(2)),
          unit: TARGET_UNITS.temperature,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
        warning: `Converted temperature from ${val} K to ${converted.toFixed(2)} °C.`,
      };
    }
  }

  // Category 2: Pressure (bar, psi, MPa)
  if (category === 'pressure' || lowerUnit === 'bar' || lowerUnit === 'psi' || lowerUnit === 'mpa') {
    if (lowerUnit === 'bar') {
      return {
        normalized: {
          value: Number(val.toFixed(2)),
          unit: TARGET_UNITS.pressure,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
      };
    }
    if (lowerUnit === 'psi') {
      const converted = val / 14.5038;
      return {
        normalized: {
          value: Number(converted.toFixed(2)),
          unit: TARGET_UNITS.pressure,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
        warning: `Converted pressure from ${val} psi to ${converted.toFixed(2)} bar.`,
      };
    }
    if (lowerUnit === 'mpa') {
      const converted = val * 10.0;
      return {
        normalized: {
          value: Number(converted.toFixed(2)),
          unit: TARGET_UNITS.pressure,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
        warning: `Converted pressure from ${val} MPa to ${converted.toFixed(2)} bar.`,
      };
    }
  }

  // Category 3: Production (BOPD, m3/day)
  if (category === 'production' || lowerUnit === 'bopd' || lowerUnit === 'm3/day' || lowerUnit === 'm3/d') {
    if (lowerUnit === 'bopd' || lowerUnit === 'bbl/d' || lowerUnit === 'bpd') {
      return {
        normalized: {
          value: Number(val.toFixed(2)),
          unit: TARGET_UNITS.production,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
      };
    }
    if (lowerUnit === 'm3/day' || lowerUnit === 'm3/d' || lowerUnit === 'm3d') {
      const converted = val * 6.28981;
      return {
        normalized: {
          value: Number(converted.toFixed(2)),
          unit: TARGET_UNITS.production,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
        warning: `Converted production from ${val} m³/day to ${converted.toFixed(2)} BOPD.`,
      };
    }
  }

  // Category 4: Steam Rate (TPD, kg/day)
  if (category === 'steamRate' || lowerUnit === 'tpd' || lowerUnit === 'tons/day' || lowerUnit === 'kg/day') {
    if (lowerUnit === 'tpd' || lowerUnit === 'tons/day' || lowerUnit === 't/d') {
      return {
        normalized: {
          value: Number(val.toFixed(2)),
          unit: TARGET_UNITS.steamRate,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
      };
    }
    if (lowerUnit === 'kg/day' || lowerUnit === 'kg/d') {
      const converted = val / 1000.0;
      return {
        normalized: {
          value: Number(converted.toFixed(2)),
          unit: TARGET_UNITS.steamRate,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
        warning: `Converted steam rate from ${val} kg/day to ${converted.toFixed(2)} TPD.`,
      };
    }
  }

  // Category 5: Stroke (m, ft)
  if (category === 'stroke' || lowerUnit === 'm' || lowerUnit === 'meters' || lowerUnit === 'ft' || lowerUnit === 'feet') {
    if (lowerUnit === 'm' || lowerUnit === 'meters' || lowerUnit === 'meter') {
      return {
        normalized: {
          value: Number(val.toFixed(2)),
          unit: TARGET_UNITS.stroke,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
      };
    }
    if (lowerUnit === 'ft' || lowerUnit === 'feet' || lowerUnit === 'foot') {
      const converted = val * 0.3048;
      return {
        normalized: {
          value: Number(converted.toFixed(2)),
          unit: TARGET_UNITS.stroke,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
        warning: `Converted stroke length from ${val} ft to ${converted.toFixed(2)} m.`,
      };
    }
  }

  // Category 6: Permeability (D, mD)
  if (category === 'permeability' || lowerUnit === 'd' || lowerUnit === 'darcy' || lowerUnit === 'md' || lowerUnit === 'millidarcy') {
    if (lowerUnit === 'd' || lowerUnit === 'darcy') {
      return {
        normalized: {
          value: Number(val.toFixed(4)),
          unit: TARGET_UNITS.permeability,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
      };
    }
    if (lowerUnit === 'md' || lowerUnit === 'millidarcy') {
      const converted = val / 1000.0;
      return {
        normalized: {
          value: Number(converted.toFixed(4)),
          unit: TARGET_UNITS.permeability,
          provenance: defaultProvenance,
          originalUnit: cleanUnit,
          originalValue: val,
        },
        warning: `Converted permeability from ${val} mD to ${converted.toFixed(4)} D.`,
      };
    }
  }

  // Category 7: Direct Units (cP, Hz, SPM, %)
  if (
    lowerUnit === 'cp' ||
    lowerUnit === 'hz' ||
    lowerUnit === 'spm' ||
    lowerUnit === 'strokes/min' ||
    lowerUnit === '%' ||
    lowerUnit === 'percent'
  ) {
    return {
      normalized: {
        value: Number(val.toFixed(2)),
        unit: cleanUnit,
        provenance: defaultProvenance,
        originalUnit: cleanUnit,
        originalValue: val,
      },
    };
  }

  // Unknown / Unsupported unit
  return {
    normalized: {
      value: val,
      provenance: 'UNIT_UNKNOWN',
      originalUnit: cleanUnit,
      originalValue: val,
    },
    warning: `Unsupported unit "${cleanUnit}" encountered for value ${val}. Marked as UNIT_UNKNOWN.`,
    isUnsupportedUnit: true,
  };
}

export function normalizeTelemetryUnits(
  raw: RawTelemetryInput,
  sourceType: FieldDataSource = 'USER_IMPORTED'
): NormalizedTelemetryRecord {
  const warnings: string[] = [];
  const errors: string[] = [];

  const defaultProvenance: ValueProvenance =
    sourceType === 'REAL_FIELD' || sourceType === 'HISTORICAL'
      ? 'MEASURED'
      : sourceType === 'SIMULATED'
      ? 'SIMULATED'
      : 'ESTIMATED';

  const recId = `rec_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  const processField = (
    val: unknown,
    unit: string | undefined,
    category?: keyof typeof TARGET_UNITS
  ): TelemetryValue<number> | undefined => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    if (isNaN(num)) return undefined;

    const res = normalizeValue(num, unit, category, defaultProvenance);
    if (res.warning) warnings.push(res.warning);
    return res.normalized;
  };

  const reservoirTemperature = processField(raw.reservoirTemperature, raw.reservoirTemperatureUnit, 'temperature');
  const reservoirPressure = processField(raw.reservoirPressure, raw.reservoirPressureUnit, 'pressure');
  const flowingPressure = processField(raw.flowingPressure, raw.flowingPressureUnit, 'pressure');
  const viscosity = processField(raw.viscosity, raw.viscosityUnit, 'viscosity');
  const permeability = processField(raw.permeability, raw.permeabilityUnit, 'permeability');
  const steamRateTpd = processField(raw.steamRateTpd, raw.steamRateUnit, 'steamRate');
  const steamQuality = processField(raw.steamQuality, raw.steamQualityUnit || '%');
  const steamTemperature = processField(raw.steamTemperature, raw.steamTemperatureUnit, 'temperature');
  const vfdHz = processField(raw.vfdHz, raw.vfdUnit || 'Hz');
  const spm = processField(raw.spm, raw.spmUnit || 'SPM');
  const strokeM = processField(raw.strokeM, raw.strokeUnit, 'stroke');
  const productionBopd = processField(raw.productionBopd, raw.productionUnit, 'production');
  const waterCut = processField(raw.waterCut, '%');
  const motorLoad = processField(raw.motorLoad, '%');
  const pumpLoad = processField(raw.pumpLoad, '%');

  let qualityStatus: 'VALID' | 'PARTIALLY_VALID' | 'INVALID' = 'VALID';
  if (warnings.length > 0) qualityStatus = 'PARTIALLY_VALID';

  return {
    recordId: recId,
    timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : new Date().toISOString(),
    source: sourceType,
    wellId: (raw.wellId as string) || 'BG-01',
    qualityStatus,
    reservoirTemperature,
    reservoirPressure,
    flowingPressure,
    viscosity,
    permeability,
    steamRateTpd,
    steamQuality,
    steamTemperature,
    vfdHz,
    spm,
    strokeM,
    productionBopd,
    waterCut,
    motorLoad,
    pumpLoad,
    warnings,
    errors,
  };
}


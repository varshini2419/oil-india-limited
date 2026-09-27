/**
 * BAGHEWALA DIGITAL TWIN — DEMONSTRATION & HISTORICAL REFERENCE DATASET
 * 
 * Contains synthetic demonstration field measurements and documented Baghewala reference data
 * derived from SHARP D4.1 reports and Oil India Rajasthan field records.
 * 
 * DISCLAIMER: DEMONSTRATION DATA — NOT VERIFIED CURRENT FIELD MEASUREMENTS.
 */

export interface FieldObservationRecord {
  id: string;
  timestamp: string;
  wellName: string;
  sourceType: 'DEMONSTRATION' | 'HISTORICAL_REFERENCE' | 'USER_IMPORTED' | 'UNKNOWN';
  sourceDocument?: string;
  reservoirTempC: number;
  steamInjectionRateTpd: number;
  steamTemperatureC: number;
  crudeViscosityCp: number;
  spm: number;
  strokeLengthMeters: number;
  vfdFrequencyHz: number;
  productionBopd: number;
  srpLoadIndex: number;
  notes?: string;
}

export const DEMO_FIELD_OBSERVATIONS: FieldObservationRecord[] = [
  {
    id: 'OBS-BGW-001',
    timestamp: '2023-04-15T08:00:00Z',
    wellName: 'Baghewala-1 (BGW-1)',
    sourceType: 'HISTORICAL_REFERENCE',
    sourceDocument: 'SHARP D4.1 Report (Page 64)',
    reservoirTempC: 48.0,
    steamInjectionRateTpd: 50.0,
    steamTemperatureC: 280.0,
    crudeViscosityCp: 15000.0,
    spm: 8.0,
    strokeLengthMeters: 3.5,
    vfdFrequencyHz: 50.0,
    productionBopd: 0.75,
    srpLoadIndex: 45.2,
    notes: 'Documented cold baseline matrix flow observation prior to intensive thermal stimulation.',
  },
  {
    id: 'OBS-BGW-002',
    timestamp: '2023-06-20T10:30:00Z',
    wellName: 'Baghewala-6 (BGW-6)',
    sourceType: 'DEMONSTRATION',
    sourceDocument: 'Synthetic Operational Log BGW-6-A',
    reservoirTempC: 62.5,
    steamInjectionRateTpd: 95.0,
    steamTemperatureC: 295.0,
    crudeViscosityCp: 2800.0,
    spm: 9.5,
    strokeLengthMeters: 3.5,
    vfdFrequencyHz: 55.0,
    productionBopd: 8.40,
    srpLoadIndex: 68.5,
    notes: 'Demonstration cyclic steam stimulation response record.',
  },
  {
    id: 'OBS-BGW-003',
    timestamp: '2023-09-10T14:15:00Z',
    wellName: 'Baghewala-8 (BGW-8)',
    sourceType: 'HISTORICAL_REFERENCE',
    sourceDocument: 'SHARP D4.1 Report (Page 72 - CSS Pilot)',
    reservoirTempC: 78.0,
    steamInjectionRateTpd: 130.0,
    steamTemperatureC: 310.0,
    crudeViscosityCp: 650.0,
    spm: 10.2,
    strokeLengthMeters: 3.8,
    vfdFrequencyHz: 58.0,
    productionBopd: 22.50,
    srpLoadIndex: 79.8,
    notes: 'Documented peak thermal response following 10-day steam injection cycle.',
  },
  {
    id: 'OBS-BGW-004',
    timestamp: '2023-11-05T09:00:00Z',
    wellName: 'Baghewala-12 (BGW-12)',
    sourceType: 'DEMONSTRATION',
    sourceDocument: 'Synthetic Operational Log BGW-12-C',
    reservoirTempC: 38.0,
    steamInjectionRateTpd: 15.0,
    steamTemperatureC: 250.0,
    crudeViscosityCp: 22000.0,
    spm: 6.0,
    strokeLengthMeters: 3.0,
    vfdFrequencyHz: 42.0,
    productionBopd: 0.35,
    srpLoadIndex: 88.4,
    notes: 'High viscosity cold production choke event demonstration record.',
  },
];

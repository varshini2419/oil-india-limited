import type { ProductionRecord } from './types';

export const HISTORICAL_PRODUCTION_SNAPSHOTS: ProductionRecord[] = [
  {
    id: 'PROD_SNAP_PILOT_01',
    date: '2006-11-15',
    wellId: 'BGW-REP-01',
    oilProductionBpd: {
      parameter: 'Oil Flow Rate Snapshot',
      value: 120,
      unit: 'bpd',
      sourceType: 'documented',
      sourceId: 'SRC_SPE_CSS_03',
      confidence: 'high',
      notes: 'Peak post-soak oil production rate during early CSS cycle 1.',
      lastVerified: '2026-09-25',
    },
    waterCutPercent: {
      parameter: 'Water Cut Snapshot',
      value: 15,
      unit: '%',
      sourceType: 'documented',
      sourceId: 'SRC_SPE_CSS_03',
      confidence: 'medium',
      notes: 'Initial production water cut post steam soak.',
      lastVerified: '2026-09-25',
    },
    isSnapshot: true,
    notes: 'Documented field pilot snapshot. System explicitly distinguishes historical snapshots from simulation outputs.',
  },
];

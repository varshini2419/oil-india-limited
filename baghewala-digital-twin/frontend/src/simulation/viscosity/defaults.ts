import type { ViscosityCalibrationPoint } from './types';
import { BAGHEWALA_CRUDE_PROFILE } from '../../data/baghewala';

export const BAGHEWALA_VISCOSITY_CALIBRATION_POINTS: ViscosityCalibrationPoint[] =
  BAGHEWALA_CRUDE_PROFILE.viscosityDataPoints.map((pt) => ({
    temperatureC: pt.temperatureC,
    viscosityCp: pt.viscosityCp,
    sourceType: pt.sourceType,
    sourceId: pt.sourceId,
  }));

export const MIN_CALIBRATED_TEMP_C = 30.0;
export const MAX_CALIBRATED_TEMP_C = 180.0;

export const MIN_VISCOSITY_CP_BOUND = 1.0;
export const MAX_VISCOSITY_CP_BOUND = 200000.0;

export const VISCOSITY_DISCLAIMER_NOTES = [
  'This is a MODELED / DERIVED temperature-dependent heavy-oil viscosity estimate calibrated against Baghewala crude analysis data.',
  'It is not a live downhole sensor measurement or a substitute for full PVT laboratory reports.',
  'Reference calibration points (30°C: 85,000 cP, 48°C: 15,000 cP, 80°C: 450 cP, 120°C: 45 cP, 180°C: 8 cP) remain traceable to Baghewala source registry (SRC_SPE_CSS_03).',
];

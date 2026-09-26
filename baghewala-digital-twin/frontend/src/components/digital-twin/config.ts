export interface DigitalTwinConfig {
  canvasWidth: number;
  canvasHeight: number;
  viewBox: string;
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  gridVisible: boolean;
  majorGridStep: number;
  minorGridStep: number;
}

export const DEFAULT_TWIN_CONFIG: DigitalTwinConfig = {
  canvasWidth: 1200,
  canvasHeight: 900,
  viewBox: '0 0 1200 900',
  defaultZoom: 1.0,
  minZoom: 0.5,
  maxZoom: 2.5,
  gridVisible: true,
  majorGridStep: 100,
  minorGridStep: 20,
};

export const WELL_LAYOUT_CONFIG = {
  wellCenterX: 600,
  surfaceY: 180,
  wellheadTopY: 80,
  wellheadBottomY: 180,
  wellheadWidth: 220,
  casingTopY: 180,
  casingBottomY: 740,
  casingWidth: 160,
  tubingTopY: 180,
  tubingBottomY: 690,
  tubingWidth: 80,
  suckerRodX: 600,
  suckerRodTopY: 100,
  suckerRodBottomY: 690,
  suckerRodWidth: 4,
  pumpTopY: 690,
  pumpBottomY: 745,
  pumpWidth: 100,
  reservoirTopY: 640,
  reservoirBottomY: 900,
  heavyOilTopY: 690,
  heavyOilBottomY: 870,
};

export const PHENOMENA_LAYOUT_CONFIG = {
  thermalZoneCenterX: 600,
  thermalZoneCenterY: 740,
  thermalZoneRadiusX: 320,
  thermalZoneRadiusY: 120,
  oilFlowLeftStartX: 220,
  oilFlowRightStartX: 980,
  oilFlowTargetX: 600,
  oilFlowTargetY: 725,
  productionPathX: 620,
  productionPathBottomY: 690,
  productionPathTopY: 120,
  steamPathStartX: 420,
  steamPathStartY: 120,
  steamPathInjectY: 710,
};

/**
 * ANIMATION CONFIGURATION (Step 3.4)
 * 
 * Note: These values are visual animation parameters ONLY and do not represent physical field measurements.
 */
export const ANIMATION_CONFIG = {
  visualStrokeAmplitude: 18, // Visual pixel vertical stroke displacement
  baseCycleDurationMs: 2400, // 2.4s per full stroke cycle at Normal speed
  speeds: {
    slow: 0.5,
    normal: 1.0,
    fast: 2.0,
  },
  oilParticleCount: 8,
  productionParticleCount: 6,
  steamParticleCount: 6,
};

/**
 * COORDINATE SYSTEM REFERENCE:
 * 
 * Origin: (0, 0) Top-Left of logical SVG viewBox (1200 x 900)
 * X-Axis: 0 -> 1200 (Horizontal span across wellsite, Center X = 600)
 * Y-Axis: 0 -> 900 (Vertical depth progression from surface to reservoir)
 * 
 * Structural Zones:
 * - Surface / Wellhead Zone: Y = 0 to 180
 * - Wellbore / Casing / Tubing / Rod Zone: Y = 180 to 640
 * - Reservoir / Sandstone / Heavy-Oil Zone: Y = 640 to 900
 * 
 * Phenomena Paths:
 * - Thermal Influence Plume: Center (600, 740)
 * - Oil Inflow Vectors: Reservoir matrix -> Perforated casing & Pump Intake (600, 725)
 * - Production Upflow Path: Pump -> Production Tubing -> Surface Flowline (760, 120)
 * - Steam Injection Path: Surface Generator -> Annulus -> Perforated Formation (420, 710)
 */

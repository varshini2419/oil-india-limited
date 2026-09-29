import React from 'react';
import { DigitalTwinGrid } from './DigitalTwinGrid';
import { SurfaceEquipment, Wellhead } from './surface';
import { Wellbore } from './wellbore';
import { ReservoirLayers, JodhpurSandstone, HeavyOilZone } from './reservoir';
import {
  OilFlowPath,
  ProductionFlowPath,
  SteamInjectionPath,
  ThermalZone,
  TemperatureZones,
  ReservoirInteraction,
  PhenomenaMarkers,
} from './phenomena';
import {
  SuckerRodAnimation,
  PumpAnimation,
  PumpingUnitAnimation,
  OilFlowAnimation,
  ProductionFlowAnimation,
  SteamFlowAnimation,
  ThermalPropagationAnimation,
} from './animations';
import { DEFAULT_TWIN_CONFIG } from './config';

interface DigitalTwinCanvasProps {
  gridVisible?: boolean;
  zoom?: number;
  pan?: { x: number; y: number };
  children?: React.ReactNode;
}

export const DigitalTwinCanvas: React.FC<DigitalTwinCanvasProps> = ({
  gridVisible = true,
  zoom = 1.0,
  pan = { x: 0, y: 0 },
  children,
}) => {
  const { canvasWidth, canvasHeight, viewBox } = DEFAULT_TWIN_CONFIG;

  return (
    <div className="digital-twin-canvas-surface w-full h-full min-h-[520px] bg-slate-950 flex items-center justify-center overflow-hidden relative select-none">
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-h-[78vh] drop-shadow-2xl transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Background base rect */}
        <rect width={canvasWidth} height={canvasHeight} fill="#020617" />

        {/* Development Reference Grid Layer */}
        <DigitalTwinGrid
          visible={gridVisible}
          width={canvasWidth}
          height={canvasHeight}
        />

        {/* #layer-reservoir-matrix: Reservoir Strata, Jodhpur Sandstone & Heavy-Oil Zone */}
        <g id="layer-reservoir-matrix">
          <ReservoirLayers />
          <JodhpurSandstone />
          <HeavyOilZone />
        </g>

        {/* #layer-wellbore-casing: Casing, Tubing, Sucker Rod & Downhole Pump */}
        <g id="layer-wellbore-casing">
          <Wellbore />
        </g>

        {/* #layer-surface-equipment: Wellhead & Surface Pumping Unit */}
        <g id="layer-surface-equipment">
          <SurfaceEquipment />
          <Wellhead />
        </g>

        {/* #layer-flow-thermal-paths: Static Flow, Thermal & Process Phenomena */}
        <g id="layer-flow-thermal-paths">
          <ThermalZone />
          <SteamInjectionPath />
          <OilFlowPath />
          <ProductionFlowPath />
          <TemperatureZones />
          <ReservoirInteraction />
          <PhenomenaMarkers />
        </g>

        {/* #layer-animations: Step 3.4 Dynamic Synchronized Animations */}
        <g id="layer-animations">
          <PumpingUnitAnimation />
          <SuckerRodAnimation />
          <PumpAnimation />
          <OilFlowAnimation />
          <ProductionFlowAnimation />
          <SteamFlowAnimation />
          <ThermalPropagationAnimation />
        </g>

        {/* Custom children / overlay layers passed down */}
        {children}
      </svg>
    </div>
  );
};

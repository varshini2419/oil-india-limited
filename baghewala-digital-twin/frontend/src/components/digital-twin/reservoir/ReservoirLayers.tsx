import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';

export const ReservoirLayers: React.FC = () => {
  const { wellCenterX, surfaceY, reservoirTopY, casingWidth } = WELL_LAYOUT_CONFIG;
  const leftX = wellCenterX - casingWidth / 2 - 16;
  const rightX = wellCenterX + casingWidth / 2 + 16;

  return (
    <g id="component-reservoir-overburden-layers" className="reservoir-overburden-group">
      {/* Upper Overburden Strata (Y: 180 to 400) - Left & Right */}
      <rect
        x={0}
        y={surfaceY}
        width={leftX}
        height={220}
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="1"
      />
      <rect
        x={rightX}
        y={surfaceY}
        width={1200 - rightX}
        height={220}
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="1"
      />
      <text x={30} y={210} fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">
        OVERBURDEN / SHALE STRATA
      </text>
      <text x={1050} y={210} fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">
        OVERBURDEN
      </text>

      {/* Intermediate Strata (Y: 400 to 640) - Left & Right */}
      <rect
        x={0}
        y={400}
        width={leftX}
        height={240}
        fill="#1e1b4b"
        opacity="0.3"
        stroke="#312e81"
        strokeWidth="1"
      />
      <rect
        x={rightX}
        y={400}
        width={1200 - rightX}
        height={240}
        fill="#1e1b4b"
        opacity="0.3"
        stroke="#312e81"
        strokeWidth="1"
      />
      <text x={30} y={430} fill="#6366f1" fontSize="10" fontFamily="monospace" opacity="0.6">
        CAPROCK FORMATION
      </text>

      {/* Boundary Line between Caprock and Jodhpur Sandstone Reservoir Y=640 */}
      <line x1={0} y1={reservoirTopY} x2={1200} y2={reservoirTopY} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
    </g>
  );
};

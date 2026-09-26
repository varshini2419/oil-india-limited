import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';

export const SurfaceEquipment: React.FC = () => {
  const { wellCenterX, surfaceY } = WELL_LAYOUT_CONFIG;

  return (
    <g id="component-surface-equipment" className="surface-equipment-group">
      {/* Pumping Unit Samson Post Base */}
      <polygon
        points={`${wellCenterX - 240},${surfaceY} ${wellCenterX - 360},${surfaceY} ${wellCenterX - 300},${surfaceY - 110}`}
        fill="#0f172a"
        stroke="#64748b"
        strokeWidth="2"
      />

      {/* Walking Beam */}
      <line
        x1={wellCenterX - 320}
        y1={surfaceY - 110}
        x2={wellCenterX - 30}
        y2={surfaceY - 110}
        stroke="#94a3b8"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Horsehead Arc */}
      <path
        d={`M ${wellCenterX - 30} ${surfaceY - 110} Q ${wellCenterX} ${surfaceY - 100} ${wellCenterX} ${surfaceY - 80}`}
        fill="none"
        stroke="#94a3b8"
        strokeWidth="10"
      />

      {/* Carrier Bar / Polish Rod Bridle Line */}
      <line
        x1={wellCenterX}
        y1={surfaceY - 80}
        x2={wellCenterX}
        y2={surfaceY - 100}
        stroke="#e2e8f0"
        strokeWidth="2.5"
      />

      {/* Pumping Unit Label */}
      <text
        x={wellCenterX - 300}
        y={surfaceY - 122}
        fill="#64748b"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="bold"
      >
        SRP SURFACE PUMPING UNIT (STATIC)
      </text>
    </g>
  );
};

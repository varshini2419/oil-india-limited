import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';

export const SuckerRod: React.FC = () => {
  const { suckerRodX, suckerRodTopY, suckerRodBottomY, suckerRodWidth } = WELL_LAYOUT_CONFIG;

  // Static rod coupling nodes every 80px down the rod string
  const couplingYPositions = [220, 300, 380, 460, 540, 620];

  return (
    <g id="component-sucker-rod" className="sucker-rod-group">
      {/* Central Sucker Rod Line (STATIC) */}
      <line
        x1={suckerRodX}
        y1={suckerRodTopY}
        x2={suckerRodX}
        y2={suckerRodBottomY}
        stroke="#f1f5f9"
        strokeWidth={suckerRodWidth}
      />

      {/* Polish Rod Segment Top */}
      <line
        x1={suckerRodX}
        y1={suckerRodTopY}
        x2={suckerRodX}
        y2={180}
        stroke="#e2e8f0"
        strokeWidth={suckerRodWidth + 2}
      />

      {/* Static Rod Coupling Pins */}
      {couplingYPositions.map((y, idx) => (
        <rect
          key={`coupling-${idx}`}
          x={suckerRodX - 6}
          y={y - 5}
          width={12}
          height={10}
          fill="#cbd5e1"
          stroke="#475569"
          strokeWidth="1"
          rx="1"
        />
      ))}

      {/* SUCKER ROD Label & Leader Line */}
      <g className="sucker-rod-label">
        <line
          x1={suckerRodX}
          y1={490}
          x2={suckerRodX - 160}
          y2={490}
          stroke="#f1f5f9"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx={suckerRodX} cy={490} r="3" fill="#f1f5f9" />
        <rect
          x={suckerRodX - 280}
          y={476}
          width={110}
          height={26}
          fill="#0f172a"
          stroke="#f1f5f9"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x={suckerRodX - 225}
          y={493}
          fill="#f8fafc"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          SUCKER ROD
        </text>
      </g>
    </g>
  );
};

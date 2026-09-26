import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';

export const JodhpurSandstone: React.FC = () => {
  const { reservoirTopY, reservoirBottomY } = WELL_LAYOUT_CONFIG;
  const height = reservoirBottomY - reservoirTopY;

  return (
    <g id="component-jodhpur-sandstone" className="jodhpur-sandstone-group">
      {/* Jodhpur Sandstone Reservoir Background Matrix */}
      <rect
        x={0}
        y={reservoirTopY}
        width={1200}
        height={height}
        fill="#78350f"
        opacity="0.25"
      />

      {/* Sandstone Texture Stippling Lines */}
      <path
        d={`M 0 ${reservoirTopY + 30} Q 300 ${reservoirTopY + 20} 600 ${reservoirTopY + 30} T 1200 ${reservoirTopY + 25}`}
        fill="none"
        stroke="#b45309"
        strokeWidth="1"
        strokeDasharray="4 8"
        opacity="0.4"
      />
      <path
        d={`M 0 ${reservoirTopY + 120} Q 400 ${reservoirTopY + 130} 800 ${reservoirTopY + 115} T 1200 ${reservoirTopY + 125}`}
        fill="none"
        stroke="#b45309"
        strokeWidth="1"
        strokeDasharray="4 8"
        opacity="0.4"
      />

      {/* JODHPUR SANDSTONE Label & Leader Box */}
      <g className="jodhpur-sandstone-label">
        <rect
          x={30}
          y={reservoirTopY + 20}
          width={185}
          height={28}
          fill="#0f172a"
          stroke="#f59e0b"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x={122}
          y={reservoirTopY + 38}
          fill="#fbbf24"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          JODHPUR SANDSTONE
        </text>
      </g>
    </g>
  );
};

import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';

export const Casing: React.FC = () => {
  const { wellCenterX, casingTopY, casingBottomY, casingWidth } = WELL_LAYOUT_CONFIG;
  const leftX = wellCenterX - casingWidth / 2;
  const rightX = wellCenterX + casingWidth / 2;

  // Perforation slots in lower casing (Y: 700 to 740)
  const perfSlotsLeft = [705, 715, 725, 735];
  const perfSlotsRight = [705, 715, 725, 735];

  return (
    <g id="component-casing" className="casing-group">
      {/* Outer Formation Cement Fill Behind Casing */}
      <rect
        x={leftX - 16}
        y={casingTopY}
        width={16}
        height={casingBottomY - casingTopY}
        fill="#334155"
        opacity="0.6"
      />
      <rect
        x={rightX}
        y={casingTopY}
        width={16}
        height={casingBottomY - casingTopY}
        fill="#334155"
        opacity="0.6"
      />

      {/* Left Casing Wall */}
      <line
        x1={leftX}
        y1={casingTopY}
        x2={leftX}
        y2={casingBottomY}
        stroke="#94a3b8"
        strokeWidth="6"
      />

      {/* Right Casing Wall */}
      <line
        x1={rightX}
        y1={casingTopY}
        x2={rightX}
        y2={casingBottomY}
        stroke="#94a3b8"
        strokeWidth="6"
      />

      {/* Bottom Casing Shoe / Plug */}
      <line
        x1={leftX - 4}
        y1={casingBottomY}
        x2={rightX + 4}
        y2={casingBottomY}
        stroke="#94a3b8"
        strokeWidth="6"
      />

      {/* Perforations in Lower Casing */}
      {perfSlotsLeft.map((y, idx) => (
        <g key={`perf-l-${idx}`}>
          <line x1={leftX - 12} y1={y} x2={leftX + 4} y2={y} stroke="#f59e0b" strokeWidth="2.5" />
          <polygon points={`${leftX - 14},${y} ${leftX - 8},${y - 3} ${leftX - 8},${y + 3}`} fill="#f59e0b" />
        </g>
      ))}

      {perfSlotsRight.map((y, idx) => (
        <g key={`perf-r-${idx}`}>
          <line x1={rightX - 4} y1={y} x2={rightX + 12} y2={y} stroke="#f59e0b" strokeWidth="2.5" />
          <polygon points={`${rightX + 14},${y} ${rightX + 8},${y - 3} ${rightX + 8},${y + 3}`} fill="#f59e0b" />
        </g>
      ))}

      {/* CASING Label & Leader Line */}
      <g className="casing-label">
        <line
          x1={leftX}
          y1={350}
          x2={leftX - 120}
          y2={350}
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx={leftX} cy={350} r="3" fill="#94a3b8" />
        <rect
          x={leftX - 220}
          y={336}
          width={90}
          height={26}
          fill="#0f172a"
          stroke="#94a3b8"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x={leftX - 175}
          y={353}
          fill="#cbd5e1"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          CASING
        </text>
      </g>
    </g>
  );
};

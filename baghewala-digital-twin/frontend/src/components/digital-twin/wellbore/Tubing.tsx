import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';

export const Tubing: React.FC = () => {
  const { wellCenterX, tubingTopY, tubingBottomY, tubingWidth } = WELL_LAYOUT_CONFIG;
  const leftX = wellCenterX - tubingWidth / 2;
  const rightX = wellCenterX + tubingWidth / 2;

  return (
    <g id="component-tubing" className="tubing-group">
      {/* Left Tubing Wall (Double stroke line for Vacuum Insulated Tubing look) */}
      <line
        x1={leftX}
        y1={tubingTopY}
        x2={leftX}
        y2={tubingBottomY}
        stroke="#38bdf8"
        strokeWidth="4"
      />
      <line
        x1={leftX - 3}
        y1={tubingTopY}
        x2={leftX - 3}
        y2={tubingBottomY}
        stroke="#0284c7"
        strokeWidth="1.5"
      />

      {/* Right Tubing Wall */}
      <line
        x1={rightX}
        y1={tubingTopY}
        x2={rightX}
        y2={tubingBottomY}
        stroke="#38bdf8"
        strokeWidth="4"
      />
      <line
        x1={rightX + 3}
        y1={tubingTopY}
        x2={rightX + 3}
        y2={tubingBottomY}
        stroke="#0284c7"
        strokeWidth="1.5"
      />

      {/* Tubing Anchor / Sealing Packer Representation */}
      <rect
        x={leftX - 18}
        y={tubingBottomY - 20}
        width={18}
        height={16}
        fill="#0369a1"
        stroke="#38bdf8"
        strokeWidth="1"
        rx="2"
      />
      <rect
        x={rightX}
        y={tubingBottomY - 20}
        width={18}
        height={16}
        fill="#0369a1"
        stroke="#38bdf8"
        strokeWidth="1"
        rx="2"
      />

      {/* TUBING / VIT Label & Leader Line */}
      <g className="tubing-label">
        <line
          x1={rightX}
          y1={420}
          x2={rightX + 120}
          y2={420}
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx={rightX} cy={420} r="3" fill="#38bdf8" />
        <rect
          x={rightX + 120}
          y={406}
          width={130}
          height={26}
          fill="#0f172a"
          stroke="#38bdf8"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x={rightX + 185}
          y={423}
          fill="#7dd3fc"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          TUBING / VIT
        </text>
      </g>
    </g>
  );
};

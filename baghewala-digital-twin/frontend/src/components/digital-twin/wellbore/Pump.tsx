import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';

export const Pump: React.FC = () => {
  const { wellCenterX, pumpTopY, pumpBottomY, pumpWidth } = WELL_LAYOUT_CONFIG;
  const leftX = wellCenterX - pumpWidth / 2;
  const rightX = wellCenterX + pumpWidth / 2;

  return (
    <g id="component-downhole-pump" className="downhole-pump-group">
      {/* Outer Pump Barrel */}
      <rect
        x={leftX}
        y={pumpTopY}
        width={pumpWidth}
        height={pumpBottomY - pumpTopY}
        fill="#0f172a"
        stroke="#e2e8f0"
        strokeWidth="2.5"
        rx="3"
      />

      {/* Internal Plunger Representation (STATIC) */}
      <rect
        x={wellCenterX - 22}
        y={pumpTopY + 12}
        width={44}
        height={30}
        fill="#334155"
        stroke="#94a3b8"
        strokeWidth="1.5"
        rx="2"
      />

      {/* Traveling Valve Ball & Seat inside Plunger (STATIC) */}
      <circle cx={wellCenterX} cy={pumpTopY + 22} r="5" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
      <polygon points={`${wellCenterX - 8},${pumpTopY + 30} ${wellCenterX + 8},${pumpTopY + 30} ${wellCenterX},${pumpTopY + 24}`} fill="#94a3b8" />

      {/* Standing Valve Ball & Seat Base (STATIC) */}
      <circle cx={wellCenterX} cy={pumpBottomY - 14} r="6" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
      <polygon points={`${wellCenterX - 10},${pumpBottomY - 6} ${wellCenterX + 10},${pumpBottomY - 6} ${wellCenterX},${pumpBottomY - 12}`} fill="#94a3b8" />

      {/* Pump Intake Screen / Stinger Bottom */}
      <path
        d={`M ${wellCenterX - 16} ${pumpBottomY} L ${wellCenterX - 16} ${pumpBottomY + 25} L ${wellCenterX} ${pumpBottomY + 35} L ${wellCenterX + 16} ${pumpBottomY + 25} L ${wellCenterX + 16} ${pumpBottomY}`}
        fill="#1e293b"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
      {/* Screen Mesh Lines */}
      <line x1={wellCenterX - 12} y1={pumpBottomY + 10} x2={wellCenterX + 12} y2={pumpBottomY + 10} stroke="#475569" strokeWidth="1" />
      <line x1={wellCenterX - 12} y1={pumpBottomY + 18} x2={wellCenterX + 12} y2={pumpBottomY + 18} stroke="#475569" strokeWidth="1" />

      {/* SRP / DOWNHOLE PUMP Label & Leader Line */}
      <g className="srp-pump-label">
        <line
          x1={rightX}
          y1={pumpTopY + 26}
          x2={rightX + 130}
          y2={pumpTopY + 26}
          stroke="#e2e8f0"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx={rightX} cy={pumpTopY + 26} r="3" fill="#e2e8f0" />
        <rect
          x={rightX + 130}
          y={pumpTopY + 10}
          width={155}
          height={32}
          fill="#0f172a"
          stroke="#e2e8f0"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x={rightX + 207}
          y={pumpTopY + 24}
          fill="#f8fafc"
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          SRP / DOWNHOLE PUMP
        </text>
        <text
          x={rightX + 207}
          y={pumpTopY + 36}
          fill="#94a3b8"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          (Static Mechanical Representation)
        </text>
      </g>
    </g>
  );
};

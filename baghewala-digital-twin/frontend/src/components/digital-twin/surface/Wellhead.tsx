import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';

export const Wellhead: React.FC = () => {
  const { wellCenterX, wellheadTopY, surfaceY } = WELL_LAYOUT_CONFIG;

  return (
    <g id="component-wellhead" className="wellhead-group">
      {/* Surface Ground Line */}
      <line
        x1={100}
        y1={surfaceY}
        x2={1100}
        y2={surfaceY}
        stroke="#475569"
        strokeWidth="3"
      />
      <text
        x={120}
        y={surfaceY - 8}
        fill="#94a3b8"
        fontSize="11"
        fontFamily="monospace"
        fontWeight="bold"
      >
        SURFACE LEVEL
      </text>

      {/* Ground Surface Hatching */}
      <path
        d={`M 100 ${surfaceY} L 1100 ${surfaceY}`}
        stroke="#334155"
        strokeWidth="1"
      />

      {/* Main Wellhead Christmas Tree Casing Spool & Flanges */}
      {/* Base Flange at Surface */}
      <rect
        x={wellCenterX - 100}
        y={surfaceY - 15}
        width={200}
        height={15}
        fill="#1e293b"
        stroke="#38bdf8"
        strokeWidth="2"
        rx="2"
      />

      {/* Lower Master Valve Block */}
      <rect
        x={wellCenterX - 65}
        y={surfaceY - 45}
        width={130}
        height={30}
        fill="#0f172a"
        stroke="#38bdf8"
        strokeWidth="2"
        rx="3"
      />

      {/* Master Valve Handwheel Left & Right */}
      <circle cx={wellCenterX - 85} cy={surfaceY - 30} r="10" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
      <line x1={wellCenterX - 75} y1={surfaceY - 30} x2={wellCenterX - 65} y2={surfaceY - 30} stroke="#38bdf8" strokeWidth="2" />
      <circle cx={wellCenterX + 85} cy={surfaceY - 30} r="10" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
      <line x1={wellCenterX + 65} y1={surfaceY - 30} x2={wellCenterX + 75} y2={surfaceY - 30} stroke="#38bdf8" strokeWidth="2" />

      {/* Upper Cross / Tee Assembly */}
      <rect
        x={wellCenterX - 50}
        y={surfaceY - 75}
        width={100}
        height={30}
        fill="#1e293b"
        stroke="#38bdf8"
        strokeWidth="2"
        rx="3"
      />

      {/* Surface Production Outlet Piping Right */}
      <path
        d={`M ${wellCenterX + 50} ${surfaceY - 60} L ${wellCenterX + 160} ${surfaceY - 60} L ${wellCenterX + 160} ${surfaceY - 20}`}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="4"
      />
      <text
        x={wellCenterX + 170}
        y={surfaceY - 40}
        fill="#7dd3fc"
        fontSize="10"
        fontFamily="monospace"
      >
        To Flowline
      </text>

      {/* Stuffing Box / Polish Rod Seal Top */}
      <rect
        x={wellCenterX - 25}
        y={wellheadTopY}
        width={50}
        height={25}
        fill="#020617"
        stroke="#e2e8f0"
        strokeWidth="2"
        rx="2"
      />
      <text
        x={wellCenterX}
        y={wellheadTopY + 16}
        fill="#e2e8f0"
        fontSize="9"
        fontFamily="monospace"
        textAnchor="middle"
      >
        STUFFING BOX
      </text>

      {/* WELLHEAD Label & Leader Line */}
      <g className="wellhead-label">
        <line
          x1={wellCenterX - 65}
          y1={surfaceY - 60}
          x2={wellCenterX - 220}
          y2={surfaceY - 60}
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx={wellCenterX - 65} cy={surfaceY - 60} r="3" fill="#38bdf8" />
        <rect
          x={wellCenterX - 330}
          y={surfaceY - 75}
          width={100}
          height={26}
          fill="#0f172a"
          stroke="#38bdf8"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x={wellCenterX - 280}
          y={surfaceY - 58}
          fill="#38bdf8"
          fontSize="12"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          WELLHEAD
        </text>
      </g>
    </g>
  );
};

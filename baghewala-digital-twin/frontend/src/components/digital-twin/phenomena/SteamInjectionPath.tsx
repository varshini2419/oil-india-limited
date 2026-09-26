import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';

interface SteamInjectionPathProps {
  steamRate?: number; // Future simulation compatibility prop
}

export const SteamInjectionPath: React.FC<SteamInjectionPathProps> = () => {
  const { wellCenterX, surfaceY, casingWidth } = WELL_LAYOUT_CONFIG;
  const leftAnnulusX = wellCenterX - casingWidth / 2 + 25;

  return (
    <g id="component-steam-injection-path" className="steam-injection-group">
      <defs>
        {/* Arrow Marker for Downward Steam Path */}
        <marker
          id="steam-downflow-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 5 10 L 10 0 z" fill="#ef4444" />
        </marker>
      </defs>

      {/* Surface Steam Injection Supply Line (Left of Wellhead) */}
      <path
        d={`M ${wellCenterX - 220} ${surfaceY - 45} L ${leftAnnulusX} ${surfaceY - 45} L ${leftAnnulusX} ${surfaceY}`}
        fill="none"
        stroke="#ef4444"
        strokeWidth="3"
        strokeDasharray="6 4"
      />

      {/* Downward Annular Steam Injection Path inside Casing (STATIC) */}
      <line
        x1={leftAnnulusX}
        y1={surfaceY}
        x2={leftAnnulusX}
        y2={690}
        stroke="#ef4444"
        strokeWidth="2.5"
        strokeDasharray="6 4"
        markerEnd="url(#steam-downflow-arrow)"
      />

      {/* Static Arrow Indicators Along Annulus */}
      <path
        d={`M ${leftAnnulusX} 260 L ${leftAnnulusX} 280`}
        stroke="#ef4444"
        strokeWidth="3"
        markerEnd="url(#steam-downflow-arrow)"
      />
      <path
        d={`M ${leftAnnulusX} 480 L ${leftAnnulusX} 500`}
        stroke="#ef4444"
        strokeWidth="3"
        markerEnd="url(#steam-downflow-arrow)"
      />

      {/* Radial Steam Dispersion Vectors into Reservoir Perforations (STATIC) */}
      <path d={`M ${leftAnnulusX} 690 Q 440 710 320 725`} fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="4 4" />
      <path d={`M ${leftAnnulusX} 690 Q 460 740 340 765`} fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="4 4" />

      {/* STEAM / THERMAL INPUT — CONCEPTUAL Label & Leader Line */}
      <g className="steam-injection-label">
        <line
          x1={wellCenterX - 200}
          y1={surfaceY - 45}
          x2={wellCenterX - 200}
          y2={surfaceY - 110}
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx={wellCenterX - 200} cy={surfaceY - 45} r="3" fill="#ef4444" />
        <rect
          x={wellCenterX - 340}
          y={surfaceY - 135}
          width={280}
          height={26}
          fill="#0f172a"
          stroke="#ef4444"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x={wellCenterX - 200}
          y={surfaceY - 118}
          fill="#fca5a5"
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          STEAM / THERMAL INPUT — CONCEPTUAL
        </text>
      </g>
    </g>
  );
};

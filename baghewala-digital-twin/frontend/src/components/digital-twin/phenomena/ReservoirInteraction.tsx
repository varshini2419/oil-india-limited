import React from 'react';

export const ReservoirInteraction: React.FC = () => {
  return (
    <g id="component-reservoir-interaction" className="reservoir-interaction-group">
      {/* Process Interaction Overview Panel (Bottom Left of Canvas) */}
      <g transform="translate(30, 785)">
        <rect
          x="0"
          y="0"
          width="260"
          height="80"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="1.5"
          rx="6"
          opacity="0.9"
        />

        <text
          x="15"
          y="18"
          fill="#38bdf8"
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
        >
          EOR PROCESS COUPLING (STATIC)
        </text>

        <text x="15" y="36" fill="#94a3b8" fontSize="9" fontFamily="monospace">
          1. Thermal Input → Heated Reservoir Matrix
        </text>
        <text x="15" y="50" fill="#94a3b8" fontSize="9" fontFamily="monospace">
          2. Viscosity Reduction → Inflow to Pump
        </text>
        <text x="15" y="64" fill="#94a3b8" fontSize="9" fontFamily="monospace">
          3. SRP Artificial Lift → Production Flow
        </text>
      </g>
    </g>
  );
};

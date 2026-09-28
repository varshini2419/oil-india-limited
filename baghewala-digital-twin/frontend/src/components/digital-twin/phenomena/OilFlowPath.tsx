import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';
import { useScenarioStore } from '../../../simulation/scenario';

interface OilFlowPathProps {
  flowIntensity?: number; // Future simulation compatibility prop
}

export const OilFlowPath: React.FC<OilFlowPathProps> = () => {
  const { wellCenterX, casingWidth } = WELL_LAYOUT_CONFIG;
  const { committedSimulationResult, isStale } = useScenarioStore();
  const mobility = committedSimulationResult.mobility.mobilityDcP;
  const viscosity = committedSimulationResult.viscosity.estimatedViscosityCp;
  const flowIntensity = Math.max(0.25, Math.min(1, mobility * 2500));
  const flowOpacity = Math.max(0.35, Math.min(0.95, 1 - viscosity / 80000));
  const leftCasingX = wellCenterX - casingWidth / 2;
  const rightCasingX = wellCenterX + casingWidth / 2;

  // Static directional arrow markers for inflow paths
  return (
    <g id="component-oil-flow-path" className="oil-flow-path-group" opacity={isStale ? 0.45 : flowOpacity}>
      <defs>
        {/* Static Arrow Marker definition for Oil Inflow */}
        <marker
          id="oil-inflow-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
        </marker>
      </defs>

      {/* Left Reservoir Inflow Paths (STATIC) */}
      <path
        d={`M 260 720 Q 400 720 ${leftCasingX - 10} 720`}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={1.5 + flowIntensity * 2}
        strokeDasharray="6 4"
        markerEnd="url(#oil-inflow-arrow)"
      />
      <path
        d={`M 280 770 Q 420 760 ${leftCasingX - 10} 735`}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={1.5 + flowIntensity * 2}
        strokeDasharray="6 4"
        markerEnd="url(#oil-inflow-arrow)"
      />

      {/* Right Reservoir Inflow Paths (STATIC) */}
      <path
        d={`M 940 720 Q 800 720 ${rightCasingX + 10} 720`}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={1.5 + flowIntensity * 2}
        strokeDasharray="6 4"
        markerEnd="url(#oil-inflow-arrow)"
      />
      <path
        d={`M 920 770 Q 780 760 ${rightCasingX + 10} 735`}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={1.5 + flowIntensity * 2}
        strokeDasharray="6 4"
        markerEnd="url(#oil-inflow-arrow)"
      />

      {/* OIL FLOW TO PUMP Label & Leader Line */}
      <g className="oil-flow-label">
        <line
          x1={340}
          y1={720}
          x2={340}
          y2={670}
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx={340} cy={720} r="3" fill="#f59e0b" />
        <rect
          x={275}
          y={644}
          width={130}
          height={26}
          fill="#0f172a"
          stroke="#f59e0b"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x={340}
          y={661}
          fill="#fbbf24"
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          OIL FLOW TO PUMP
        </text>
      </g>
    </g>
  );
};

import type { DigitalTwinState, AlertItem, TimelineEvent } from './types';

export function evaluateAlerts(state: DigitalTwinState): {
  alerts: AlertItem[];
  events: TimelineEvent[];
} {
  const alerts: AlertItem[] = [];
  const events: TimelineEvent[] = [];

  const ts = state.timestamp;
  let counter = 1;

  const addAlert = (
    severity: AlertItem['severity'],
    condition: string,
    observedValue: number | string,
    threshold: number | string,
    explanation: string,
    recommendedAction: string
  ) => {
    const id = `ALT-${ts.substring(11, 19)}-${counter++}`;
    alerts.push({
      id,
      timestamp: ts,
      severity,
      condition,
      observedValue,
      threshold,
      explanation,
      recommendedAction,
    });

    events.push({
      id: `EVT-${id}`,
      timestamp: ts.substring(11, 19),
      event: condition,
      severity,
      value: String(observedValue),
      status: 'ACTIVE',
    });
  };

  // 1. Viscosity Threshold Check
  if (state.reservoir.estimatedViscosityCp > 10000) {
    addAlert(
      'HIGH',
      'Heavy-Oil Viscosity Critical Threshold Exceeded',
      `${state.reservoir.estimatedViscosityCp.toFixed(1)} cP`,
      '10,000.0 cP',
      'Crude viscosity remains severely elevated, causing poor oil inflow and high pump rod drag.',
      'Schedule CSS steam cycle boost or increase bottomhole heating enthalpy.'
    );
  } else if (state.reservoir.estimatedViscosityCp > 5000) {
    addAlert(
      'WARNING',
      'Heavy-Oil Viscosity Elevated',
      `${state.reservoir.estimatedViscosityCp.toFixed(1)} cP`,
      '5,000.0 cP',
      'Viscosity is in moderate drag range.',
      'Monitor downhole pump stroke fillage.'
    );
  }

  // 2. Reservoir Temperature Threshold Check
  if (state.reservoir.reservoirTemperatureC < 45.0) {
    addAlert(
      'WARNING',
      'Reservoir Temperature Below Thermal Soak Threshold',
      `${state.reservoir.reservoirTemperatureC.toFixed(1)} °C`,
      '45.0 °C',
      'Reservoir temperature is near native unheated state (48°C), limiting thermal mobility.',
      'Initiate cyclic steam injection soak period.'
    );
  }

  // 3. SRP Load Index Check
  if (state.srp.srpLoadIndex > 85.0) {
    addAlert(
      'CRITICAL',
      'SRP Equipment Mechanical Load Index Exceeded',
      `${state.srp.srpLoadIndex.toFixed(1)}/100`,
      '85.0/100',
      'Peak rod load and gear torque are approaching structural fatigue limits.',
      'Reduce VFD motor frequency or decrease stroke speed (SPM).'
    );
  } else if (state.srp.srpLoadIndex > 75.0) {
    addAlert(
      'WARNING',
      'SRP Load Index Approaching Upper Operating Limit',
      `${state.srp.srpLoadIndex.toFixed(1)}/100`,
      '75.0/100',
      'Mechanical SRP load is in elevated caution band.',
      'Monitor polish rod dynamometer load cell.'
    );
  }

  // 4. Estimated Production Threshold Check
  if (state.production.estimatedProductionBopd < 0.5) {
    addAlert(
      'HIGH',
      'Estimated Production Below Economic Threshold',
      `${state.production.estimatedProductionBopd.toFixed(2)} BOPD`,
      '0.50 BOPD',
      'Fluid inflow is insufficient to sustain economical sucker rod pumping.',
      'Review thermal steam soak effectiveness and drawdown pressure.'
    );
  }

  // 5. CSS Thermal Gain Check
  if (state.css.thermalGainC < 5.0 && state.css.steamInjectionRateTpd > 20) {
    addAlert(
      'WARNING',
      'Insufficient CSS Thermal Soak Gain',
      `${state.css.thermalGainC.toFixed(1)} °C`,
      '5.0 °C',
      'Steam enthalpy delivery to the formation is lower than anticipated for injected rate.',
      'Inspect downhole steam tubing packer and steam quality.'
    );
  }

  // 6. Overall AI Risk Engine Level Check
  if (state.risk.riskLevel === 'CRITICAL') {
    addAlert(
      'CRITICAL',
      'AI Risk Advisory Status: CRITICAL OPERATIONAL RISK',
      `Score: ${state.risk.riskScore}/100`,
      'Score < 70',
      'Multiple concurrent mechanical and thermal risk factors detected.',
      'Perform urgent operational parameter review.'
    );
  } else if (state.risk.riskLevel === 'HIGH') {
    addAlert(
      'HIGH',
      'AI Risk Advisory Status: HIGH OPERATIONAL RISK',
      `Score: ${state.risk.riskScore}/100`,
      'Score < 50',
      'High risk level detected across SRP and thermal models.',
      'Optimize SRP VFD and CSS soak parameters.'
    );
  }

  // Add default info log event if no alerts were generated
  if (events.length === 0) {
    events.push({
      id: `EVT-${ts.substring(11, 19)}-NORMAL`,
      timestamp: ts.substring(11, 19),
      event: 'Digital Twin Nominal Operating State',
      severity: 'INFO',
      value: `${state.production.estimatedProductionBopd.toFixed(1)} BOPD`,
      status: 'NOMINAL',
    });
  }

  return {
    alerts,
    events,
  };
}

import type { AssessmentInput, GapItem } from './types';

export function evaluateGapAnalysis(input?: AssessmentInput): GapItem[] {
  const gaps: GapItem[] = [];

  const isRealConn = input?.isRealTelemetryConnected ?? false;

  // Gap 1: Physical SCADA Integration
  if (!isRealConn) {
    gaps.push({
      gapId: 'GAP-001',
      category: 'SCADA_INTEGRATION',
      title: 'Physical SCADA Ingestion Interface Unconnected',
      description: 'Real-time telemetry stream from field sucker rod pump load cell and wellhead transmitters is not connected to live digital twin instance.',
      severity: 'HIGH',
      requiredAction: 'Configure secure OPC-UA / MQTT industrial gateway to ingest live SCADA telemetry.',
    });
  }

  // Gap 2: Wellhead Multi-Phase Metering
  gaps.push({
    gapId: 'GAP-002',
    category: 'FIELD_TELEMETRY',
    title: 'Continuous Wellhead Multi-Phase Flow Metering Missing',
    description: 'Oil production rates currently rely on periodic manual tank gauging rather than continuous real-time multi-phase flow measurement.',
    severity: 'MEDIUM',
    requiredAction: 'Install calibrated continuous multi-phase wellhead flow meter at Baghewala appraisal wellhead.',
  });

  // Gap 3: Downhole Temperature & Pressure Calibration
  gaps.push({
    gapId: 'GAP-003',
    category: 'EQUIPMENT_VALIDATION',
    title: 'Downhole Reservoir Gauge Calibration Required',
    description: 'Downhole reservoir pressure and temperature sensors require physical recalibration during next well workover cycle.',
    severity: 'MEDIUM',
    requiredAction: 'Deploy wireline memory gauge logging tool to calibrate static and dynamic reservoir pressure/temperature.',
  });

  // Gap 4: Steam Quality Verification
  gaps.push({
    gapId: 'GAP-004',
    category: 'DOMAIN_VALIDATION',
    title: 'In-situ Steam Injection Quality Fraction Measurement',
    description: 'Steam quality (X_s) is set to nominal design value (80%) but lacks continuous wellhead calorimeter measurement.',
    severity: 'MEDIUM',
    requiredAction: 'Install inline steam calorimeter at boiler output and wellhead injection manifold.',
  });

  // Gap 5: Industrial Cybersecurity Protocol Audit
  gaps.push({
    gapId: 'GAP-005',
    category: 'CYBERSECURITY',
    title: 'OT/IT Industrial Security & Firewall Compliance',
    description: 'Operational technology (OT) network security boundaries must be audited before bi-directional telemetry handshake.',
    severity: 'HIGH',
    requiredAction: 'Conduct IEC 62443 industrial OT security audit for digital twin data gateway.',
  });

  // Gap 6: Third-Party Engineering Operational Safety Sign-off
  gaps.push({
    gapId: 'GAP-006',
    category: 'HUMAN_REVIEW',
    title: 'Formal Multi-Disciplinary Engineering Review Sign-off',
    description: 'Digital twin recommendations require formal review sign-off by petroleum reservoir, production, and facilities engineers.',
    severity: 'HIGH',
    requiredAction: 'Establish formal engineering sign-off workflow with clear authority thresholds.',
  });

  return gaps;
}

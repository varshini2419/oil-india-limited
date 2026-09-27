/**
 * BAGHEWALA DIGITAL TWIN — DATA GAP PRIORITIZATION ENGINE
 * 
 * Classifies documented Baghewala knowledge gaps (SHARP D4.1 Table 6) into
 * HIGH PRIORITY, MEDIUM PRIORITY, or LOW PRIORITY based on decision impact,
 * current availability, and uncertainty contribution.
 */

import type { BaghewalaKnowledgeGap } from '../../services/baghewalaRagService';

export interface PrioritizedDataGap extends BaghewalaKnowledgeGap {
  priority: 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY';
  priorityScore: number; // 0 - 100
  decisionImpactExplanation: string;
}

export const DOCUMENTED_BAGHEWALA_GAPS: BaghewalaKnowledgeGap[] = [
  {
    id: 'GAP-BGW-01',
    title: 'Downhole Steam Quality & Pressure Loss Telemetry',
    topic: 'Thermal Injection',
    documentedGap: 'No continuous bottomhole steam quality or pressure monitoring installed on Baghewala CSS injection wells.',
    sourceDocument: 'SHARP D4.1 Report',
    sourcePage: 'Table 6',
    impactOnSimulation: 'High uncertainty in actual heat delivery to matrix and steam chamber development.',
  },
  {
    id: 'GAP-BGW-02',
    title: 'High-Temperature Relative Permeability Curves (k_ro / k_rw)',
    topic: 'Reservoir Fluid Dynamics',
    documentedGap: 'Relative permeability temperature dependency measured up to 80°C only; no 200°C+ thermal core floods available for Jodhpur sandstone.',
    sourceDocument: 'SPE 100642 / SHARP D4.1',
    sourcePage: 'Page 45',
    impactOnSimulation: 'Mobility ratio and water cut predictions at elevated temperatures carry residual risk.',
  },
  {
    id: 'GAP-BGW-03',
    title: 'Inter-well Thermal Interference & Breakthrough Logging',
    topic: 'Pattern Performance',
    documentedGap: 'Observation wells lack continuous fiber-optic Distributed Temperature Sensing (DTS) to track steam cresting.',
    sourceDocument: 'Oil India Rajasthan Technical Note',
    sourcePage: 'Page 12',
    impactOnSimulation: 'Risk of undetected thermal short-circuiting between injector and producer.',
  },
  {
    id: 'GAP-BGW-04',
    title: 'High-Viscosity Sucker Rod Dynamometer Measurements under Thermal Load',
    topic: 'Artificial Lift Mechanical Mechanics',
    documentedGap: 'Surface load cell data recorded without downhole pump dynamometer card card-transducers.',
    sourceDocument: 'Baghewala Field Operating Record BGW-8',
    sourcePage: 'Page 88',
    impactOnSimulation: 'Rod friction drag in 15,000+ cP cold crude is estimated rather than downhole-measured.',
  },
];

export function evaluateDataGapPriorities(
  gaps: BaghewalaKnowledgeGap[] = DOCUMENTED_BAGHEWALA_GAPS,
  activeRiskLevel: string = 'OPTIMAL'
): PrioritizedDataGap[] {
  return gaps.map((gap) => {
    let score = 50; // default base score

    if (gap.id === 'GAP-BGW-01') {
      score = activeRiskLevel === 'CRITICAL' || activeRiskLevel === 'HIGH' ? 95 : 85;
    } else if (gap.id === 'GAP-BGW-04') {
      score = activeRiskLevel === 'CRITICAL' || activeRiskLevel === 'HIGH' ? 90 : 75;
    } else if (gap.id === 'GAP-BGW-02') {
      score = 65;
    } else if (gap.id === 'GAP-BGW-03') {
      score = 55;
    }

    let priority: 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY' = 'MEDIUM PRIORITY';
    if (score >= 80) {
      priority = 'HIGH PRIORITY';
    } else if (score < 60) {
      priority = 'LOW PRIORITY';
    }

    return {
      ...gap,
      priority,
      priorityScore: score,
      decisionImpactExplanation: `Gaps in ${gap.topic.toLowerCase()} contribute to modeled uncertainty in field operational decision-support.`,
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}

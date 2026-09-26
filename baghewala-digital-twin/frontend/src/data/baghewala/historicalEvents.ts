import type { HistoricalEvent } from './types';

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: 'EVT_DISCOVERY_1991',
    year: 1991,
    title: 'Baghewala Heavy Oil Discovery',
    category: 'discovery',
    description: 'Oil India Limited (OIL) discovered extra-heavy oil in the Jodhpur Sandstone formation of the Bikaner-Nagaur Basin, Rajasthan.',
    sourceId: 'SRC_OIL_PUB_01',
    sourceType: 'documented',
  },
  {
    id: 'EVT_APPRAISAL_1995',
    year: 1995,
    title: 'Field Reservoir Appraisal',
    category: 'appraisal',
    description: 'Reservoir evaluation confirmed high permeability quartzose sandstone saturated with ~12-14° API crude having static viscosity ~15,000 cP at native temperature.',
    sourceId: 'SRC_OIL_PUB_01',
    sourceType: 'documented',
  },
  {
    id: 'EVT_PILOT_CSS_2006',
    year: 2006,
    title: 'Pilot Cyclic Steam Stimulation (CSS) Trials',
    category: 'pilot_trial',
    description: 'OIL initiated pilot huff-and-puff steam injection trials. Steam soak significantly reduced crude viscosity and enabled initial oil inflow.',
    sourceId: 'SRC_SPE_CSS_03',
    sourceType: 'documented',
  },
  {
    id: 'EVT_LIFT_EVAL_2012',
    year: 2012,
    title: 'SRP & Variable Frequency Drive Integration',
    category: 'development',
    description: 'Evaluation of Sucker Rod Pumping (SRP) systems with VFD speed control to optimize drawdown and prevent steam breakthrough during production phases.',
    sourceId: 'SRC_DGH_INDIA_02',
    sourceType: 'documented',
  },
  {
    id: 'EVT_TWIN_PROTOTYPE_2026',
    year: 2026,
    title: 'SIH Digital Twin Prototype Foundation',
    category: 'milestone',
    description: 'Development of the SIH Baghewala Heavy-Oil Digital Twin prototype combining 2D schematic visualization, CSS thermal dynamics, and SRP artificial lift monitoring.',
    sourceId: 'SRC_ESTIMATION_04',
    sourceType: 'documented',
  },
];

import type { DataSource } from './types';

export const SOURCES_REGISTRY: Record<string, DataSource> = {
  SRC_OIL_PUB_01: {
    id: 'SRC_OIL_PUB_01',
    title: 'Heavy Oil Exploration & Exploitation in Bikaner-Nagaur Basin',
    publisher: 'Oil India Limited (OIL) Technical Reports',
    year: 1995,
    url: null,
    notes: 'Primary documentation of Baghewala discovery and early heavy oil reservoir characterization.',
  },
  SRC_DGH_INDIA_02: {
    id: 'SRC_DGH_INDIA_02',
    title: 'Hydrocarbon Resources & Field Profiles of Rajasthan Basins',
    publisher: 'Directorate General of Hydrocarbons (DGH), India',
    year: 2012,
    url: null,
    notes: 'Official field profile details for Baghewala structure in Jodhpur Sandstone.',
  },
  SRC_SPE_CSS_03: {
    id: 'SRC_SPE_CSS_03',
    title: 'Pilot Cyclic Steam Stimulation (CSS) Trials in Baghewala Heavy Oil Field',
    publisher: 'Society of Petroleum Engineers (SPE) Literature',
    year: 2006,
    url: null,
    notes: 'Documented pilot CSS cycle injection parameters, viscosity response, and thermal recovery trials.',
  },
  SRC_ESTIMATION_04: {
    id: 'SRC_ESTIMATION_04',
    title: 'SIH Prototype Engineering Representative Scenario Assumption',
    publisher: 'Baghewala Digital Twin Engineering Team',
    year: 2026,
    url: null,
    notes: 'Representative parameter value used where specific published well logs are unreleased.',
  },
};

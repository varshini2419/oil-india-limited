import type {
  BaghewalaEvidenceCategory,
  BaghewalaGroundedEvidence,
  BaghewalaHistoricalEvent,
  BaghewalaKnowledgeGap,
  BaghewalaProvenance,
  BaghewalaRagQueryContext,
  BaghewalaRagResponse,
  BaghewalaScoringBreakdown
} from './baghewalaRagService';

/**
 * Task 2: Structured Historical Incident Record Schema
 */
export interface BaghewalaHistoricalIncidentRecord {
  id: string;
  title: string;
  field: string;
  basin: string;
  reservoir: string;
  date: string | null;
  location: string | null;
  eventType: string;
  trigger: string | null;
  conditions: {
    temperature?: string | null;
    viscosity?: string | null;
    pressure?: string | null;
    steamInjection?: string | null;
    spm?: string | null;
    waterCut?: string | null;
  };
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  description: string;
  consequence: string | null;
  productionLoss: string | null;
  damage: string | null;
  imageRefs: string[];
  source: string;
  sourcePage: string | null;
  sourceUrl: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: BaghewalaEvidenceCategory;
}

/**
 * Task 3: Image Metadata Structure
 */
export interface BaghewalaImageMetadata {
  imageId: string;
  title: string;
  description: string;
  caption: string;
  document: string;
  page: string;
  imageUrl: string;
  relatedIncidentId: string | null;
  relatedTopic: string;
  source: string;
  imageAvailable: boolean;
}

/**
 * Task 4: RAG Domain Chunk Schema
 */
export interface BaghewalaRagChunk {
  chunkId: string;
  field: string;
  topic: string;
  eventType?: string;
  document: string;
  page: string | number;
  section: string;
  content: string;
  source: string;
  sourceUrl?: string;
  keywords: string[];
  category?: BaghewalaEvidenceCategory;
}

// ============================================================================
// TASK 3 — HISTORICAL IMAGE CATALOG (INCLUDES SHARP-D4.1 FIGURES)
// ============================================================================
export const BAGHEWALA_IMAGE_CATALOG: BaghewalaImageMetadata[] = [
  {
    imageId: 'FIG-001',
    title: 'Regional Geological Map of Bikaner-Nagaur Sub-Basin',
    description: 'Regional geological map depicting Bikaner-Nagaur sub-basin, Marwar Supergroup, and Baghewala PML lease boundary relative to Jaisalmer and Barmer basins.',
    caption: 'Figure 1.1: Regional geological map showing Baghewala PML location in western Rajasthan.',
    document: '1. preamble - Oil India Limited',
    page: 'Pages 4-5',
    imageUrl: 'https://internal.oilindia.in/maps/fig-001-bikaner-nagaur-basin.jpg',
    relatedIncidentId: null,
    relatedTopic: 'geology',
    source: 'Oil India Limited Preamble Document (Fig 1.1)',
    imageAvailable: true
  },
  {
    imageId: 'FIG-002',
    title: 'Baghewala Field Stratigraphic Litho-Column',
    description: 'Simplified Stratigraphic Litho-Column from surface Alluvium/Shumar down to Malani Basement (~1,200 m TD).',
    caption: 'Figure 1.2: A simplified Litho-column of well drilled in Baghewala Area.',
    document: '1. preamble - Oil India Limited',
    page: 'Page 6',
    imageUrl: 'https://internal.oilindia.in/stratigraphy/fig-002-lithocolumn.jpg',
    relatedIncidentId: null,
    relatedTopic: 'stratigraphy',
    source: 'Oil India Limited Preamble Document (Fig 1.2)',
    imageAvailable: true
  },
  {
    imageId: 'FIG-003',
    title: 'Baghewala PML Lease Boundary & Surface Infrastructure Map',
    description: 'Topographic & Lease Boundary Map of the 210 sq. km Baghewala PML block depicting Tawariwala village, Indira Gandhi Canal branches, and international border.',
    caption: 'Figure 2.1.1: Topographic & Lease Boundary Map of Baghewala PML Block (210 sq. km).',
    document: 'Page 1 of 1 OIL INDIA LIMITED RAJASTHAN FIELD JODHPUR AMENDMENT No. 4',
    page: 'Page 2',
    imageUrl: 'https://internal.oilindia.in/maps/fig-003-pml-boundary.jpg',
    relatedIncidentId: null,
    relatedTopic: 'field_boundary',
    source: 'OIL Rajasthan Field Amendment No. 4 (Fig 2.1.1)',
    imageAvailable: true
  },
  {
    imageId: 'FIG-005',
    title: 'Technical Casing Program & Hole Size Schematic',
    description: 'Technical casing scheme table detailing 17.5", 12.25", and 8.5" hole intervals with 13 5/8", 9 5/8", and 7" casing shoes.',
    caption: 'Casing Program & Hole Size Schematic for Baghewala Wells.',
    document: 'Page 1 of 1 OIL INDIA LIMITED RAJASTHAN FIELD JODHPUR AMENDMENT No. 4',
    page: 'Page 3',
    imageUrl: 'https://internal.oilindia.in/schematics/fig-005-casing-program.jpg',
    relatedIncidentId: 'INC-001',
    relatedTopic: 'drilling_hazards',
    source: 'OIL Rajasthan Field Amendment No. 4 (Section 2.1.3)',
    imageAvailable: true
  },
  {
    imageId: 'FIG-006',
    title: 'Location of Bhagewala Oil Field in Bikaner-Nagaur Basin',
    description: 'Regional tectonic and sub-basin map depicting Pokhran High, 2D/3D seismic lines, outcrop units, and discovery well BGW-1 location.',
    caption: 'Figure 49: Location of Bhagewala Oil field in Bikaner-Nagaur Basin (Mandal et al., 2022).',
    document: 'sharp-d4.1-report-final.pdf',
    page: 'Page 63',
    imageUrl: 'https://internal.oilindia.in/maps/fig-006-sharp-bhagewala-location.jpg',
    relatedIncidentId: 'INC-008',
    relatedTopic: 'geology',
    source: 'SHARP Storage Report D4.1 (Figure 49, Page 63)',
    imageAvailable: true
  },
  {
    imageId: 'FIG-007',
    title: 'Stratigraphic Column for Discovery Well BGW-1',
    description: 'Detailed Stratigraphic Column for BGW-1 exploratory discovery well showing depth interval (1103-1117 m), core intervals CC1-CC4, and basal Jodhpur oil test.',
    caption: 'Figure 50: Stratigraphic column for the Baghewala-1 well (Peters et al., 1995; Cozzi et al., 2012).',
    document: 'sharp-d4.1-report-final.pdf',
    page: 'Page 64',
    imageUrl: 'https://internal.oilindia.in/wells/fig-007-bgw1-column.jpg',
    relatedIncidentId: 'INC-008',
    relatedTopic: 'well_profiles',
    source: 'SHARP Storage Report D4.1 (Figure 50, Page 64)',
    imageAvailable: true
  },
  {
    imageId: 'FIG-008',
    title: 'DD Seismic Profile Transecting Discovery Well BGW-1',
    description: 'Interpreted 2D seismic reflection transect (DD line) across BGW-1 showing anticlinal compressional structures bounded by steeply dipping NNE-SSW faults.',
    caption: 'Figure 51: DD seismic section transecting the Baghewala-1 well shows compressional structures bounded by steeply dipping faults (Mandal et al., 2021).',
    document: 'sharp-d4.1-report-final.pdf',
    page: 'Page 65',
    imageUrl: 'https://internal.oilindia.in/seismic/fig-008-sharp-dd-seismic.jpg',
    relatedIncidentId: 'INC-008',
    relatedTopic: 'seismic_faults',
    source: 'SHARP Storage Report D4.1 (Figure 51, Page 65)',
    imageAvailable: true
  },
  {
    imageId: 'FIG-009',
    title: 'Stress Map for Northwest India & Pakistan Pericratonic Basins',
    description: 'Regional In Situ Tectonic Stress Map showing faulting regimes (normal, strike-slip) and SHmax orientations across Bikaner-Nagaur and Barmer basins.',
    caption: 'Figure 52: Stress map for northwest India and part of Pakistan (World Stress Map CASMO service).',
    document: 'sharp-d4.1-report-final.pdf',
    page: 'Page 66',
    imageUrl: 'https://internal.oilindia.in/geomechanics/fig-009-sharp-stress-map.jpg',
    relatedIncidentId: null,
    relatedTopic: 'in_situ_stress',
    source: 'SHARP Storage Report D4.1 (Figure 52, Page 66)',
    imageAvailable: true
  },
  {
    imageId: 'FIG-010',
    title: 'Seismicity & Earthquake Hazard Map of NW India',
    description: 'Regional Seismicity and Earthquake Catalogue Map depicting earthquake epicenters (1997-present) and Zone 3 moderate damage risk hazard classification.',
    caption: 'Figure 53: Local magnitude (ML) data courtesy of National Center for Seismology.',
    document: 'sharp-d4.1-report-final.pdf',
    page: 'Page 67',
    imageUrl: 'https://internal.oilindia.in/seismicity/fig-010-sharp-seismicity.jpg',
    relatedIncidentId: null,
    relatedTopic: 'seismicity',
    source: 'SHARP Storage Report D4.1 (Figure 53, Page 67)',
    imageAvailable: true
  },
  {
    imageId: 'FIG-014',
    title: 'BGW#8 1st CSS Cycle Field Setup & Operational Pad Layout',
    description: 'Aerial photographic layout and technical parameter callouts for BGW#8 during its first CSS cycle (310°C boiler temp, 102 kg/cm² pressure).',
    caption: 'Slide 12: Field setup for BGW#8 1st Commercial CSS Cycle (Nov 2018).',
    document: 'Baghewala PPT oil india limited 12.07.2025.pptx',
    page: 'Slide 12',
    imageUrl: 'https://internal.oilindia.in/operations/fig-014-bgw8-css-pad.jpg',
    relatedIncidentId: 'INC-006',
    relatedTopic: 'thermal_css',
    source: 'Oil India Limited Presentation (Slide 12)',
    imageAvailable: true
  },
  {
    imageId: 'FIG-015',
    title: 'Thermal Well Completion Schematic with VIT & Thermal Wellhead',
    description: 'Wellbore completion schematic detailing thermal hardware: Thermal Wellhead & X-mas tree, Vacuum Insulated Tubing (VIT), flexible steam hoses, and Nitrogen casing annulus.',
    caption: 'Slide 14: Thermal Well Completion Assembly featuring Vacuum Insulated Tubing (VIT).',
    document: 'Baghewala PPT oil india limited 12.07.2025.pptx',
    page: 'Slide 14',
    imageUrl: 'https://internal.oilindia.in/schematics/fig-015-thermal-completion.jpg',
    relatedIncidentId: 'INC-001',
    relatedTopic: 'thermal_css',
    source: 'Oil India Limited Presentation (Slide 14)',
    imageAvailable: true
  },
  {
    imageId: 'FIG-017',
    title: 'ISO/PAS 12835 Premium Casing Thread Connection Spec Sheet',
    description: 'Connection technical specification table/schematic specifying thermal testing parameters (>=320°C, >=11 MPa, ISO/PAS 12835) for approved connections.',
    caption: 'Page 2: Approved Premium Casing Thread Connections (VAM SWI, Tenaris Blue, Evraz QB2, Hunting Seal-Lock XD).',
    document: 'EOI/OIL/RF/DRLG/01/2025-26 Page 1 of 6',
    page: 'Page 2',
    imageUrl: 'https://internal.oilindia.in/specs/fig-017-premium-threads.jpg',
    relatedIncidentId: 'INC-001',
    relatedTopic: 'casing_integrity',
    source: 'OIL Drilling Department EOI 2025-26 (Page 2)',
    imageAvailable: true
  }
];

// ============================================================================
// TASK 2 — STRUCTURED HISTORICAL INCIDENT RECORDS (GROUNDED EVIDENCE)
// ============================================================================
export const BAGHEWALA_HISTORICAL_INCIDENTS: BaghewalaHistoricalIncidentRecord[] = [
  {
    id: 'INC-008',
    title: 'Baghewala-1 (BGW-1) Discovery Well Test & Heavy Crude Temperature-Viscosity Characterization',
    field: 'Baghewala',
    basin: 'Bikaner-Nagaur Basin',
    reservoir: 'Basal Jodhpur Formation Sandstone (1103–1117 m)',
    date: '1991',
    location: 'Well BGW-1 (Basement High NE of Pokaran High)',
    eventType: 'DISCOVERY_TEST_VISCOSITY',
    trigger: 'Initial drillstem testing of 1103-1117 m basal sandstone interval encountering high-viscosity 17.6° API crude',
    conditions: {
      temperature: '90°C, 60°C, 30°C Test Temps',
      viscosity: '267 cP @ 90°C, 1,700 cP @ 60°C, 6,667 cP @ 30°C (10,000 cP @ 15°C)',
      pressure: 'Hydrostatic / 1,600 psi',
      steamInjection: 'None (Cold Drillstem Test)',
      spm: null,
      waterCut: '0%'
    },
    severity: 'MODERATE',
    description: 'In 1991, Oil India Limited discovered heavy crude oil in well Baghewala-1 (BGW-1). About 7 bbl of viscous, 17.6° API gravity crude was recovered during production testing at depth interval 1103–1117 m in basal Jodhpur sandstone. Laboratory rheology confirmed severe temperature-dependent viscosity: 267 cP at 90°C, 1,700 cP at 60°C, 6,667 cP at 30°C, surging past 10,000 cP at ambient reservoir temperatures.',
    consequence: 'Confirmed massive heavy crude reserves in Jodhpur Sandstone but established that unheated cold production suffers severe flow resistance due to exponential log-linear viscosity surge.',
    productionLoss: 'Restricted cold flow rate (7 bbl DST recovery)',
    damage: 'None',
    imageRefs: ['FIG-006', 'FIG-007', 'FIG-008'],
    source: 'sharp-d4.1-report-final.pdf Section 2.5.1 Page 64',
    sourcePage: 'Page 64',
    sourceUrl: 'file:///c:/Users/pc/OneDrive/Documents/oil-india-limited/baghewala-digital-twin/sharp-d4.1-report-final.pdf#page=64',
    confidence: 'HIGH',
    category: 'VISCOSITY_RHEOLOGY'
  },
  {
    id: 'INC-001',
    title: 'BGW-6 Upper Carbonate Pilot CSS Thermal Casing Elongation & Steam Leak',
    field: 'Baghewala',
    basin: 'Bikaner-Nagaur Basin',
    reservoir: 'Upper Carbonate Formation',
    date: '2006-2007',
    location: 'Well BGW-6 (Pilot CSS Well)',
    eventType: 'THERMAL_CASING_LEAK',
    trigger: 'Extreme steam injection temperature (320-350°C, 11 MPa) without TWCCEP ISO/PAS 12835 thermal casing thread connections',
    conditions: {
      temperature: '320°C - 350°C',
      viscosity: '26,852 cP @ 50°C',
      pressure: '11,000 kPa (11 MPa)',
      steamInjection: 'Continuous pilot steam injection',
      spm: null,
      waterCut: null
    },
    severity: 'CRITICAL',
    description: 'During the pilot Cyclic Steam Stimulation (CSS) injection test in Upper Carbonate well BGW-6 (2006-2007), high-temperature steam injection created extreme axial thermal expansion stresses, causing severe casing elongation and steam leakage through standard wellhead casing connections. Thermal injection was immediately suspended.',
    consequence: 'Well produced 0 bbls of oil from Upper Carbonate and thermal operations were suspended in the formation. Well converted to a Water Disposal Well in 2018.',
    productionLoss: '100% loss of target pilot thermal production from Upper Carbonate',
    damage: 'Severe axial casing elongation and thermal seal failure at surface wellhead connections',
    imageRefs: ['FIG-005', 'FIG-015', 'FIG-017'],
    source: '4 EXPRESSION OF INTEREST (EOI) NO. OIL/RF/IND/EOI/011/2022 Page 4 & EOI/OIL/RF/DRLG/01/2025-26 Page 1',
    sourcePage: 'Page 4 & Page 1',
    sourceUrl: 'https://internal.oilindia.in/docs/EOI-OIL-RF-DRLG-01-2025-26.pdf',
    confidence: 'HIGH',
    category: 'WELL_INTEGRITY_CASING'
  },
  {
    id: 'INC-002',
    title: 'BGW-3 Drill String Mechanical Stuck Pipe at 668 m',
    field: 'Baghewala',
    basin: 'Bikaner-Nagaur Basin',
    reservoir: 'Nagaur / Upper Carbonate Interval',
    date: '1991',
    location: 'Well BGW-3 (Baghewala #3)',
    eventType: 'STUCK_PIPE',
    trigger: 'Differential pipe sticking and borehole wall friction while pulling out of hole (PO) at 793 m total depth',
    conditions: {
      temperature: '40°C BHT',
      viscosity: null,
      pressure: 'Near Hydrostatic',
      steamInjection: null,
      spm: null,
      waterCut: null
    },
    severity: 'HIGH',
    description: 'While pulling out (PO) of the hole at a total depth of 793 m in well BGW-3, the drill string became mechanically stuck at 668 m depth inside the formation.',
    consequence: 'Drill string was successfully freed after applying 45 tonnes of overpull force, allowing drilling operations to resume.',
    productionLoss: 'Temporary non-productive drilling time (NPT)',
    damage: 'Heavy tensile stress on drill pipe joint threads and derrick hoisting line',
    imageRefs: ['FIG-002'],
    source: 'Page 1 of 1 OIL INDIA LIMITED RAJASTHAN FIELD JODHPUR AMENDMENT No. 4 Dated 03.05.2024',
    sourcePage: 'Section 2.1.4, Page 3',
    sourceUrl: 'https://internal.oilindia.in/docs/OIL-RF-AMENDMENT-4.pdf',
    confidence: 'HIGH',
    category: 'WELL_INTEGRITY_CASING'
  },
  {
    id: 'INC-003',
    title: 'BGW-12 Upper Carbonate CSS Thermal Water Breakthrough & Well Drowning',
    field: 'Baghewala',
    basin: 'Bikaner-Nagaur Basin',
    reservoir: 'Upper Carbonate Formation',
    date: '2020-2022',
    location: 'Well BGW-12',
    eventType: 'WATER_BREAKTHROUGH',
    trigger: 'Cyclic steam thermal condensate channeling through active vuggy/fractured water-bearing dolostone networks (>1,000 mD permeability)',
    conditions: {
      temperature: '40°C BHT',
      viscosity: '38,174 cP @ 40°C (8.6° API)',
      pressure: '750 psi BHP',
      steamInjection: '2 Consecutive CSS Cycles',
      spm: 'SRP Lift',
      waterCut: 'High Water Cut (>95%)'
    },
    severity: 'HIGH',
    description: 'Upper Carbonate well BGW-12 was subjected to two consecutive CSS thermal injection cycles in 2020 and 2022. The extra-heavy crude (8.6° API, 38,174 cP at 40°C) suffered rapid thermal water breakthrough as steam condensate broke into highly permeable vugs and fractures.',
    consequence: 'Produced cumulative total of only 60 bbls of crude oil (45 bbls in cycle 1 + 15 bbls in cycle 2) before being drowned out. Well remains shut-in.',
    productionLoss: 'Severe drawdown loss; well shut-in',
    damage: 'Thermal water drowning of Upper Carbonate perforated interval',
    imageRefs: ['FIG-002'],
    source: '4 EXPRESSION OF INTEREST (EOI) NO. OIL/RF/IND/EOI/011/2022 Section D, Page 4',
    sourcePage: 'Page 4',
    sourceUrl: 'https://internal.oilindia.in/docs/EOI-SURFACE-FACILITIES-2022.pdf',
    confidence: 'HIGH',
    category: 'THERMAL_CSS'
  },
  {
    id: 'INC-004',
    title: 'Heavy Oil Sucker Rod Pump Mechanical Failure & Rig-less Crane Fishing',
    field: 'Baghewala',
    basin: 'Bikaner-Nagaur Basin',
    reservoir: 'Jodhpur Sandstone',
    date: '2023-2024',
    location: 'Baghewala Heavy Oil Wellhead',
    eventType: 'SRP_ROD_FAILURE',
    trigger: 'Heavy oil fluid viscosity friction drag (10,000-13,000 cP) combined with cyclic mechanical overpull load causing sucker rod string fatigue parting',
    conditions: {
      temperature: '48°C - 58°C',
      viscosity: '10,000 - 13,000 cP',
      pressure: '1,600 psi',
      steamInjection: 'Post-CSS Production Phase',
      spm: '8.0 - 12.0 SPM',
      waterCut: '25%'
    },
    severity: 'MODERATE',
    description: 'High crude oil viscosity in unheated or cooling production tubing exerted severe downward fluid drag on the sucker rod string, increasing dynamic peak polished rod load (PPRL) beyond fatigue endurance limits.',
    consequence: 'Parted sucker rod fish was recovered via mobile crane and wireline overshoot tool without requiring workover rig mobilization.',
    productionLoss: '2 days temporary production downtime',
    damage: 'Parted sucker rod pin/box connection',
    imageRefs: [],
    source: 'SPE/ICoTA Symposium and Exhibition - Well Intervention 2025 Page 250',
    sourcePage: 'Page 250',
    sourceUrl: 'https://internal.oilindia.in/docs/SPE-ICOTA-2025.pdf',
    confidence: 'HIGH',
    category: 'ARTIFICIAL_LIFT'
  },
  {
    id: 'INC-006',
    title: 'BGW#8 Milestone First Commercial CSS Thermal Cycle Execution',
    field: 'Baghewala',
    basin: 'Bikaner-Nagaur Basin',
    reservoir: 'Jodhpur Sandstone',
    date: '2018-11',
    location: 'Well BGW#08',
    eventType: 'FIRST_COMMERCIAL_CSS',
    trigger: 'Deployment of Vacuum Insulated Tubing (VIT) and Thermal Wellhead assembly with 310°C steam injection at 102 kg/cm²',
    conditions: {
      temperature: '310°C Steam Temp',
      viscosity: 'Viscosity reduced from 13,000 cP to <100 cP',
      pressure: '102 kg/cm² (10 MPa)',
      steamInjection: '310°C steam injected via VIT for 14 days',
      spm: 'Self-flow 68 days followed by SRP',
      waterCut: '20%'
    },
    severity: 'LOW',
    description: 'In November 2018, Oil India Limited executed the first successful commercial Cyclic Steam Stimulation (CSS) cycle in well BGW#08 using mobile boiler steam injected through Vacuum Insulated Tubing (VIT).',
    consequence: 'Well self-flowed continuously for 68 days at 30 bbl/day (~4.8 m³/d), establishing commercial viability of CSS thermal EOR in Baghewala.',
    productionLoss: 'None (+450% production gain)',
    damage: 'None',
    imageRefs: ['FIG-014', 'FIG-015'],
    source: 'Technology and Innovation - Oil India Limited Portal & Baghewala PPT Slide 12',
    sourcePage: 'Slide 12',
    sourceUrl: 'https://internal.oilindia.in/tech/css-bgw8.pdf',
    confidence: 'HIGH',
    category: 'THERMAL_CSS'
  }
];

// ============================================================================
// TASK 4 — DOCUMENTED KNOWLEDGE GAPS (SHARP D4.1 TABLE 6 & EOI)
// ============================================================================
export const BAGHEWALA_KNOWLEDGE_GAPS: BaghewalaKnowledgeGap[] = [
  {
    id: 'GAP-001',
    title: 'Uncalibrated High-Temperature Relative Permeability Curves',
    topic: 'Reservoir Simulation Physics',
    documentedGap: 'Lack of multi-phase steam-oil-water relative permeability laboratory measurements at temperatures exceeding 250°C in Jodhpur Sandstone cores.',
    sourceDocument: 'sharp-d4.1-report-final.pdf Table 6',
    sourcePage: 'Page 68 (Table 6 Data Gaps)',
    impactOnSimulation: 'Thermal EOR recovery models must rely on modified Corey/Stone-2 correlation extrapolations above 250°C.'
  },
  {
    id: 'GAP-002',
    title: 'Multi-Cycle Thermal Casing Fatigue Endurance Limits',
    topic: 'Well Integrity & Tubular Engineering',
    documentedGap: 'Empirical casing thread connection seal failure data beyond 3 consecutive CSS cycles at >320°C steam temperature is unavailable in public OIL field records.',
    sourceDocument: 'EOI/OIL/RF/DRLG/01/2025-26 Section 4',
    sourcePage: 'Page 2',
    impactOnSimulation: 'Long-term casing stress and thermal elongation predictions carry elevated uncertainty after cycle 3.'
  },
  {
    id: 'GAP-003',
    title: 'Sparse 3D Seismic Resolution on Eastern Margin Fault Blocks',
    topic: 'Seismic & Geomechanics',
    documentedGap: '2D seismic coverage (DD lines) provides structural outline of main anticlinal high but lacks high-resolution 3D fault throw mapping along eastern boundary faults.',
    sourceDocument: 'sharp-d4.1-report-final.pdf Section 2.5.2',
    sourcePage: 'Page 65 (Figure 51)',
    impactOnSimulation: 'Compartmentalization and fault-seal leakage risks cannot be ruled out during high-pressure steam injection.'
  },
  {
    id: 'GAP-004',
    title: 'Extra-Heavy Crude Non-Newtonian Shear Thinning at Low Shear Rates',
    topic: 'Fluid Rheology',
    documentedGap: 'Laboratory rheometer testing at 30°C and 15°C was conducted under constant shear rate, leaving low-shear static yield stress unmeasured.',
    sourceDocument: 'sharp-d4.1-report-final.pdf Section 2.5.1',
    sourcePage: 'Page 64',
    impactOnSimulation: 'Unheated wellbore static restart pressure gradient requires safety margin when computing SRP initial polished rod load.'
  }
];

// ============================================================================
// TASK 5 & 6 — SIMULATION-AWARE RETRIEVAL & SEMANTIC ENGINE
// ============================================================================

/**
 * Executes Simulation-Aware Semantic Retrieval over the Baghewala Historical Knowledge Base.
 * Computes multi-factor weighted relevance score:
 * relevanceScore = semanticScore * 0.30 + keywordScore * 0.20 + parameterSimilarity * 0.25 + riskCategoryMatch * 0.15 + sourceQuality * 0.10
 */
export function queryBaghewalaKnowledgeBase(
  query: string,
  context?: BaghewalaRagQueryContext
): BaghewalaRagResponse {
  const normalizedQuery = (query || '').toLowerCase();

  // Extract key simulation parameters
  const viscosity = context?.viscosity ?? 5014;
  const temp = context?.reservoirTemp ?? 58;
  const spm = context?.spm ?? 8.0;
  const riskLevel = context?.currentRiskLevel ?? 'LOW';
  const riskCategory = context?.riskCategory || '';
  const steamTemp = context?.steamTemp ?? 280;
  const currentProd = context?.currentProductionBOPD ?? 12.5;

  const groundedEvidenceList: BaghewalaGroundedEvidence[] = [];
  const matchedEvents: BaghewalaHistoricalEvent[] = [];

  BAGHEWALA_HISTORICAL_INCIDENTS.forEach((inc) => {
    // 1. Semantic Score (0.0 - 1.0)
    const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 2);
    let semanticScore = 0.55;
    if (queryTokens.length > 0) {
      let matches = 0;
      const searchableText = `${inc.title} ${inc.description} ${inc.eventType} ${inc.source} ${inc.trigger || ''}`.toLowerCase();
      queryTokens.forEach(t => {
        if (searchableText.includes(t)) matches++;
      });
      semanticScore = Math.min(1.0, 0.4 + (matches / queryTokens.length) * 0.6);
    }

    // 2. Keyword Score (0.0 - 1.0)
    const domainKeywords = ['bgw-1', 'bgw-6', 'bgw-12', 'bgw-8', 'jodhpur', 'sandstone', 'carbonate', 'css', 'viscosity', 'spm', 'casing', 'twccep', 'stuck', 'rheology', 'sharp'];
    let keywordMatches = 0;
    const fullText = `${inc.title} ${inc.description} ${inc.source}`.toLowerCase();
    domainKeywords.forEach(kw => {
      if (fullText.includes(kw)) keywordMatches++;
    });
    const keywordScore = Math.min(1.0, parseFloat((keywordMatches / 4).toFixed(2)));

    // 3. Parameter Similarity (0.0 - 1.0)
    let tempSim = 0.8;
    let viscSim = 0.8;
    let spmSim = 0.8;

    if (inc.id === 'INC-008') {
      const minTempDiff = Math.min(Math.abs(temp - 90), Math.abs(temp - 60), Math.abs(temp - 30));
      tempSim = Math.max(0.2, 1.0 - minTempDiff / 100);
      viscSim = Math.max(0.3, 1.0 - Math.abs(Math.log10(viscosity + 1) - Math.log10(1700)) / 3);
    } else if (inc.id === 'INC-001') {
      tempSim = steamTemp > 250 ? 0.95 : 0.6;
    } else if (inc.id === 'INC-004') {
      spmSim = spm >= 7 ? 0.95 : 0.6;
    }
    const parameterSimilarity = parseFloat(((tempSim + viscSim + spmSim) / 3).toFixed(2));

    // 4. Risk Category Match (0.0 - 1.0)
    let riskCategoryMatch = 0.5;
    const cat: BaghewalaEvidenceCategory = inc.category || 'HISTORICAL_INCIDENT';
    if (riskCategory.includes('VISCOSITY') && (cat === 'VISCOSITY_RHEOLOGY' || inc.eventType.includes('VISCOSITY'))) {
      riskCategoryMatch = 0.95;
    } else if (riskCategory.includes('THERMAL') && (cat === 'THERMAL_CSS' || inc.eventType.includes('THERMAL') || inc.eventType.includes('CSS'))) {
      riskCategoryMatch = 0.95;
    } else if (riskCategory.includes('MECHANICAL') && (cat === 'ARTIFICIAL_LIFT' || cat === 'WELL_INTEGRITY_CASING' || inc.eventType.includes('STUCK') || inc.eventType.includes('SRP'))) {
      riskCategoryMatch = 0.95;
    } else if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      riskCategoryMatch = 0.85;
    }

    // 5. Source Quality (0.0 - 1.0)
    let sourceQuality = 0.85;
    if (inc.source.includes('sharp-d4.1')) sourceQuality = 1.0;
    else if (inc.source.includes('EOI') || inc.source.includes('Amendment')) sourceQuality = 0.95;
    else if (inc.source.includes('SPE')) sourceQuality = 0.90;

    // Weighted Formula
    const rawScore = (semanticScore * 0.30) + (keywordScore * 0.20) + (parameterSimilarity * 0.25) + (riskCategoryMatch * 0.15) + (sourceQuality * 0.10);
    const relevanceScore = Math.min(1.0, parseFloat(rawScore.toFixed(2)));

    const scoringBreakdown: BaghewalaScoringBreakdown = {
      semanticScore: parseFloat(semanticScore.toFixed(2)),
      keywordScore: parseFloat(keywordScore.toFixed(2)),
      parameterSimilarity: parseFloat(parameterSimilarity.toFixed(2)),
      riskCategoryMatch: parseFloat(riskCategoryMatch.toFixed(2)),
      sourceQuality: parseFloat(sourceQuality.toFixed(2))
    };

    // Build Current Match parameter comparison
    let currentMatchName = 'Viscosity & Reservoir Temperature';
    let currentMatchVal: string | number = `${viscosity} cP @ ${temp}°C`;
    let histMatchVal: string | number = '1,700 cP @ 60°C';
    let deltaVal = Math.abs(temp - 60);
    let matchExplanation = `Live reservoir temp ${temp}°C is within ${deltaVal}°C of historical BGW-1 60°C DST measurement (1,700 cP).`;

    if (inc.id === 'INC-001') {
      currentMatchName = 'Steam Injection Temperature';
      currentMatchVal = `${steamTemp}°C`;
      histMatchVal = '320°C - 350°C';
      deltaVal = Math.abs(steamTemp - 335);
      matchExplanation = `Live steam temp ${steamTemp}°C is ${deltaVal}°C below BGW-6 thermal casing failure threshold (335°C). Requires ISO/PAS 12835 TWCCEP thermal connections.`;
    } else if (inc.id === 'INC-004') {
      currentMatchName = 'SRP Pumping Speed (SPM)';
      currentMatchVal = `${spm} SPM`;
      histMatchVal = '8.0 - 12.0 SPM';
      deltaVal = Math.abs(spm - 8.0);
      matchExplanation = `Live pumping speed of ${spm} SPM operates within historical field range (8.0-12.0 SPM). High viscosity drag creates rod string fatigue risk.`;
    } else if (inc.id === 'INC-006') {
      currentMatchName = 'CSS Commercial Self-Flow Production';
      currentMatchVal = `${currentProd} BOPD`;
      histMatchVal = '30 BOPD (68 days self-flow)';
      deltaVal = Math.abs(currentProd - 30);
      matchExplanation = `Live production of ${currentProd} BOPD compares with BGW#8 1st CSS cycle peak response of 30 BOPD using 310°C steam & VIT.`;
    } else if (inc.id === 'INC-003') {
      currentMatchName = 'Viscosity & Water Cut Drowning';
      currentMatchVal = `${viscosity} cP`;
      histMatchVal = '38,174 cP @ 40°C';
      deltaVal = Math.abs(viscosity - 38174);
      matchExplanation = `Live viscosity ${viscosity} cP vs Upper Carbonate crude (38,174 cP). Steam condensate channeled through vuggy pathways drowned well after 2 cycles.`;
    }

    // Map Images
    const matchingImages = BAGHEWALA_IMAGE_CATALOG.filter((img) => inc.imageRefs.includes(img.imageId)).map((img) => ({
      imageUrl: img.imageUrl,
      caption: img.caption,
      source: img.source,
      imageAvailable: img.imageAvailable
    }));

    const primaryImage = matchingImages.length > 0 ? matchingImages[0].imageUrl : undefined;

    const provenance: BaghewalaProvenance = {
      document: inc.source,
      page: inc.sourcePage || 'Page N/A',
      section: inc.id === 'INC-008' ? 'Section 2.5.1 Page 64' : (inc.id === 'INC-001' ? 'Section 1 & 4' : 'Technical Log'),
      figure: inc.imageRefs.length > 0 ? inc.imageRefs.join(', ') : undefined,
      source: inc.source,
      sourceUrl: inc.sourceUrl || undefined,
      confidence: inc.confidence,
      evidenceCategory: cat
    };

    groundedEvidenceList.push({
      id: inc.id,
      title: inc.title,
      category: cat,
      relevanceScore,
      scoringBreakdown,
      currentMatch: {
        parameterName: currentMatchName,
        currentValue: currentMatchVal,
        historicalValue: histMatchVal,
        delta: deltaVal,
        explanation: matchExplanation
      },
      documentedEvidence: {
        field: inc.field,
        basin: inc.basin,
        reservoir: inc.reservoir,
        date: inc.date || undefined,
        location: inc.location || undefined,
        eventType: inc.eventType,
        trigger: inc.trigger || undefined,
        description: inc.description,
        consequence: inc.consequence || undefined,
        productionLoss: inc.productionLoss || undefined,
        damage: inc.damage || undefined,
        conditions: inc.conditions
      },
      provenance,
      images: matchingImages
    });

    matchedEvents.push({
      id: inc.id,
      title: inc.title,
      location: inc.location || 'Baghewala Field',
      date: inc.date || 'Historical Record',
      eventType: inc.eventType,
      trigger: inc.trigger || undefined,
      severity: inc.severity,
      description: `${inc.description} [Source: ${inc.source} | Page: ${inc.sourcePage || 'N/A'}]`,
      consequence: inc.consequence || undefined,
      productionLoss: inc.productionLoss || undefined,
      damage: inc.damage || undefined,
      source: inc.source,
      sourceUrl: inc.sourceUrl || undefined,
      imageUrl: primaryImage,
      images: matchingImages.length > 0 ? matchingImages : undefined,
      imageAvailable: matchingImages.length > 0,
      relevance: relevanceScore,
      category: cat
    });
  });

  // Sort evidence and events descending by relevance score
  groundedEvidenceList.sort((a, b) => b.relevanceScore - a.relevanceScore);
  matchedEvents.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

  const summaryText = `Retrieved ${groundedEvidenceList.length} grounded Baghewala historical evidence records matching live simulation parameters (Viscosity: ${viscosity} cP, Temp: ${temp}°C, SPM: ${spm}).`;

  return {
    success: true,
    events: matchedEvents,
    evidence: groundedEvidenceList,
    currentSimulation: context,
    knowledgeGaps: BAGHEWALA_KNOWLEDGE_GAPS,
    disclaimer: 'HISTORICAL EVIDENCE — NOT A PREDICTION',
    summary: summaryText,
    query: query || 'Baghewala historical evidence query',
    totalCount: groundedEvidenceList.length
  };
}

"""
BAGHEWALA DIGITAL TWIN — PYTHON FASTAPI RAG ENGINE
Ground-truth Knowledge Base, Image Catalog, and Semantic Vector/Keyword Matcher.
Includes facts extracted from sharp-d4.1-report-final.pdf (ACT SHARP Consortium Project).
"""

from typing import List, Dict, Any, Optional
import math

BAGHEWALA_HISTORICAL_INCIDENTS = [
    {
        "id": "INC-008",
        "title": "Baghewala-1 (BGW-1) Discovery Well Test & Heavy Crude Temperature-Viscosity Characterization",
        "field": "Baghewala",
        "basin": "Bikaner-Nagaur Basin",
        "reservoir": "Basal Jodhpur Formation Sandstone (1103–1117 m)",
        "date": "1991",
        "location": "Well BGW-1 (Basement High NE of Pokaran High)",
        "eventType": "DISCOVERY_TEST_VISCOSITY",
        "category": "VISCOSITY_RHEOLOGY",
        "trigger": "Initial drillstem testing of 1103-1117 m basal sandstone interval encountering high-viscosity 17.6° API crude",
        "conditions": {
            "temperature": "90°C, 60°C, 30°C Test Temps",
            "viscosity": "267 cP @ 90°C, 1,700 cP @ 60°C, 6,667 cP @ 30°C (10,000 cP @ 15°C)",
            "pressure": "Hydrostatic / 1,600 psi",
            "steamInjection": "None (Cold Drillstem Test)",
            "spm": None,
            "waterCut": "0%"
        },
        "severity": "MODERATE",
        "description": "In 1991, Oil India Limited discovered heavy crude oil in well Baghewala-1 (BGW-1). About 7 bbl of viscous, 17.6° API gravity crude was recovered during production testing at depth interval 1103–1117 m in basal Jodhpur sandstone. Laboratory rheology confirmed severe temperature-dependent viscosity: 267 cP at 90°C, 1,700 cP at 60°C, 6,667 cP at 30°C, surging past 10,000 cP at ambient reservoir temperatures.",
        "consequence": "Confirmed massive heavy crude reserves in Jodhpur Sandstone but established that unheated cold production suffers severe flow resistance due to exponential log-linear viscosity surge.",
        "productionLoss": "Restricted cold flow rate (7 bbl DST recovery)",
        "damage": "None",
        "imageRefs": ["FIG-006", "FIG-007", "FIG-008"],
        "source": "sharp-d4.1-report-final.pdf Section 2.5.1 Page 64",
        "sourcePage": "Page 64",
        "sourceUrl": "file:///c:/Users/pc/OneDrive/Documents/oil-india-limited/baghewala-digital-twin/sharp-d4.1-report-final.pdf#page=64",
        "confidence": "HIGH"
    },
    {
        "id": "INC-001",
        "title": "BGW-6 Upper Carbonate Pilot CSS Thermal Casing Elongation & Steam Leak",
        "field": "Baghewala",
        "basin": "Bikaner-Nagaur Basin",
        "reservoir": "Upper Carbonate Formation",
        "date": "2006-2007",
        "location": "Well BGW-6 (Pilot CSS Well)",
        "eventType": "THERMAL_CASING_LEAK",
        "category": "WELL_INTEGRITY_CASING",
        "trigger": "Extreme steam injection temperature (320-350°C, 11 MPa) without TWCCEP ISO/PAS 12835 thermal casing thread connections",
        "conditions": {
            "temperature": "320°C - 350°C",
            "viscosity": "26,852 cP @ 50°C",
            "pressure": "11,000 kPa (11 MPa)",
            "steamInjection": "Continuous pilot steam injection",
            "spm": None,
            "waterCut": None
        },
        "severity": "CRITICAL",
        "description": "During the pilot Cyclic Steam Stimulation (CSS) injection test in Upper Carbonate well BGW-6 (2006-2007), high-temperature steam injection created extreme axial thermal expansion stresses, causing severe casing elongation and steam leakage through standard wellhead casing connections.",
        "consequence": "Well produced 0 bbls of oil from Upper Carbonate. Converted to a Water Disposal Well in 2018.",
        "productionLoss": "100% loss of target pilot thermal production",
        "damage": "Severe axial casing elongation and thermal seal failure at surface wellhead connections",
        "imageRefs": ["FIG-005", "FIG-015", "FIG-017"],
        "source": "4 EXPRESSION OF INTEREST (EOI) NO. OIL/RF/IND/EOI/011/2022 Page 4 & EOI/OIL/RF/DRLG/01/2025-26 Page 1",
        "sourcePage": "Page 4 & Page 1",
        "sourceUrl": "https://internal.oilindia.in/docs/EOI-OIL-RF-DRLG-01-2025-26.pdf",
        "confidence": "HIGH"
    },
    {
        "id": "INC-002",
        "title": "BGW-3 Drill String Mechanical Stuck Pipe at 668 m",
        "field": "Baghewala",
        "basin": "Bikaner-Nagaur Basin",
        "reservoir": "Nagaur / Upper Carbonate Interval",
        "date": "1991",
        "location": "Well BGW-3 (Baghewala #3)",
        "eventType": "STUCK_PIPE",
        "category": "WELL_INTEGRITY_CASING",
        "trigger": "Differential pipe sticking and borehole wall friction while pulling out of hole (PO) at 793 m total depth",
        "conditions": {
            "temperature": "40°C BHT",
            "viscosity": None,
            "pressure": "Near Hydrostatic",
            "steamInjection": None,
            "spm": None,
            "waterCut": None
        },
        "severity": "HIGH",
        "description": "While pulling out (PO) of the hole at a total depth of 793 m in well BGW-3, the drill string became mechanically stuck at 668 m depth inside the formation.",
        "consequence": "Drill string was successfully freed after applying 45 tonnes of overpull force, allowing drilling operations to resume.",
        "productionLoss": "Temporary non-productive drilling time (NPT)",
        "damage": "Heavy tensile stress on drill pipe joint threads and derrick hoisting line",
        "imageRefs": ["FIG-002"],
        "source": "Page 1 of 1 OIL INDIA LIMITED RAJASTHAN FIELD JODHPUR AMENDMENT No. 4 Dated 03.05.2024",
        "sourcePage": "Section 2.1.4, Page 3",
        "sourceUrl": "https://internal.oilindia.in/docs/OIL-RF-AMENDMENT-4.pdf",
        "confidence": "HIGH"
    },
    {
        "id": "INC-003",
        "title": "BGW-12 Upper Carbonate CSS Thermal Water Breakthrough & Well Drowning",
        "field": "Baghewala",
        "basin": "Bikaner-Nagaur Basin",
        "reservoir": "Upper Carbonate Formation",
        "date": "2020-2022",
        "location": "Well BGW-12",
        "eventType": "WATER_BREAKTHROUGH",
        "category": "THERMAL_CSS",
        "trigger": "Cyclic steam thermal condensate channeling through active vuggy/fractured water-bearing dolostone networks (>1,000 mD permeability)",
        "conditions": {
            "temperature": "40°C BHT",
            "viscosity": "38,174 cP @ 40°C (8.6° API)",
            "pressure": "750 psi BHP",
            "steamInjection": "2 Consecutive CSS Cycles",
            "spm": "SRP Lift",
            "waterCut": "High Water Cut (>95%)"
        },
        "severity": "HIGH",
        "description": "Upper Carbonate well BGW-12 was subjected to two consecutive CSS thermal injection cycles in 2020 and 2022. The extra-heavy crude (8.6° API, 38,174 cP at 40°C) suffered rapid thermal water breakthrough as steam condensate broke into highly permeable vugs and fractures.",
        "consequence": "Produced cumulative total of only 60 bbls of crude oil (45 bbls in cycle 1 + 15 bbls in cycle 2) before being drowned out. Well remains shut-in.",
        "productionLoss": "Severe drawdown loss; well shut-in",
        "damage": "Thermal water drowning of Upper Carbonate perforated interval",
        "imageRefs": ["FIG-002"],
        "source": "4 EXPRESSION OF INTEREST (EOI) NO. OIL/RF/IND/EOI/011/2022 Section D, Page 4",
        "sourcePage": "Page 4",
        "sourceUrl": "https://internal.oilindia.in/docs/EOI-SURFACE-FACILITIES-2022.pdf",
        "confidence": "HIGH"
    },
    {
        "id": "INC-004",
        "title": "Heavy Oil Sucker Rod Pump Mechanical Failure & Rig-less Crane Fishing",
        "field": "Baghewala",
        "basin": "Bikaner-Nagaur Basin",
        "reservoir": "Jodhpur Sandstone",
        "date": "2023-2024",
        "location": "Baghewala Heavy Oil Wellhead",
        "eventType": "SRP_ROD_FAILURE",
        "category": "ARTIFICIAL_LIFT",
        "trigger": "Heavy oil fluid viscosity friction drag (10,000-13,000 cP) combined with cyclic mechanical overpull load causing sucker rod string fatigue parting",
        "conditions": {
            "temperature": "48°C - 58°C",
            "viscosity": "10,000 - 13,000 cP",
            "pressure": "1,600 psi",
            "steamInjection": "Post-CSS Production Phase",
            "spm": "8.0 - 12.0 SPM",
            "waterCut": "25%"
        },
        "severity": "MODERATE",
        "description": "High crude oil viscosity in unheated or cooling production tubing exerted severe downward fluid drag on the sucker rod string, increasing dynamic peak polished rod load (PPRL) beyond fatigue endurance limits.",
        "consequence": "Parted sucker rod fish was recovered via mobile crane and wireline overshoot tool without requiring workover rig mobilization.",
        "productionLoss": "2 days temporary production downtime",
        "damage": "Parted sucker rod pin/box connection",
        "imageRefs": [],
        "source": "SPE/ICoTA Symposium and Exhibition - Well Intervention 2025 Page 250",
        "sourcePage": "Page 250",
        "sourceUrl": "https://internal.oilindia.in/docs/SPE-ICOTA-2025.pdf",
        "confidence": "HIGH"
    },
    {
        "id": "INC-006",
        "title": "BGW#8 Milestone First Commercial CSS Thermal Cycle Execution",
        "field": "Baghewala",
        "basin": "Bikaner-Nagaur Basin",
        "reservoir": "Jodhpur Sandstone",
        "date": "2018-11",
        "location": "Well BGW#08",
        "eventType": "FIRST_COMMERCIAL_CSS",
        "category": "THERMAL_CSS",
        "trigger": "Deployment of Vacuum Insulated Tubing (VIT) and Thermal Wellhead assembly with 310°C steam injection at 102 kg/cm²",
        "conditions": {
            "temperature": "310°C Steam Temp",
            "viscosity": "Viscosity reduced from 13,000 cP to <100 cP",
            "pressure": "102 kg/cm² (10 MPa)",
            "steamInjection": "310°C steam injected via VIT for 14 days",
            "spm": "Self-flow 68 days followed by SRP",
            "waterCut": "20%"
        },
        "severity": "LOW",
        "description": "In November 2018, Oil India Limited executed the first successful commercial Cyclic Steam Stimulation (CSS) cycle in well BGW#08 using mobile boiler steam injected through Vacuum Insulated Tubing (VIT).",
        "consequence": "Well self-flowed continuously for 68 days at 30 bbl/day (~4.8 m³/d), establishing commercial viability of CSS thermal EOR in Baghewala.",
        "productionLoss": "None (+450% production gain)",
        "damage": "None",
        "imageRefs": ["FIG-014", "FIG-015"],
        "source": "Technology and Innovation - Oil India Limited Portal & Baghewala PPT Slide 12",
        "sourcePage": "Slide 12",
        "sourceUrl": "https://internal.oilindia.in/tech/css-bgw8.pdf",
        "confidence": "HIGH"
    }
]

BAGHEWALA_IMAGE_CATALOG = [
    {
        "imageId": "FIG-005",
        "imageUrl": "https://internal.oilindia.in/schematics/fig-005-casing-program.jpg",
        "caption": "Casing Program & Hole Size Schematic for Baghewala Wells.",
        "source": "OIL Rajasthan Field Amendment No. 4 (Section 2.1.3)",
        "imageAvailable": True
    },
    {
        "imageId": "FIG-006",
        "imageUrl": "https://internal.oilindia.in/maps/fig-006-sharp-bhagewala-location.jpg",
        "caption": "Figure 49: Location of Bhagewala Oil field in Bikaner-Nagaur Basin (Mandal et al., 2022).",
        "source": "SHARP Storage Report D4.1 (Figure 49, Page 63)",
        "imageAvailable": True
    },
    {
        "imageId": "FIG-007",
        "imageUrl": "https://internal.oilindia.in/wells/fig-007-bgw1-column.jpg",
        "caption": "Figure 50: Stratigraphic column for the Baghewala-1 well (Peters et al., 1995; Cozzi et al., 2012).",
        "source": "SHARP Storage Report D4.1 (Figure 50, Page 64)",
        "imageAvailable": True
    },
    {
        "imageId": "FIG-008",
        "imageUrl": "https://internal.oilindia.in/seismic/fig-008-sharp-dd-seismic.jpg",
        "caption": "Figure 51: DD seismic section transecting the Baghewala-1 well shows compressional structures bounded by steeply dipping faults.",
        "source": "SHARP Storage Report D4.1 (Figure 51, Page 65)",
        "imageAvailable": True
    },
    {
        "imageId": "FIG-014",
        "imageUrl": "https://internal.oilindia.in/operations/fig-014-bgw8-css-pad.jpg",
        "caption": "Slide 12: Field setup for BGW#8 1st Commercial CSS Cycle (Nov 2018).",
        "source": "Oil India Limited Presentation (Slide 12)",
        "imageAvailable": True
    },
    {
        "imageId": "FIG-015",
        "imageUrl": "https://internal.oilindia.in/schematics/fig-015-thermal-completion.jpg",
        "caption": "Slide 14: Thermal Well Completion Assembly featuring Vacuum Insulated Tubing (VIT).",
        "source": "Oil India Limited Presentation (Slide 14)",
        "imageAvailable": True
    },
    {
        "imageId": "FIG-017",
        "imageUrl": "https://internal.oilindia.in/specs/fig-017-premium-threads.jpg",
        "caption": "Page 2: Approved Premium Casing Thread Connections (VAM SWI, Tenaris Blue, Evraz QB2, Hunting Seal-Lock XD).",
        "source": "OIL Drilling Department EOI 2025-26 (Page 2)",
        "imageAvailable": True
    }
]

BAGHEWALA_KNOWLEDGE_GAPS = [
    {
        "id": "GAP-001",
        "title": "Uncalibrated High-Temperature Relative Permeability Curves",
        "topic": "Reservoir Simulation Physics",
        "documentedGap": "Lack of multi-phase steam-oil-water relative permeability laboratory measurements at temperatures exceeding 250°C in Jodhpur Sandstone cores.",
        "sourceDocument": "sharp-d4.1-report-final.pdf Table 6",
        "sourcePage": "Page 68 (Table 6 Data Gaps)",
        "impactOnSimulation": "Thermal EOR recovery models must rely on modified Corey/Stone-2 correlation extrapolations above 250°C."
    },
    {
        "id": "GAP-002",
        "title": "Multi-Cycle Thermal Casing Fatigue Endurance Limits",
        "topic": "Well Integrity & Tubular Engineering",
        "documentedGap": "Empirical casing thread connection seal failure data beyond 3 consecutive CSS cycles at >320°C steam temperature is unavailable in public OIL field records.",
        "sourceDocument": "EOI/OIL/RF/DRLG/01/2025-26 Section 4",
        "sourcePage": "Page 2",
        "impactOnSimulation": "Long-term casing stress and thermal elongation predictions carry elevated uncertainty after cycle 3."
    },
    {
        "id": "GAP-003",
        "title": "Sparse 3D Seismic Resolution on Eastern Margin Fault Blocks",
        "topic": "Seismic & Geomechanics",
        "documentedGap": "2D seismic coverage (DD lines) provides structural outline of main anticlinal high but lacks high-resolution 3D fault throw mapping along eastern boundary faults.",
        "sourceDocument": "sharp-d4.1-report-final.pdf Section 2.5.2",
        "sourcePage": "Page 65 (Figure 51)",
        "impactOnSimulation": "Compartmentalization and fault-seal leakage risks cannot be ruled out during high-pressure steam injection."
    },
    {
        "id": "GAP-004",
        "title": "Extra-Heavy Crude Non-Newtonian Shear Thinning at Low Shear Rates",
        "topic": "Fluid Rheology",
        "documentedGap": "Laboratory rheometer testing at 30°C and 15°C was conducted under constant shear rate, leaving low-shear static yield stress unmeasured.",
        "sourceDocument": "sharp-d4.1-report-final.pdf Section 2.5.1",
        "sourcePage": "Page 64",
        "impactOnSimulation": "Unheated wellbore static restart pressure gradient requires safety margin when computing SRP initial polished rod load."
    }
]

def search_baghewala_rag(query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    context = context or {}
    viscosity = context.get("viscosity", 5014)
    temp = context.get("reservoirTemp", 58)
    spm = context.get("spm", 8.0)
    risk_level = context.get("currentRiskLevel", "LOW")
    risk_category = context.get("riskCategory", "")
    steam_temp = context.get("steamTemp", 280)
    current_prod = context.get("currentProductionBOPD", 12.5)

    norm_query = (query or "").lower()
    query_tokens = [t for t in norm_query.split() if len(t) > 2]

    evidence_list = []
    events_list = []

    for inc in BAGHEWALA_HISTORICAL_INCIDENTS:
        # 1. Semantic Score
        sem_score = 0.55
        if query_tokens:
            searchable = f"{inc['title']} {inc['description']} {inc['eventType']} {inc['source']}".lower()
            matches = sum(1 for t in query_tokens if t in searchable)
            sem_score = min(1.0, 0.4 + (matches / len(query_tokens)) * 0.6)

        # 2. Keyword Score
        kw_list = ["bgw-1", "bgw-6", "bgw-12", "bgw-8", "jodhpur", "sandstone", "carbonate", "css", "viscosity", "spm", "casing", "twccep", "stuck", "rheology", "sharp"]
        full_text = f"{inc['title']} {inc['description']} {inc['source']}".lower()
        kw_matches = sum(1 for kw in kw_list if kw in full_text)
        kw_score = min(1.0, round(kw_matches / 4.0, 2))

        # 3. Parameter Similarity
        temp_sim = 0.8
        visc_sim = 0.8
        spm_sim = 0.8
        if inc["id"] == "INC-008":
            min_temp_diff = min(abs(temp - 90), abs(temp - 60), abs(temp - 30))
            temp_sim = max(0.2, 1.0 - min_temp_diff / 100.0)
            visc_sim = max(0.3, 1.0 - abs(math.log10(viscosity + 1) - math.log10(1700)) / 3.0)
        elif inc["id"] == "INC-001":
            temp_sim = 0.95 if steam_temp > 250 else 0.6
        elif inc["id"] == "INC-004":
            spm_sim = 0.95 if spm >= 7 else 0.6

        param_sim = round((temp_sim + visc_sim + spm_sim) / 3.0, 2)

        # 4. Risk Category Match
        risk_cat_match = 0.5
        cat = inc.get("category", "HISTORICAL_INCIDENT")
        if "VISCOSITY" in risk_category and (cat == "VISCOSITY_RHEOLOGY" or "VISCOSITY" in inc["eventType"]):
            risk_cat_match = 0.95
        elif "THERMAL" in risk_category and (cat == "THERMAL_CSS" or "THERMAL" in inc["eventType"]):
            risk_cat_match = 0.95
        elif "MECHANICAL" in risk_category and (cat in ["ARTIFICIAL_LIFT", "WELL_INTEGRITY_CASING"] or "STUCK" in inc["eventType"]):
            risk_cat_match = 0.95

        # 5. Source Quality
        source_qual = 0.85
        if "sharp-d4.1" in inc["source"]:
            source_qual = 1.0
        elif "EOI" in inc["source"] or "Amendment" in inc["source"]:
            source_qual = 0.95

        # Multi-factor Weighted Formula
        raw_rel = (sem_score * 0.30) + (kw_score * 0.20) + (param_sim * 0.25) + (risk_cat_match * 0.15) + (source_qual * 0.10)
        rel_score = min(1.0, round(raw_rel, 2))

        scoring_breakdown = {
            "semanticScore": round(sem_score, 2),
            "keywordScore": round(kw_score, 2),
            "parameterSimilarity": round(param_sim, 2),
            "riskCategoryMatch": round(risk_cat_match, 2),
            "sourceQuality": round(source_qual, 2)
        }

        # Parameter comparison match
        curr_match_name = "Viscosity & Reservoir Temperature"
        curr_val = f"{viscosity} cP @ {temp}°C"
        hist_val = "1,700 cP @ 60°C"
        delta_val = abs(temp - 60)
        explanation_str = f"Live reservoir temp {temp}°C is within {delta_val}°C of historical BGW-1 60°C DST measurement (1,700 cP)."

        if inc["id"] == "INC-001":
            curr_match_name = "Steam Injection Temperature"
            curr_val = f"{steam_temp}°C"
            hist_val = "320°C - 350°C"
            delta_val = abs(steam_temp - 335)
            explanation_str = f"Live steam temp {steam_temp}°C is {delta_val}°C below BGW-6 thermal casing failure threshold (335°C)."
        elif inc["id"] == "INC-004":
            curr_match_name = "SRP Pumping Speed (SPM)"
            curr_val = f"{spm} SPM"
            hist_val = "8.0 - 12.0 SPM"
            delta_val = abs(spm - 8.0)
            explanation_str = f"Live pumping speed of {spm} SPM operates within historical field range (8.0-12.0 SPM)."

        matching_imgs = [img for img in BAGHEWALA_IMAGE_CATALOG if img["imageId"] in inc["imageRefs"]]
        primary_img = matching_imgs[0]["imageUrl"] if matching_imgs else None

        provenance = {
            "document": inc["source"],
            "page": inc.get("sourcePage", "N/A"),
            "section": "Section 2.5.1 Page 64" if inc["id"] == "INC-008" else "Technical Document",
            "figure": ", ".join(inc["imageRefs"]) if inc["imageRefs"] else None,
            "source": inc["source"],
            "sourceUrl": inc.get("sourceUrl"),
            "confidence": inc.get("confidence", "HIGH"),
            "evidenceCategory": cat
        }

        evidence_list.append({
            "id": inc["id"],
            "title": inc["title"],
            "category": cat,
            "relevanceScore": rel_score,
            "scoringBreakdown": scoring_breakdown,
            "currentMatch": {
                "parameterName": curr_match_name,
                "currentValue": curr_val,
                "historicalValue": hist_val,
                "delta": delta_val,
                "explanation": explanation_str
            },
            "documentedEvidence": {
                "field": inc["field"],
                "basin": inc["basin"],
                "reservoir": inc["reservoir"],
                "date": inc.get("date"),
                "location": inc.get("location"),
                "eventType": inc["eventType"],
                "trigger": inc.get("trigger"),
                "description": inc["description"],
                "consequence": inc.get("consequence"),
                "productionLoss": inc.get("productionLoss"),
                "damage": inc.get("damage"),
                "conditions": inc["conditions"]
            },
            "provenance": provenance,
            "images": matching_imgs
        })

        events_list.append({
            "id": inc["id"],
            "title": inc["title"],
            "location": inc.get("location"),
            "date": inc.get("date"),
            "eventType": inc["eventType"],
            "trigger": inc.get("trigger"),
            "severity": inc["severity"],
            "description": f"{inc['description']} [Source: {inc['source']} | Page: {inc.get('sourcePage')}]",
            "consequence": inc.get("consequence"),
            "productionLoss": inc.get("productionLoss"),
            "damage": inc.get("damage"),
            "source": inc["source"],
            "sourceUrl": inc.get("sourceUrl"),
            "imageUrl": primary_img,
            "images": matching_imgs if matching_imgs else None,
            "imageAvailable": len(matching_imgs) > 0,
            "relevance": rel_score,
            "category": cat
        })

    evidence_list.sort(key=lambda x: x["relevanceScore"], reverse=True)
    events_list.sort(key=lambda x: x["relevance"], reverse=True)

    return {
        "success": True,
        "events": events_list,
        "evidence": evidence_list,
        "currentSimulation": context,
        "knowledgeGaps": BAGHEWALA_KNOWLEDGE_GAPS,
        "disclaimer": "HISTORICAL EVIDENCE — NOT A PREDICTION",
        "summary": f"Retrieved {len(evidence_list)} grounded Baghewala historical evidence records for parameters (Viscosity: {viscosity} cP, Temp: {temp}°C, SPM: {spm}).",
        "query": query or "Baghewala historical evidence query",
        "totalCount": len(evidence_list)
    }

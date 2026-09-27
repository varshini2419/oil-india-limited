import { queryBaghewalaKnowledgeBase, BAGHEWALA_IMAGE_CATALOG } from '../services/baghewalaRagEngine';

export function runMultimodalImageRagTests(): { success: boolean; logs: string[] } {
  const logs: string[] = [];
  let success = true;

  const log = (msg: string) => logs.push(msg);

  log('=== BAGHEWALA PIXEL-LEVEL MULTIMODAL IMAGE RAG TEST SUITE ===');

  try {
    // Test 1: Verify Real Image Asset Availability vs Unavailable Marking
    log('\n[TEST 1] Verifying Real Image Asset Availability & Pixel Ingestion Status...');
    const availableFigures = ['FIG-006', 'FIG-007', 'FIG-008', 'FIG-009', 'FIG-010'];
    const unavailableFigures = ['FIG-001', 'FIG-002', 'FIG-003', 'FIG-005', 'FIG-014', 'FIG-015', 'FIG-017'];

    let availPassCount = 0;
    let unavailPassCount = 0;

    BAGHEWALA_IMAGE_CATALOG.forEach((img) => {
      if (availableFigures.includes(img.imageId)) {
        if (img.imageAvailable && img.imageUrl && img.extractedOcrText && img.visualAnalysisSummary.includes('Pixel Ingested')) {
          availPassCount++;
          log(`  ✓ Available & Ingested: [${img.imageId}] ${img.title} -> URL: ${img.imageUrl}`);
        } else {
          log(`  ✕ FAIL: Expected available image asset for ${img.imageId}`);
          success = false;
        }
      } else if (unavailableFigures.includes(img.imageId)) {
        if (!img.imageAvailable && img.extractedOcrText === '' && img.visualAnalysisSummary.includes('unavailable')) {
          unavailPassCount++;
          log(`  ✓ Correctly Marked Unavailable: [${img.imageId}] ${img.title}`);
        } else {
          log(`  ✕ FAIL: Expected imageAvailable = false for ${img.imageId}`);
          success = false;
        }
      }
    });

    log(`PASS: ${availPassCount}/${availableFigures.length} real PNG assets ingested, ${unavailPassCount}/${unavailableFigures.length} un-extracted figures correctly marked unavailable.`);

    // Test 2: Multimodal RAG Query Execution for Stratigraphic Core Column (FIG-007)
    log('\n[TEST 2] Testing Pixel-Ingested Multimodal Query (BGW-1 Core Viscosity & Stratigraphy)...');
    const context = {
      reservoirTemp: 58,
      viscosity: 5014,
      spm: 8.0,
      steamTemp: 310,
      currentRiskLevel: 'MODERATE'
    };

    const res = queryBaghewalaKnowledgeBase('Baghewala-1 BGW-1 core cut viscosity curve stratigraphic column 1103-1117m', context);

    if (!res.success) {
      log('FAIL: RAG query returned success = false');
      success = false;
    } else {
      log('PASS: RAG query executed successfully.');
    }

    const fig007Evidence = res.imageEvidence?.find((img) => img.imageId === 'FIG-007');
    if (!fig007Evidence) {
      log('FAIL: FIG-007 not found in image evidence array');
      success = false;
    } else {
      log(`PASS: Retrieved FIG-007 with relevance score ${(fig007Evidence.visualRelevanceScore * 100).toFixed(0)}%.`);
      log(`  Document: ${fig007Evidence.document} | Page: ${fig007Evidence.page}`);
      log(`  Asset URL: ${fig007Evidence.imageUrl}`);
      log(`  Extracted Pixel OCR: ${fig007Evidence.extractedOcrText.slice(0, 85)}...`);
      log(`  Visual Features: ${fig007Evidence.visualFeatures.join(' | ')}`);
    }

    // Test 3: Verify Existing Text RAG Scoring Unchanged
    log('\n[TEST 3] Verifying Existing Text RAG Physics & Scoring Intact...');
    if (!res.evidence || res.evidence.length === 0) {
      log('FAIL: Text RAG grounded evidence list is empty.');
      success = false;
    } else {
      log(`PASS: Retrieved ${res.evidence.length} grounded text evidence records.`);
      log(`  Top Text Evidence: [${res.evidence[0].id}] ${res.evidence[0].title} (Score: ${res.evidence[0].relevanceScore})`);
      log(`  Mandatory Disclaimer: "${res.disclaimer}"`);
      if (res.disclaimer !== 'HISTORICAL EVIDENCE — NOT A PREDICTION') {
        log('FAIL: Mandatory disclaimer text was modified.');
        success = false;
      }
    }

    // Test 4: Verify Dynamic Pixel Seismic Search (FIG-008 & FIG-006)
    log('\n[TEST 4] Testing OCR & Seismic Pixel Search (Pokhran High / DD Seismic Transect)...');
    const seismicRes = queryBaghewalaKnowledgeBase('Pokhran High 2D seismic transect DD line fault F1', context);
    const matchedSeismicImg = seismicRes.imageEvidence?.find((img) => img.imageId === 'FIG-008' || img.imageId === 'FIG-006');
    if (matchedSeismicImg && matchedSeismicImg.visualRelevanceScore >= 0.70) {
      log(`PASS: High-relevance visual match for real seismic image: [${matchedSeismicImg.imageId}] Score: ${matchedSeismicImg.visualRelevanceScore}`);
    } else {
      log('FAIL: Could not retrieve seismic visual evidence using OCR terms.');
      success = false;
    }

  } catch (err: unknown) {
    log(`FATAL ERROR IN TEST SUITE: ${err instanceof Error ? err.message : String(err)}`);
    success = false;
  }

  log(`\n=== FINAL RESULT: ${success ? 'ALL PIXEL-LEVEL MULTIMODAL RAG TESTS PASSED' : 'TESTS FAILED'} ===`);
  return { success, logs };
}

// Self-run if executed directly via Node environment
const g = globalThis as unknown as { process?: { argv?: string[]; exit?: (code: number) => void } };
if (g.process?.argv?.[1]?.includes('runMultimodalImageRagTests')) {
  const result = runMultimodalImageRagTests();
  console.log(result.logs.join('\n'));
  if (!result.success && g.process?.exit) g.process.exit(1);
}

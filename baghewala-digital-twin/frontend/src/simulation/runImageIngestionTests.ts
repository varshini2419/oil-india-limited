import {
  verifyImageAccessibility,
  extractImagesFromRecord,
  ingestJsonPayloads,
  mapRecordToHistoricalEvent
} from '../services/imageIngestionService';

async function runImageIngestionTests() {
  console.log('====================================================');
  console.log('BAGHEWALA DIGITAL TWIN — IMAGE INGESTION & PARSER TEST SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${desc}`);
      failed++;
    }
  }

  const g = globalThis as Record<string, any>;

  // Dynamically load node fs and path modules if in node environment
  let fsModule: any = null;
  let pathModule: any = null;
  if (g.process) {
    try {
      const req = (eval)('require');
      fsModule = req('fs');
      pathModule = req('path');
    } catch {
      // Browser environment fallback
    }
  }

  // TEST 0: Utility function test
  assert(verifyImageAccessibility('https://example.com/test.jpg') === true, 'Test 0: verifyImageAccessibility returns true for valid URL');
  assert(verifyImageAccessibility('') === false, 'Test 0: verifyImageAccessibility returns false for empty string');

  // TEST 1: Format 1 — imageUrl string
  const rec1 = { id: 'INC-01', title: 'Viscosity Spike', imageUrl: 'https://example.com/photos/viscosity.jpg', source: 'OIL Log' };
  const extracted1 = extractImagesFromRecord(rec1);
  assert(extracted1.length === 1, 'Test 1: Format 1 (imageUrl string) extracted 1 record');
  assert(extracted1[0].formatDetected === 'URL', 'Test 1: Format 1 detected as URL');
  assert(extracted1[0].imageAvailable === true, 'Test 1: Format 1 image verified accessible');

  // TEST 2: Format 2 — image path string
  const rec2 = { id: 'INC-02', title: 'Rod Parting', image: 'images/incident-02.jpg', caption: 'Parted Rod' };
  const extracted2 = extractImagesFromRecord(rec2);
  assert(extracted2.length === 1, 'Test 2: Format 2 (image relative path) extracted 1 record');
  assert(extracted2[0].formatDetected === 'PATH', 'Test 2: Format 2 detected as PATH');
  assert(extracted2[0].imageAvailable === true, 'Test 2: Format 2 relative path verified accessible');

  // TEST 3: Format 3 — images string array
  const rec3 = { id: 'INC-03', title: 'Steam Breakthrough', images: ['images/steam1.png', 'https://example.com/steam2.jpg'] };
  const extracted3 = extractImagesFromRecord(rec3);
  assert(extracted3.length === 2, 'Test 3: Format 3 (images string array) extracted 2 records');
  assert(extracted3[0].formatDetected === 'ARRAY_STRINGS', 'Test 3: String array element detected as ARRAY_STRINGS');

  // TEST 4: Format 4 — Base64 data URI
  const rec4 = { id: 'INC-04', title: 'Wellhead Leak', image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD...' };
  const extracted4 = extractImagesFromRecord(rec4);
  assert(extracted4.length === 1, 'Test 4: Format 4 (Base64 data URI) extracted 1 record');
  assert(extracted4[0].formatDetected === 'BASE64', 'Test 4: Detected as BASE64');
  assert(extracted4[0].imageAvailable === true, 'Test 4: Base64 data URI verified accessible');

  // TEST 5: Format 5 — Object metadata
  const rec5 = { id: 'INC-05', title: 'Boiler Flare', image: { url: 'https://example.com/boiler.jpg', caption: 'Mobile OTSG Boiler', source: 'OIL Tech Report' } };
  const extracted5 = extractImagesFromRecord(rec5);
  assert(extracted5.length === 1, 'Test 5: Format 5 (Metadata object) extracted 1 record');
  assert(extracted5[0].caption === 'Mobile OTSG Boiler', 'Test 5: Caption extracted from object metadata');

  // TEST 6: Format 6 — Array of metadata objects
  const rec6 = {
    id: 'INC-06',
    title: 'Multi-photo Event',
    images: [
      { url: 'https://example.com/a.jpg', caption: 'Photo A' },
      { path: 'images/b.jpg', caption: 'Photo B' }
    ]
  };
  const extracted6 = extractImagesFromRecord(rec6);
  assert(extracted6.length === 2, 'Test 6: Format 6 (Array of metadata objects) extracted 2 records');
  assert(extracted6[0].caption === 'Photo A', 'Test 6: First object caption preserved');

  // TEST 7: Inaccessible / Missing Image handling (No Fake Image Generation)
  const rec7 = { id: 'INC-07', title: 'Unphotographed Event', image: 'invalid-url-without-extension' };
  const extracted7 = extractImagesFromRecord(rec7);
  assert(extracted7.length === 1, 'Test 7: Inaccessible image record preserved');
  assert(extracted7[0].imageAvailable === false, 'Test 7: Inaccessible image correctly flagged imageAvailable=false');

  // TEST 8: Full Image Ingestion Report Generation
  const testPayloads = [
    {
      filename: 'historical_incidents_2024.json',
      records: [rec1, rec2, rec3, rec4]
    },
    {
      filename: 'field_surveys_2025.json',
      records: [rec5, rec6, rec7, { id: 'INC-08', title: 'No Image Record' }]
    }
  ];

  const report = ingestJsonPayloads(testPayloads);
  assert(report.totalJsonFiles === 2, 'Test 8: Report lists 2 total JSON files');
  assert(report.totalJsonRecords === 8, 'Test 8: Report lists 8 total JSON records');
  assert(report.totalImageReferences === 9, 'Test 8: Report lists 9 total image references');
  assert(report.accessibleImages === 8, 'Test 8: Report lists 8 accessible images');
  assert(report.inaccessibleImages === 1, 'Test 8: Report lists 1 inaccessible image');
  assert(report.missingImageReferences === 1, 'Test 8: Report lists 1 record missing image reference');

  // TEST 9: Frontend Event Schema Mapping
  const mappedEvent = mapRecordToHistoricalEvent(rec6, 'field_surveys_2025.json');
  assert(mappedEvent.id === 'INC-06', 'Test 9: Mapped event preserves incident ID');
  assert(mappedEvent.imageUrl === 'https://example.com/a.jpg', 'Test 9: Mapped event exposes primary imageUrl');
  assert(Array.isArray(mappedEvent.images) && mappedEvent.images.length === 2, 'Test 9: Mapped event exposes images array for multi-photo display');
  assert(mappedEvent.imageAvailable === true, 'Test 9: Mapped event sets imageAvailable=true');

  const mappedNoImage = mapRecordToHistoricalEvent(rec7, 'field_surveys_2025.json');
  assert(mappedNoImage.imageAvailable === false, 'Test 9: Mapped event without valid images sets imageAvailable=false');

  // TEST 10: Verification that Digital Twin files remain 100% untouched
  if (fsModule && pathModule) {
    const rootDir = g.process?.cwd ? g.process.cwd() : '.';
    const dtPagePath = pathModule.join(rootDir, 'src/pages/DigitalTwinPage.tsx');
    const dtCanvasPath = pathModule.join(rootDir, 'src/components/digital-twin/DigitalTwinCanvas.tsx');
    const dtAnimPath = pathModule.join(rootDir, 'src/components/digital-twin/animations/AnimationController.tsx');

    assert(fsModule.existsSync(dtPagePath), 'Test 10: DigitalTwinPage.tsx exists');
    assert(fsModule.existsSync(dtCanvasPath), 'Test 10: DigitalTwinCanvas.tsx exists');
    assert(fsModule.existsSync(dtAnimPath), 'Test 10: AnimationController.tsx exists');

    const dtPageContent = fsModule.readFileSync(dtPagePath, 'utf-8');
    assert(!dtPageContent.includes('imageIngestionService'), 'Test 10: DigitalTwinPage.tsx is completely free of image ingestion edits');
  }

  console.log('====================================================');
  console.log(`IMAGE INGESTION TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    if (g.process) g.process.exit(1);
  }
}

runImageIngestionTests().catch(err => {
  console.error('Fatal error running image ingestion tests:', err);
  const g = globalThis as Record<string, any>;
  if (g.process) g.process.exit(1);
});

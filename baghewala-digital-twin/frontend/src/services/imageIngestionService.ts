import type { BaghewalaHistoricalEvent, BaghewalaIncidentImage } from './baghewalaRagService';

/**
 * Standardized Image Record extracted from raw JSON sources
 */
export interface BaghewalaImageRecord {
  imageId: string;
  recordId: string;
  sourceFile?: string;
  imageUrl?: string;
  imagePath?: string;
  caption?: string;
  source?: string;
  date?: string;
  location?: string;
  eventType?: string;
  imageAvailable: boolean;
  formatDetected: 'URL' | 'PATH' | 'ARRAY_STRINGS' | 'BASE64' | 'METADATA_OBJ' | 'ARRAY_OBJS' | 'UNKNOWN';
}

/**
 * Audit and ingestion summary report structure
 */
export interface ImageIngestionReport {
  totalJsonFiles: number;
  totalJsonRecords: number;
  totalImageReferences: number;
  accessibleImages: number;
  inaccessibleImages: number;
  duplicateImages: number;
  linkedToIncidents: number;
  imagesWithoutIncident: number;
  missingImageReferences: number;
  imageRecords: BaghewalaImageRecord[];
}

/**
 * Checks whether an image reference is accessible (valid URL, Base64 data URI, or non-empty path).
 * Does NOT generate fake URLs or synthetic images.
 */
export function verifyImageAccessibility(val: string | undefined): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.length === 0) return false;

  // Base64 Data URI
  if (trimmed.startsWith('data:image/')) return true;

  // HTTP/HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  // Relative image file path (e.g., images/incident-01.jpg)
  if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Extracts all image records from a single raw JSON object representing an incident or record.
 * Supports all 6 image representation formats.
 */
export function extractImagesFromRecord(
  rawRecord: Record<string, any>,
  sourceFile: string = 'unknown_source.json',
  recordIndex: number = 0
): BaghewalaImageRecord[] {
  const extracted: BaghewalaImageRecord[] = [];
  const recordId = String(rawRecord.id || rawRecord.recordId || rawRecord.incidentId || `REC-${recordIndex + 1}`);
  const date = rawRecord.date;
  const location = rawRecord.location;
  const eventType = rawRecord.eventType || rawRecord.type;
  const defaultSource = rawRecord.source;

  let imgCounter = 0;

  const pushRecord = (
    urlOrPath: string | undefined,
    caption: string | undefined,
    source: string | undefined,
    format: BaghewalaImageRecord['formatDetected']
  ) => {
    imgCounter++;
    const isAccessible = verifyImageAccessibility(urlOrPath);
    const isUrl = urlOrPath?.startsWith('http://') || urlOrPath?.startsWith('https://') || urlOrPath?.startsWith('data:image/');

    extracted.push({
      imageId: `${recordId}-IMG-${imgCounter}`,
      recordId,
      sourceFile,
      imageUrl: isUrl ? urlOrPath : undefined,
      imagePath: !isUrl ? urlOrPath : undefined,
      caption: caption || rawRecord.title || rawRecord.caption,
      source: source || defaultSource,
      date,
      location,
      eventType,
      imageAvailable: isAccessible,
      formatDetected: format
    });
  };

  // Format 1 & 2: Single string property (`imageUrl`, `image`, `imagePath`, `photo`)
  if (typeof rawRecord.imageUrl === 'string') {
    const isUrl = rawRecord.imageUrl.startsWith('http') || rawRecord.imageUrl.startsWith('data:');
    pushRecord(rawRecord.imageUrl, rawRecord.caption, rawRecord.source, isUrl ? 'URL' : 'PATH');
  } else if (typeof rawRecord.image === 'string') {
    if (rawRecord.image.startsWith('data:image/')) {
      pushRecord(rawRecord.image, rawRecord.caption, rawRecord.source, 'BASE64');
    } else {
      const isUrl = rawRecord.image.startsWith('http');
      pushRecord(rawRecord.image, rawRecord.caption, rawRecord.source, isUrl ? 'URL' : 'PATH');
    }
  } else if (typeof rawRecord.imagePath === 'string') {
    pushRecord(rawRecord.imagePath, rawRecord.caption, rawRecord.source, 'PATH');
  }

  // Format 5: Object metadata (`image: { url: "...", caption: "...", source: "..." }`)
  if (rawRecord.image && typeof rawRecord.image === 'object' && !Array.isArray(rawRecord.image)) {
    const obj = rawRecord.image;
    const pathOrUrl = obj.url || obj.imageUrl || obj.path || obj.imagePath || obj.src;
    pushRecord(pathOrUrl, obj.caption, obj.source, 'METADATA_OBJ');
  }

  // Format 3 & 6: Array of images (`images: [...]` or `photos: [...]`)
  const arr = Array.isArray(rawRecord.images) ? rawRecord.images : (Array.isArray(rawRecord.photos) ? rawRecord.photos : null);
  if (arr) {
    for (const item of arr) {
      if (typeof item === 'string') {
        const isUrl = item.startsWith('http') || item.startsWith('data:');
        pushRecord(item, rawRecord.caption, rawRecord.source, isUrl ? 'URL' : 'ARRAY_STRINGS');
      } else if (item && typeof item === 'object') {
        const pathOrUrl = item.url || item.imageUrl || item.path || item.imagePath || item.src;
        pushRecord(pathOrUrl, item.caption, item.source, 'ARRAY_OBJS');
      }
    }
  }

  return extracted;
}

/**
 * Ingests a set of JSON files/records, audits image references across all formats,
 * verifies accessibility, and generates an Image Ingestion Report.
 */
export function ingestJsonPayloads(
  files: Array<{ filename: string; records: Record<string, any>[] }>
): ImageIngestionReport {
  const allImageRecords: BaghewalaImageRecord[] = [];
  const seenImageKeys = new Set<string>();

  let totalJsonFiles = files.length;
  let totalJsonRecords = 0;
  let totalImageReferences = 0;
  let accessibleImages = 0;
  let inaccessibleImages = 0;
  let duplicateImages = 0;
  let linkedToIncidents = 0;
  let imagesWithoutIncident = 0;
  let missingImageReferences = 0;

  for (const file of files) {
    const records = file.records || [];
    totalJsonRecords += records.length;

    records.forEach((rec, idx) => {
      const extracted = extractImagesFromRecord(rec, file.filename, idx);

      if (extracted.length === 0) {
        missingImageReferences++;
      } else {
        extracted.forEach((imgRec) => {
          totalImageReferences++;

          // Deduplication key based on image URL/path and record ID
          const dupKey = `${imgRec.recordId}::${imgRec.imageUrl || imgRec.imagePath}`;
          if (seenImageKeys.has(dupKey)) {
            duplicateImages++;
          } else {
            seenImageKeys.add(dupKey);
          }

          if (imgRec.imageAvailable) {
            accessibleImages++;
          } else {
            inaccessibleImages++;
          }

          if (imgRec.recordId && imgRec.recordId !== 'unknown') {
            linkedToIncidents++;
          } else {
            imagesWithoutIncident++;
          }

          allImageRecords.push(imgRec);
        });
      }
    });
  }

  return {
    totalJsonFiles,
    totalJsonRecords,
    totalImageReferences,
    accessibleImages,
    inaccessibleImages,
    duplicateImages,
    linkedToIncidents,
    imagesWithoutIncident,
    missingImageReferences,
    imageRecords: allImageRecords
  };
}

/**
 * Maps any raw JSON incident record into the frontend `BaghewalaHistoricalEvent` contract,
 * properly supporting both single `imageUrl` and multiple `images` array with `imageAvailable` status.
 */
export function mapRecordToHistoricalEvent(raw: Record<string, any>, sourceFile?: string): BaghewalaHistoricalEvent {
  const extractedImages = extractImagesFromRecord(raw, sourceFile || 'knowledge_base.json');
  const accessibleImages = extractedImages.filter((img) => img.imageAvailable);

  const imagesPayload: BaghewalaIncidentImage[] = extractedImages.map((img) => ({
    imageUrl: img.imageUrl,
    imagePath: img.imagePath,
    caption: img.caption,
    source: img.source,
    imageAvailable: img.imageAvailable
  }));

  // Primary single image URL for legacy frontend compatibility
  const primaryImageUrl = accessibleImages.length > 0 ? (accessibleImages[0].imageUrl || accessibleImages[0].imagePath) : undefined;
  const isAvailable = accessibleImages.length > 0;

  return {
    id: String(raw.id || raw.recordId || `INC-${Math.random().toString(36).substring(2, 7)}`),
    title: String(raw.title || raw.name || 'Baghewala Historical Incident'),
    location: raw.location,
    date: raw.date,
    eventType: raw.eventType || raw.type,
    trigger: raw.trigger,
    severity: raw.severity,
    description: String(raw.description || raw.details || 'No detailed historical description provided.'),
    consequence: raw.consequence,
    productionLoss: raw.productionLoss,
    damage: raw.damage,
    source: raw.source,
    sourceUrl: raw.sourceUrl,
    imageUrl: primaryImageUrl,
    images: imagesPayload.length > 0 ? imagesPayload : undefined,
    imageAvailable: isAvailable,
    relevance: raw.relevance
  };
}

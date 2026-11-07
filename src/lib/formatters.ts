export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const formatFileSize = formatBytes;

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function getWordFormat(filename: string): 'DOCX' | 'DOC' | 'UNKNOWN' {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'docx') return 'DOCX';
  if (ext === 'doc') return 'DOC';
  return 'UNKNOWN';
}

export function getPdfFilename(originalFilename: string): string {
  const lastDot = originalFilename.lastIndexOf('.');
  const baseName = lastDot !== -1 ? originalFilename.substring(0, lastDot) : originalFilename;
  return sanitizePdfFilename(`${baseName}.pdf`);
}

/**
 * Sanitizes and normalizes user-provided PDF filenames:
 * - Strips illegal filesystem characters (\ / : * ? " < > | \0)
 * - Preserves Unicode/accents (e.g. á, é, í, ó, ú, ñ)
 * - Removes repeated or trailing .pdf extensions to avoid ".pdf.pdf"
 * - Always ensures a single ".pdf" extension at the end
 */
export function sanitizePdfFilename(inputName: string): string {
  let cleaned = (inputName || 'documento')
    .trim()
    .replace(/[/\\:*?"<>|\x00-\x1F]/g, '_'); // Replace invalid filesystem characters

  // Strip all trailing .pdf (case-insensitive)
  while (cleaned.toLowerCase().endsWith('.pdf')) {
    cleaned = cleaned.substring(0, cleaned.length - 4).trim();
  }

  // Fallback if empty
  if (!cleaned) {
    cleaned = 'documento';
  }

  return `${cleaned}.pdf`;
}

export function getDocxFilename(originalFilename: string): string {
  const lastDot = originalFilename.lastIndexOf('.');
  const baseName = lastDot !== -1 ? originalFilename.substring(0, lastDot) : originalFilename;
  return sanitizeDocxFilename(`${baseName}.docx`);
}

export function getPptxFilename(originalFilename: string): string {
  const lastDot = originalFilename.lastIndexOf('.');
  const baseName = lastDot !== -1 ? originalFilename.substring(0, lastDot) : originalFilename;
  return sanitizePptxFilename(`${baseName}.pptx`);
}

/**
 * Sanitizes and normalizes user-provided PPTX filenames:
 * - Strips illegal filesystem characters (\ / : * ? " < > | \0)
 * - Preserves Unicode/accents (e.g. á, é, í, ó, ú, ñ)
 * - Removes repeated or trailing .pptx / .ppt extensions to avoid double extensions
 * - Always ensures a single ".pptx" extension at the end
 */
export function sanitizePptxFilename(inputName: string): string {
  let cleaned = (inputName || 'presentacion')
    .trim()
    .replace(/[/\\:*?"<>|\x00-\x1F]/g, '_');

  while (cleaned.toLowerCase().endsWith('.pptx') || cleaned.toLowerCase().endsWith('.ppt')) {
    if (cleaned.toLowerCase().endsWith('.pptx')) {
      cleaned = cleaned.substring(0, cleaned.length - 5).trim();
    } else {
      cleaned = cleaned.substring(0, cleaned.length - 4).trim();
    }
  }

  if (!cleaned) {
    cleaned = 'presentacion';
  }

  return `${cleaned}.pptx`;
}

/**
 * Sanitizes and normalizes user-provided DOCX filenames:
 * - Strips illegal filesystem characters (\ / : * ? " < > | \0)
 * - Preserves Unicode/accents (e.g. á, é, í, ó, ú, ñ)
 * - Removes repeated or trailing .docx / .doc extensions to avoid double extensions
 * - Always ensures a single ".docx" extension at the end
 */
export function sanitizeDocxFilename(inputName: string): string {
  let cleaned = (inputName || 'documento')
    .trim()
    .replace(/[/\\:*?"<>|\x00-\x1F]/g, '_');

  while (cleaned.toLowerCase().endsWith('.docx') || cleaned.toLowerCase().endsWith('.doc')) {
    if (cleaned.toLowerCase().endsWith('.docx')) {
      cleaned = cleaned.substring(0, cleaned.length - 5).trim();
    } else {
      cleaned = cleaned.substring(0, cleaned.length - 4).trim();
    }
  }

  if (!cleaned) {
    cleaned = 'documento';
  }

  return `${cleaned}.docx`;
}

/**
 * Sanitizes and normalizes user-provided JPG filenames:
 * - Strips illegal filesystem characters (\ / : * ? " < > | \0)
 * - Always ensures a single ".jpg" extension
 */
export function sanitizeJpgFilename(inputName: string): string {
  let cleaned = (inputName || 'pagina')
    .trim()
    .replace(/[/\\:*?"<>|\x00-\x1F]/g, '_');

  while (cleaned.toLowerCase().endsWith('.jpg') || cleaned.toLowerCase().endsWith('.jpeg')) {
    if (cleaned.toLowerCase().endsWith('.jpeg')) {
      cleaned = cleaned.substring(0, cleaned.length - 5).trim();
    } else {
      cleaned = cleaned.substring(0, cleaned.length - 4).trim();
    }
  }

  if (!cleaned) {
    cleaned = 'pagina';
  }

  return `${cleaned}.jpg`;
}

/**
 * Sanitizes ZIP archive filename, ensuring a single .zip extension.
 */
export function sanitizeZipFilename(inputName: string): string {
  let cleaned = (inputName || 'imagenes-convertidas')
    .trim()
    .replace(/[/\\:*?"<>|\x00-\x1F]/g, '_');

  while (cleaned.toLowerCase().endsWith('.zip')) {
    cleaned = cleaned.substring(0, cleaned.length - 4).trim();
  }

  if (!cleaned) {
    cleaned = 'imagenes-convertidas';
  }

  return `${cleaned}.zip`;
}

/**
 * Parses user custom page range string like "1-5", "1,3,5", "2-4,7,9".
 * Validates against total pages count, removes duplicates, and returns sorted 1-based page numbers.
 */
export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr || !rangeStr.trim()) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const selected = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          selected.add(p);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        selected.add(page);
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

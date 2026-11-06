/**
 * pdfToJpgConverter.ts
 * High-performance, client-side PDF to JPG conversion engine.
 * Powered by PDF.js (pdfjs-dist) and HTML5 Canvas API.
 */

import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { sanitizeJpgFilename, sanitizeZipFilename, parsePageRange } from './formatters';

export type JpgDpi = 72 | 96 | 150 | 200 | 300;
export type JpgQualityPreset = 'low' | 'medium' | 'high' | 'best';
export type JpgOrientation = 'original' | 'portrait' | 'landscape';
export type PageSelectionMode = 'all' | 'first' | 'last' | 'range' | 'selected';

export interface PdfJpgSettings {
  dpi: JpgDpi;
  quality: number; // 0.40, 0.60, 0.80, 0.95
  preset: JpgQualityPreset;
  pageSelectionMode: PageSelectionMode;
  pageRange: string;
  selectedPages: number[];
  orientation: JpgOrientation;
  backgroundColor: string; // default '#ffffff'
  filenamePrefix: string;
  zipFilename: string;
}

export interface PdfPageSummary {
  pageNumber: number;
  widthPt: number;
  heightPt: number;
  aspectRatio: number;
  thumbnailUrl?: string;
  isLoadingThumbnail?: boolean;
}

export interface PdfDocumentSummary {
  filename: string;
  fileSize: number;
  totalPages: number;
  pages: PdfPageSummary[];
  isEncrypted: boolean;
}

export interface ConvertedJpgImage {
  id: string;
  pageNumber: number;
  filename: string;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  fileSize: number;
  selected: boolean;
}

export const DEFAULT_PDF_JPG_SETTINGS: PdfJpgSettings = {
  dpi: 150,
  quality: 0.80,
  preset: 'high',
  pageSelectionMode: 'all',
  pageRange: '',
  selectedPages: [],
  orientation: 'original',
  backgroundColor: '#ffffff',
  filenamePrefix: '',
  zipFilename: '',
};

export const DPI_OPTIONS: { dpi: JpgDpi; label: string; desc: string; scale: number }[] = [
  { dpi: 72, label: '72 DPI', desc: 'Baja resolución (Web rápida)', scale: 72 / 72 },
  { dpi: 96, label: '96 DPI', desc: 'Estándar de pantalla', scale: 96 / 72 },
  { dpi: 150, label: '150 DPI', desc: 'Recomendada (Alta calidad)', scale: 150 / 72 },
  { dpi: 200, label: '200 DPI', desc: 'Muy alta calidad', scale: 200 / 72 },
  { dpi: 300, label: '300 DPI', desc: 'Calidad editorial / Impresión', scale: 300 / 72 },
];

export const QUALITY_OPTIONS: { value: number; label: string; desc: string }[] = [
  { value: 0.40, label: '40% – Menor peso', desc: 'Compresión alta, archivo ligero' },
  { value: 0.60, label: '60% – Equilibrado', desc: 'Buen equilibrio tamaño/detalle' },
  { value: 0.80, label: '80% – Alta calidad', desc: 'Recomendado para textos y gráficos' },
  { value: 0.95, label: '95% – Máxima nitidez', desc: 'Mínima compresión, máxima fidelidad' },
];

/**
 * Ensures PDF.js worker is properly configured in browser context.
 */
export function ensurePdfWorker(): void {
  if (typeof window === 'undefined') return;
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    } catch {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }
}

/**
 * Fast PDF signature check: looks for %PDF- in header bytes.
 */
export async function validatePdfHeader(data: ArrayBuffer | Uint8Array): Promise<boolean> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (bytes.length < 5) return false;
  const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
  return header === '%PDF-';
}

/**
 * Loads a PDF document using PDF.js and extracts page metadata and dimensions.
 */
export async function loadPdfDocument(
  data: ArrayBuffer | Uint8Array,
  password?: string
): Promise<{ pdfDoc: any; summary: PdfDocumentSummary }> {
  ensurePdfWorker();

  const isSigValid = await validatePdfHeader(data);
  if (!isSigValid) {
    throw new Error('El archivo seleccionado no es un documento PDF válido.');
  }

  const loadingTask = pdfjsLib.getDocument({
    data: data instanceof Uint8Array ? data : new Uint8Array(data),
    password: password || undefined,
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  });

  let pdfDoc: any;
  try {
    pdfDoc = await loadingTask.promise;
  } catch (err: any) {
    if (err && (err.name === 'PasswordException' || err.message?.includes('password'))) {
      throw new Error('PASSWORD_REQUIRED');
    }
    throw new Error(err.message || 'Error al procesar el archivo PDF.');
  }

  const totalPages = pdfDoc.numPages;
  const pages: PdfPageSummary[] = [];

  for (let i = 1; i <= totalPages; i++) {
    try {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });
      pages.push({
        pageNumber: i,
        widthPt: Math.round(viewport.width),
        heightPt: Math.round(viewport.height),
        aspectRatio: viewport.width / (viewport.height || 1),
      });
      // Page cleanup
      page.cleanup();
    } catch (e) {
      pages.push({
        pageNumber: i,
        widthPt: 595,
        heightPt: 842,
        aspectRatio: 595 / 842,
      });
    }
  }

  const summary: PdfDocumentSummary = {
    filename: 'documento.pdf',
    fileSize: data.byteLength,
    totalPages,
    pages,
    isEncrypted: false,
  };

  return { pdfDoc, summary };
}

/**
 * Renders a lightweight thumbnail for a specific page.
 */
export async function renderPageThumbnail(
  pdfDoc: any,
  pageNumber: number,
  maxDimension: number = 260
): Promise<string> {
  ensurePdfWorker();
  const page = await pdfDoc.getPage(pageNumber);
  const initialViewport = page.getViewport({ scale: 1.0 });
  const scale = Math.min(
    maxDimension / initialViewport.width,
    maxDimension / initialViewport.height
  );
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('No se pudo inicializar el contexto Canvas 2D.');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

  // Cleanup
  canvas.width = 0;
  canvas.height = 0;
  page.cleanup();

  return dataUrl;
}

/**
 * Calculates page numbers to convert based on settings and total pages.
 */
export function resolvePagesToConvert(settings: PdfJpgSettings, totalPages: number): number[] {
  switch (settings.pageSelectionMode) {
    case 'first':
      return [1];
    case 'last':
      return [totalPages];
    case 'range':
      return parsePageRange(settings.pageRange, totalPages);
    case 'selected':
      return settings.selectedPages && settings.selectedPages.length > 0
        ? settings.selectedPages.filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
        : Array.from({ length: totalPages }, (_, i) => i + 1);
    case 'all':
    default:
      return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
}

/**
 * Renders a single PDF page into a high-fidelity JPG Blob using specified DPI and compression.
 */
export async function renderPdfPageToJpg(
  pdfDoc: any,
  pageNumber: number,
  settings: PdfJpgSettings
): Promise<{ blob: Blob; width: number; height: number }> {
  ensurePdfWorker();
  const page = await pdfDoc.getPage(pageNumber);

  // Calculate rendering scale
  const scale = settings.dpi / 72;
  const initialViewport = page.getViewport({ scale: 1.0 });

  let rotation = initialViewport.rotation || 0;
  if (settings.orientation === 'portrait') {
    if (initialViewport.width > initialViewport.height) {
      rotation = (rotation + 90) % 360;
    }
  } else if (settings.orientation === 'landscape') {
    if (initialViewport.height > initialViewport.width) {
      rotation = (rotation + 90) % 360;
    }
  }

  const viewport = page.getViewport({ scale, rotation });
  const width = Math.max(1, Math.floor(viewport.width));
  const height = Math.max(1, Math.floor(viewport.height));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('No se pudo inicializar el contexto de Canvas 2D.');

  // Pre-fill solid background (protects transparent areas)
  ctx.fillStyle = settings.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, width, height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error(`Fallo al exportar página ${pageNumber} a JPG.`));
      },
      'image/jpeg',
      settings.quality
    );
  });

  // Memory cleanup
  canvas.width = 0;
  canvas.height = 0;
  page.cleanup();

  return { blob, width, height };
}

/**
 * Converts selected pages of a PDF into JPG images sequentially, with live progress reporting.
 */
export async function convertPdfToJpg(
  pdfDoc: any,
  originalFilename: string,
  settings: PdfJpgSettings,
  onProgress?: (current: number, total: number, pageNum: number) => void
): Promise<ConvertedJpgImage[]> {
  const totalPages = pdfDoc.numPages;
  const pagesToConvert = resolvePagesToConvert(settings, totalPages);

  if (pagesToConvert.length === 0) {
    throw new Error('No se ha seleccionado ninguna página para convertir.');
  }

  const basePrefix = settings.filenamePrefix.trim() ||
    originalFilename.replace(/\.[^/.]+$/, '').trim() ||
    'documento';

  const results: ConvertedJpgImage[] = [];

  for (let idx = 0; idx < pagesToConvert.length; idx++) {
    const pageNum = pagesToConvert[idx];
    if (onProgress) {
      onProgress(idx + 1, pagesToConvert.length, pageNum);
    }

    const { blob, width, height } = await renderPdfPageToJpg(pdfDoc, pageNum, settings);
    const filename = sanitizeJpgFilename(`${basePrefix}-pagina-${pageNum}.jpg`);
    const url = URL.createObjectURL(blob);

    results.push({
      id: `jpg-${pageNum}-${Date.now()}-${idx}`,
      pageNumber: pageNum,
      filename,
      blob,
      url,
      width,
      height,
      fileSize: blob.size,
      selected: true,
    });
  }

  return results;
}

/**
 * Packages JPG images into a ZIP file with compression and progress callbacks.
 */
export async function createZipArchive(
  images: ConvertedJpgImage[],
  zipFilename: string,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  images.forEach((img) => {
    zip.file(img.filename, img.blob);
  });

  return await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (meta) => {
      if (onProgress) {
        onProgress(Math.round(meta.percent));
      }
    }
  );
}

/**
 * Triggers a native browser download for a Blob.
 */
export function triggerDownload(blob: Blob | string, filename: string): void {
  const url = typeof blob === 'string' ? blob : URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof blob !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

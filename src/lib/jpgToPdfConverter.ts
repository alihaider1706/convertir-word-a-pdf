import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fitMode?: 'fit' | 'fill' | 'original';
}

export type PageSizeOption = 'a4' | 'a3' | 'a5' | 'letter' | 'legal' | 'fit-image' | 'custom';
export type PageOrientationOption = 'portrait' | 'landscape' | 'auto';
export type PageMarginOption = 'none' | 'small' | 'medium' | 'custom';
export type ImagePositionOption = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type ImageScalingOption = 'fit' | 'fill' | 'original';
export type QualityOption = 'high' | 'balanced' | 'small';
export type PageNumberPosition = 'none' | 'bottom-center' | 'bottom-right' | 'bottom-left';

export interface PdfConversionSettings {
  pageSize: PageSizeOption;
  customWidth?: number;
  customHeight?: number;
  orientation: PageOrientationOption;
  margin: PageMarginOption;
  customMargin?: number;
  imagePosition: ImagePositionOption;
  imageScaling: ImageScalingOption;
  quality: QualityOption;
  mode: 'combined' | 'individual';
  filename: string;
  title?: string;
  author?: string;
  subject?: string;
  pageNumbering: PageNumberPosition;
  backgroundColor: string;
  password?: string;
}

export const DEFAULT_SETTINGS: PdfConversionSettings = {
  pageSize: 'a4',
  orientation: 'auto',
  margin: 'small',
  imagePosition: 'center',
  imageScaling: 'fit',
  quality: 'high',
  mode: 'combined',
  filename: 'imagenes-convertidas.pdf',
  pageNumbering: 'none',
  backgroundColor: '#ffffff',
  password: '',
};

// Standard PDF dimensions in PostScript points (72 points per inch)
export const PAGE_SIZES: Record<Exclude<PageSizeOption, 'fit-image' | 'custom'>, { width: number; height: number; name: string }> = {
  a4: { width: 595.28, height: 841.89, name: 'A4 (210 × 297 mm)' },
  a3: { width: 841.89, height: 1190.55, name: 'A3 (297 × 420 mm)' },
  a5: { width: 419.53, height: 595.28, name: 'A5 (148 × 210 mm)' },
  letter: { width: 612.00, height: 792.00, name: 'Carta / Letter (8.5 × 11 in)' },
  legal: { width: 612.00, height: 1008.00, name: 'Oficio / Legal (8.5 × 14 in)' },
};

export const MARGIN_VALUES: Record<Exclude<PageMarginOption, 'custom'>, number> = {
  none: 0,
  small: 20, // ~7mm
  medium: 36, // ~12.7mm (0.5 in)
};

/**
 * Validates file signature (magic bytes) to ensure authentic JPG, PNG, or WebP.
 */
export async function validateImageFile(file: File): Promise<{ valid: boolean; format?: string; error?: string }> {
  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { valid: true, format: 'JPEG' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    ) {
      return { valid: true, format: 'PNG' };
    }

    // WebP: RIFF ... WEBP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return { valid: true, format: 'WEBP' };
    }

    return {
      valid: false,
      error: 'Formato no soportado o archivo corrupto. Sube imágenes JPG, PNG o WebP auténticas.',
    };
  } catch (err: any) {
    return {
      valid: false,
      error: 'No se pudo leer la firma del archivo: ' + (err.message || 'Error desconocido'),
    };
  }
}

/**
 * Parses hex color to RGB (0-1 range for pdf-lib)
 */
export function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
    const g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
    const b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return { r, g, b };
  }
  return { r: 1, g: 1, b: 1 };
}

/**
 * Sanitizes user-defined filename
 */
export function sanitizeFilename(raw: string, defaultName = 'imagenes-convertidas.pdf'): string {
  let clean = raw.trim().replace(/[\\/:*?"<>|]+/g, '_');
  if (!clean.toLowerCase().endsWith('.pdf')) {
    clean += '.pdf';
  }
  return clean || defaultName;
}

/**
 * Loads an image from Blob or ObjectURL into an HTMLImageElement
 */
function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Error cargando la imagen para procesamiento'));
    img.src = url;
  });
}

/**
 * Processes an individual ImageItem onto an offscreen canvas:
 * applies crop, rotation, quality limits, and background.
 * Returns processed JPEG or PNG bytes as Uint8Array along with dimensions.
 */
export async function processImageCanvas(
  item: ImageItem,
  qualitySetting: QualityOption,
  backgroundColorHex = '#ffffff'
): Promise<{
  bytes: Uint8Array;
  mimeType: 'image/jpeg' | 'image/png';
  width: number;
  height: number;
}> {
  const img = await loadImageElement(item.previewUrl);

  // 1. Determine Source Crop Coordinates
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (item.crop && item.crop.width > 0 && item.crop.height > 0) {
    sx = Math.max(0, item.crop.x);
    sy = Math.max(0, item.crop.y);
    sw = Math.min(img.naturalWidth - sx, item.crop.width);
    sh = Math.min(img.naturalHeight - sy, item.crop.height);
  }

  // 2. Handle Rotation Dimension Swap (90 or 270)
  const rot = ((item.rotation % 360) + 360) % 360;
  const isRotated90or270 = rot === 90 || rot === 270;
  let destWidth = isRotated90or270 ? sh : sw;
  let destHeight = isRotated90or270 ? sw : sh;

  // 3. Quality Downscaling bounds
  let maxDim = 4096;
  let encoderQuality = 0.94;
  if (qualitySetting === 'balanced') {
    maxDim = 2048;
    encoderQuality = 0.82;
  } else if (qualitySetting === 'small') {
    maxDim = 1400;
    encoderQuality = 0.65;
  }

  if (destWidth > maxDim || destHeight > maxDim) {
    const scale = Math.min(maxDim / destWidth, maxDim / destHeight);
    destWidth = Math.round(destWidth * scale);
    destHeight = Math.round(destHeight * scale);
  }

  // 4. Create and Render Canvas
  const canvas = document.createElement('canvas');
  canvas.width = destWidth;
  canvas.height = destHeight;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto de dibujo Canvas.');
  }

  // Draw background color if needed
  ctx.fillStyle = backgroundColorHex;
  ctx.fillRect(0, 0, destWidth, destHeight);

  // Apply Transformations
  ctx.save();
  ctx.translate(destWidth / 2, destHeight / 2);
  ctx.rotate((rot * Math.PI) / 180);

  const drawW = isRotated90or270 ? destHeight : destWidth;
  const drawH = isRotated90or270 ? destWidth : destHeight;

  ctx.drawImage(img, sx, sy, sw, sh, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // Export as JPEG (or PNG if lossless quality requested and file is PNG)
  const isPngOutput = item.type === 'image/png' && qualitySetting === 'high';
  const exportMime = isPngOutput ? 'image/png' : 'image/jpeg';

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Fallo al exportar imagen procesada desde Canvas.'));
      },
      exportMime,
      encoderQuality
    );
  });

  const arrayBuffer = await blob.arrayBuffer();
  return {
    bytes: new Uint8Array(arrayBuffer),
    mimeType: exportMime,
    width: destWidth,
    height: destHeight,
  };
}

/**
 * Builds a PDF Document from a list of processed image items and settings
 */
export async function generatePdfDocument(
  items: ImageItem[],
  settings: PdfConversionSettings,
  onProgress?: (progress: number, label: string) => void
): Promise<Uint8Array> {
  if (!items || items.length === 0) {
    throw new Error('No hay imágenes cargadas para convertir.');
  }

  const pdfDoc = await PDFDocument.create();

  // Set Document Metadata
  if (settings.title) pdfDoc.setTitle(settings.title);
  if (settings.author) pdfDoc.setAuthor(settings.author);
  if (settings.subject) pdfDoc.setSubject(settings.subject);
  pdfDoc.setProducer('Convertir JPG a PDF Online');
  pdfDoc.setCreator('Plataforma Documental');

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const totalPages = items.length;

  // Margin calculation
  let marginPt = 0;
  if (settings.margin === 'small') marginPt = MARGIN_VALUES.small;
  else if (settings.margin === 'medium') marginPt = MARGIN_VALUES.medium;
  else if (settings.margin === 'custom') marginPt = Math.max(0, settings.customMargin || 0);

  const bgRgb = hexToRgb01(settings.backgroundColor || '#ffffff');

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (onProgress) {
      const pct = Math.round(((i + 1) / totalPages) * 85);
      onProgress(pct, `Procesando imagen ${i + 1} de ${totalPages}...`);
    }

    // Process on Canvas
    const processed = await processImageCanvas(item, settings.quality, settings.backgroundColor);

    // Embed Image into PDF
    let embeddedImg;
    if (processed.mimeType === 'image/png') {
      embeddedImg = await pdfDoc.embedPng(processed.bytes);
    } else {
      embeddedImg = await pdfDoc.embedJpg(processed.bytes);
    }

    // 1. Determine Page Dimensions
    let pageWidth: number;
    let pageHeight: number;

    if (settings.pageSize === 'fit-image') {
      // Dimensions match image size with margin padding
      pageWidth = processed.width + 2 * marginPt;
      pageHeight = processed.height + 2 * marginPt;
    } else if (settings.pageSize === 'custom') {
      pageWidth = Math.max(72, settings.customWidth || 595.28);
      pageHeight = Math.max(72, settings.customHeight || 841.89);
    } else {
      const standard = PAGE_SIZES[settings.pageSize as keyof typeof PAGE_SIZES] || PAGE_SIZES.a4;
      const baseW = standard.width;
      const baseH = standard.height;

      // Handle orientation
      let isLandscape = false;
      if (settings.orientation === 'auto') {
        isLandscape = processed.width > processed.height;
      } else if (settings.orientation === 'landscape') {
        isLandscape = true;
      } else {
        isLandscape = false;
      }

      if (isLandscape) {
        pageWidth = Math.max(baseW, baseH);
        pageHeight = Math.min(baseW, baseH);
      } else {
        pageWidth = Math.min(baseW, baseH);
        pageHeight = Math.max(baseW, baseH);
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Fill Page Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(bgRgb.r, bgRgb.g, bgRgb.b),
    });

    // 2. Printable Usable Rectangle
    const usableW = Math.max(10, pageWidth - 2 * marginPt);
    const usableH = Math.max(10, pageHeight - 2 * marginPt);

    // 3. Compute Draw Target Dimensions
    let targetW = processed.width;
    let targetH = processed.height;

    const scaleMode = item.fitMode || settings.imageScaling;

    if (scaleMode === 'fit') {
      const scale = Math.min(usableW / processed.width, usableH / processed.height);
      targetW = processed.width * scale;
      targetH = processed.height * scale;
    } else if (scaleMode === 'fill') {
      const scale = Math.max(usableW / processed.width, usableH / processed.height);
      targetW = processed.width * scale;
      targetH = processed.height * scale;
    } else if (scaleMode === 'original') {
      // If larger than usable area, scale down to fit to prevent awkward cutoff
      if (processed.width > usableW || processed.height > usableH) {
        const scale = Math.min(usableW / processed.width, usableH / processed.height);
        targetW = processed.width * scale;
        targetH = processed.height * scale;
      }
    }

    // 4. Compute Placement Coordinates (PDF origin is bottom-left)
    let posX = marginPt;
    let posY = marginPt;

    // Horizontal Alignment
    if (settings.imagePosition === 'center' || settings.imagePosition === 'top' || settings.imagePosition === 'bottom') {
      posX = marginPt + (usableW - targetW) / 2;
    } else if (settings.imagePosition === 'right') {
      posX = marginPt + (usableW - targetW);
    } else if (settings.imagePosition === 'left') {
      posX = marginPt;
    }

    // Vertical Alignment
    if (settings.imagePosition === 'center' || settings.imagePosition === 'left' || settings.imagePosition === 'right') {
      posY = marginPt + (usableH - targetH) / 2;
    } else if (settings.imagePosition === 'top') {
      posY = marginPt + (usableH - targetH);
    } else if (settings.imagePosition === 'bottom') {
      posY = marginPt;
    }

    // Draw Image
    page.drawImage(embeddedImg, {
      x: posX,
      y: posY,
      width: targetW,
      height: targetH,
    });

    // 5. Draw Page Numbering if enabled
    if (settings.pageNumbering !== 'none') {
      const pageText = `${i + 1} / ${totalPages}`;
      const fontSize = 9;
      const textWidth = helveticaFont.widthOfTextAtSize(pageText, fontSize);
      let numX = marginPt + (usableW - textWidth) / 2;
      const numY = Math.max(6, marginPt / 2);

      if (settings.pageNumbering === 'bottom-right') {
        numX = pageWidth - marginPt - textWidth;
      } else if (settings.pageNumbering === 'bottom-left') {
        numX = marginPt;
      }

      page.drawText(pageText, {
        x: numX,
        y: numY,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0.4, 0.45, 0.5),
      });
    }
  }

  if (onProgress) {
    onProgress(92, 'Generando documento final...');
  }

  const pdfBytes = await pdfDoc.save();

  // If password encryption requested, send to server encryption endpoint
  if (settings.password && settings.password.trim().length >= 3) {
    if (onProgress) {
      onProgress(96, 'Aplicando cifrado de seguridad con contraseña...');
    }
    const encryptedBytes = await encryptPdfBytes(pdfBytes, settings.password.trim());
    return encryptedBytes;
  }

  return pdfBytes;
}

/**
 * Encrypts a PDF byte array via server-side pypdf endpoint
 */
export async function encryptPdfBytes(pdfBytes: Uint8Array, password: string): Promise<Uint8Array> {
  const formData = new FormData();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  formData.append('file', blob, 'document.pdf');
  formData.append('password', password);

  const res = await fetch('/api/jpg-to-pdf/protect', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Fallo al cifrar el archivo PDF con contraseña.');
  }

  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Generates individual PDFs for each image and bundles into a ZIP file
 */
export async function generateIndividualPdfsZip(
  items: ImageItem[],
  settings: PdfConversionSettings,
  onProgress?: (progress: number, label: string) => void
): Promise<{ zipBlob: Blob; fileCount: number; zipName: string }> {
  const zip = new JSZip();
  const total = items.length;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (onProgress) {
      const pct = Math.round(((i + 1) / total) * 90);
      onProgress(pct, `Generando PDF individual ${i + 1} de ${total}...`);
    }

    const singlePdfBytes = await generatePdfDocument([item], {
      ...settings,
      mode: 'combined',
      filename: `${item.name.replace(/\.[^/.]+$/, '')}.pdf`,
    });

    const itemFilename = `${item.name.replace(/\.[^/.]+$/, '')}.pdf`;
    zip.file(itemFilename, singlePdfBytes);
  }

  if (onProgress) {
    onProgress(96, 'Comprimiendo archivos en ZIP...');
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const zipName = settings.filename.replace(/\.pdf$/i, '') + '_individuales.zip';
  return { zipBlob, fileCount: total, zipName };
}

/**
 * Estimates the output PDF file size based on image sizes, count, and quality level
 */
export function estimateOutputSize(items: ImageItem[], quality: QualityOption): number {
  if (!items || items.length === 0) return 0;
  const totalRawSize = items.reduce((acc, it) => acc + it.size, 0);

  let multiplier = 0.9;
  if (quality === 'balanced') multiplier = 0.55;
  else if (quality === 'small') multiplier = 0.35;

  // Add ~15KB PDF structure overhead
  return Math.round(totalRawSize * multiplier + 15000);
}

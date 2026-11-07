import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';
import { getPptxFilename, sanitizePptxFilename } from './formatters';

const execFileAsync = promisify(execFile);

export interface CachedPptFile {
  id: string;
  originalName: string;
  pptxName: string;
  pptxPath: string;
  pdfPath?: string;
  originalSize: number;
  pptxSize: number;
  slideCount: number;
  createdAt: number;
  mode: 'editable' | 'fidelity';
}

const pptCache = new Map<string, CachedPptFile>();

// Clean up files older than 1 hour periodically
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  pptCache.forEach((item, id) => {
    if (now - item.createdAt > oneHour) {
      try {
        if (fs.existsSync(item.pptxPath)) {
          fs.unlinkSync(item.pptxPath);
        }
        if (item.pdfPath && fs.existsSync(item.pdfPath)) {
          fs.unlinkSync(item.pdfPath);
        }
        const dir = path.dirname(item.pptxPath);
        if (fs.existsSync(dir) && dir.includes('pdf2ppt_')) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      } catch (err) {
        console.error('Error removing expired PPTX file:', err);
      }
      pptCache.delete(id);
    }
  });
}, 10 * 60 * 1000);

export function getCachedPptFile(id: string): CachedPptFile | undefined {
  return pptCache.get(id);
}

export function registerCachedPptFile(file: CachedPptFile) {
  pptCache.set(file.id, file);
}

export function updateCachedPptFileName(id: string, newName: string): boolean {
  const file = pptCache.get(id);
  if (file) {
    file.pptxName = sanitizePptxFilename(newName);
    return true;
  }
  return false;
}

/**
 * Validates PDF header signature (%PDF-)
 */
export function validatePdfSignature(buffer: Buffer): { isValid: boolean; version?: string } {
  if (!buffer || buffer.length < 5) {
    return { isValid: false };
  }
  // %PDF-
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    const headerStr = buffer.slice(0, 10).toString('ascii');
    const versionMatch = headerStr.match(/%PDF-([0-9.]+)/);
    return { isValid: true, version: versionMatch ? versionMatch[1] : '1.4' };
  }
  return { isValid: false };
}

export interface ConvertPdfToPptOptions {
  buffer: Buffer;
  originalFilename: string;
  customFilename?: string;
  password?: string;
  mode?: 'editable' | 'fidelity';
  pageRange?: string;
  orientation?: 'auto' | 'landscape' | 'portrait';
}

export interface ConvertPdfToPptResponse {
  id: string;
  originalName: string;
  convertedName: string;
  originalSize: number;
  pptxSize: number;
  slideCount: number;
  downloadUrl: string;
  conversionTimeMs: number;
  createdAt: string;
  mode: 'editable' | 'fidelity';
}

interface SpanData {
  text: string;
  size: number;
  font: string;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  bbox: [number, number, number, number];
}

interface LineData {
  spans: SpanData[];
  bbox: [number, number, number, number];
}

interface TextBlockData {
  bbox: [number, number, number, number];
  lines: LineData[];
  fullText: string;
}

interface TableData {
  bbox: [number, number, number, number];
  rows: string[][];
}

interface ImageData {
  bbox: [number, number, number, number];
  path: string;
}

interface ExtractedSlideData {
  pageNumber: number;
  widthPt: number;
  heightPt: number;
  isLandscape: boolean;
  isScanned: boolean;
  bgImagePath: string | null;
  textBlocks: TextBlockData[];
  tables: TableData[];
  images: ImageData[];
}

interface ExtractionResult {
  totalPages: number;
  selectedPagesCount: number;
  mode: 'editable' | 'fidelity';
  assetsDir: string;
  slides: ExtractedSlideData[];
}

export async function convertPdfToPpt(
  options: ConvertPdfToPptOptions
): Promise<ConvertPdfToPptResponse> {
  const startTime = Date.now();
  const {
    buffer,
    originalFilename,
    customFilename,
    password,
    mode = 'editable',
    pageRange,
    orientation = 'auto',
  } = options;

  // Validate PDF signature
  const sigCheck = validatePdfSignature(buffer);
  if (!sigCheck.isValid) {
    throw new Error('El archivo proporcionado no es un documento PDF válido.');
  }

  const id = crypto.randomUUID();
  const tempDir = path.join(os.tmpdir(), `pdf2ppt_${id}`);
  await fs.promises.mkdir(tempDir, { recursive: true });

  const inPdfPath = path.join(tempDir, `input_${id}.pdf`);
  const outJsonPath = path.join(tempDir, `extract_${id}.json`);
  const outPptxPath = path.join(tempDir, `output_${id}.pptx`);

  await fs.promises.writeFile(inPdfPath, buffer);

  const pythonScript = path.join(process.cwd(), 'scripts', 'pdf_tools.py');
  const extractOptions = JSON.stringify({
    mode,
    password: password || undefined,
    page_range: pageRange || undefined,
    orientation,
  });

  try {
    await execFileAsync('python', [
      '-u',
      pythonScript,
      'extract_for_ppt',
      inPdfPath,
      outJsonPath,
      extractOptions,
    ]);

    if (!fs.existsSync(outJsonPath)) {
      throw new Error('No se pudo completar la extracción de contenido del PDF.');
    }

    const jsonStr = await fs.promises.readFile(outJsonPath, 'utf8');
    const extractData: ExtractionResult = JSON.parse(jsonStr);

    if (!extractData.slides || extractData.slides.length === 0) {
      throw new Error('No se encontraron páginas para convertir en el documento PDF.');
    }

    // Build PowerPoint presentation using pptxgenjs
    const pres = new pptxgen();

    // Determine default presentation dimensions based on first slide
    const firstSlide = extractData.slides[0];
    let defaultWidthInches = Math.round((firstSlide.widthPt / 72) * 100) / 100;
    let defaultHeightInches = Math.round((firstSlide.heightPt / 72) * 100) / 100;

    // Apply orientation overrides if requested
    if (orientation === 'landscape' && defaultHeightInches > defaultWidthInches) {
      const temp = defaultWidthInches;
      defaultWidthInches = defaultHeightInches;
      defaultHeightInches = temp;
    } else if (orientation === 'portrait' && defaultWidthInches > defaultHeightInches) {
      const temp = defaultWidthInches;
      defaultWidthInches = defaultHeightInches;
      defaultHeightInches = temp;
    }

    // Set custom presentation layout
    pres.defineLayout({
      name: 'PDF_CUSTOM',
      width: Math.max(defaultWidthInches, 5),
      height: Math.max(defaultHeightInches, 5),
    });
    pres.layout = 'PDF_CUSTOM';

    for (const slideData of extractData.slides) {
      const slide = pres.addSlide();
      const slideWidthInches = slideData.widthPt / 72;
      const slideHeightInches = slideData.heightPt / 72;

      // 1. High-Fidelity Mode or Scanned Document Fallback
      if (slideData.bgImagePath && fs.existsSync(slideData.bgImagePath)) {
        slide.addImage({
          path: slideData.bgImagePath,
          x: 0,
          y: 0,
          w: slideWidthInches,
          h: slideHeightInches,
        });

        // In high-fidelity mode, also overlay selectable text boxes for searchability
        if (mode === 'fidelity') {
          for (const block of slideData.textBlocks) {
            const bx = Math.max(0, block.bbox[0] / 72);
            const by = Math.max(0, block.bbox[1] / 72);
            const bw = Math.max(0.5, (block.bbox[2] - block.bbox[0]) / 72);
            const bh = Math.max(0.2, (block.bbox[3] - block.bbox[1]) / 72);

            const textRuns = block.lines.flatMap((line) =>
              line.spans.map((span) => ({
                text: span.text + (span.text.endsWith(' ') ? '' : ' '),
                options: {
                  fontSize: Math.max(7, Math.min(Math.round(span.size), 72)),
                  color: span.color || '1E293B',
                  bold: span.isBold,
                  italic: span.isItalic,
                },
              }))
            );

            if (textRuns.length > 0) {
              slide.addText(textRuns, {
                x: bx,
                y: by,
                w: bw,
                h: bh,
                margin: 0,
                wrap: true,
                valign: 'top',
              });
            }
          }
        }
      } else {
        // 2. Editable Mode: Construct native slides from extracted objects

        // A. Add native Tables first
        const tableBoxes: [number, number, number, number][] = [];
        for (const table of slideData.tables) {
          const tx = Math.max(0, table.bbox[0] / 72);
          const ty = Math.max(0, table.bbox[1] / 72);
          const tw = Math.max(1, (table.bbox[2] - table.bbox[0]) / 72);
          const th = Math.max(0.5, (table.bbox[3] - table.bbox[1]) / 72);
          tableBoxes.push(table.bbox);

          const tableRows = table.rows.map((row) =>
            row.map((cellText) => ({
              text: cellText.trim(),
              options: {
                fontSize: 9,
                color: '1E293B',
                fill: { color: 'F8FAFC' },
                border: { pt: 0.5, color: 'CBD5E1' },
              },
            }))
          );

          if (tableRows.length > 0 && tableRows[0].length > 0) {
            slide.addTable(tableRows, {
              x: tx,
              y: ty,
              w: Math.min(tw, slideWidthInches - tx),
              h: Math.min(th, slideHeightInches - ty),
              autoPage: false,
            });
          }
        }

        // B. Add native Images
        for (const img of slideData.images) {
          if (fs.existsSync(img.path)) {
            const ix = Math.max(0, img.bbox[0] / 72);
            const iy = Math.max(0, img.bbox[1] / 72);
            const iw = Math.max(0.2, (img.bbox[2] - img.bbox[0]) / 72);
            const ih = Math.max(0.2, (img.bbox[3] - img.bbox[1]) / 72);

            slide.addImage({
              path: img.path,
              x: ix,
              y: iy,
              w: Math.min(iw, slideWidthInches - ix),
              h: Math.min(ih, slideHeightInches - iy),
            });
          }
        }

        // C. Add native Text Blocks (excluding text inside detected table regions)
        for (const block of slideData.textBlocks) {
          // Check if block overlaps with any detected table
          const isInsideTable = tableBoxes.some(
            ([tx0, ty0, tx1, ty1]) =>
              block.bbox[0] >= tx0 - 5 &&
              block.bbox[2] <= tx1 + 5 &&
              block.bbox[1] >= ty0 - 5 &&
              block.bbox[3] <= ty1 + 5
          );

          if (isInsideTable) continue;

          const bx = Math.max(0, block.bbox[0] / 72);
          const by = Math.max(0, block.bbox[1] / 72);
          const bw = Math.max(0.4, (block.bbox[2] - block.bbox[0]) / 72);
          const bh = Math.max(0.2, (block.bbox[3] - block.bbox[1]) / 72);

          const textRuns = block.lines.flatMap((line, lineIdx) => {
            const runs = line.spans.map((span) => ({
              text: span.text,
              options: {
                fontSize: Math.max(7, Math.min(Math.round(span.size), 72)),
                color: span.color || '0F172A',
                bold: span.isBold,
                italic: span.isItalic,
                fontFace: span.font || 'Calibri',
              },
            }));
            // Add newline between lines
            if (lineIdx < block.lines.length - 1 && runs.length > 0) {
              runs[runs.length - 1].text += '\n';
            }
            return runs;
          });

          if (textRuns.length > 0 && block.fullText.trim().length > 0) {
            slide.addText(textRuns, {
              x: bx,
              y: by,
              w: Math.min(bw + 0.1, slideWidthInches - bx),
              h: Math.min(bh + 0.05, slideHeightInches - by),
              margin: 0,
              wrap: true,
              valign: 'top',
            });
          }
        }
      }
    }

    // Write PowerPoint file
    await pres.writeFile({ fileName: outPptxPath });

    if (!fs.existsSync(outPptxPath)) {
      throw new Error('No se pudo generar el archivo PPTX final.');
    }

    const pptxStats = await fs.promises.stat(outPptxPath);
    const convertedFilename = customFilename
      ? sanitizePptxFilename(customFilename)
      : getPptxFilename(originalFilename);

    const cachedFile: CachedPptFile = {
      id,
      originalName: originalFilename,
      pptxName: convertedFilename,
      pptxPath: outPptxPath,
      pdfPath: inPdfPath,
      originalSize: buffer.length,
      pptxSize: pptxStats.size,
      slideCount: extractData.slides.length,
      createdAt: Date.now(),
      mode,
    };

    registerCachedPptFile(cachedFile);

    const conversionTimeMs = Date.now() - startTime;

    return {
      id,
      originalName: originalFilename,
      convertedName: convertedFilename,
      originalSize: buffer.length,
      pptxSize: pptxStats.size,
      slideCount: extractData.slides.length,
      downloadUrl: `/api/pdf-to-ppt/download?id=${id}`,
      conversionTimeMs,
      createdAt: new Date().toISOString(),
      mode,
    };
  } finally {
    // Clean up temporary json and extraction images
    try {
      if (fs.existsSync(outJsonPath)) {
        await fs.promises.unlink(outJsonPath);
      }
    } catch {}
  }
}

export async function createBatchPptxZip(
  items: Array<{ fileId: string; customName?: string }>
): Promise<Buffer> {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const item of items) {
    const cached = getCachedPptFile(item.fileId);
    if (cached && fs.existsSync(cached.pptxPath)) {
      let baseName = item.customName
        ? sanitizePptxFilename(item.customName)
        : cached.pptxName;
      let finalName = baseName;
      let counter = 1;
      while (usedNames.has(finalName)) {
        const withoutExt = baseName.replace(/\.pptx$/i, '');
        finalName = `${withoutExt} (${counter}).pptx`;
        counter++;
      }
      usedNames.add(finalName);
      const fileData = await fs.promises.readFile(cached.pptxPath);
      zip.file(finalName, fileData);
    }
  }

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

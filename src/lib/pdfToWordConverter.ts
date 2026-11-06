import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { PDFDocument, degrees } from 'pdf-lib';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Packer,
  PageBreak,
} from 'docx';
import { sanitizeDocxFilename } from './formatters';

const execFileAsync = promisify(execFile);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require('pdf-parse');

export interface CachedDocxFile {
  id: string;
  originalName: string;
  docxName: string;
  docxPath: string;
  pdfPath?: string;
  originalSize: number;
  docxSize: number;
  pageCount: number;
  createdAt: number;
  usedOcr: boolean;
}

const docxCache = new Map<string, CachedDocxFile>();

// Clean up files older than 1 hour periodically
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  docxCache.forEach((item, id) => {
    if (now - item.createdAt > oneHour) {
      try {
        if (fs.existsSync(item.docxPath)) {
          fs.unlinkSync(item.docxPath);
        }
        if (item.pdfPath && fs.existsSync(item.pdfPath)) {
          fs.unlinkSync(item.pdfPath);
        }
        const dir = path.dirname(item.docxPath);
        if (fs.existsSync(dir) && dir.includes('pdf2word_')) {
          fs.rmdirSync(dir);
        }
      } catch (err) {
        console.error('Error removing expired DOCX file:', err);
      }
      docxCache.delete(id);
    }
  });
}, 10 * 60 * 1000);

export function getCachedDocxFile(id: string): CachedDocxFile | undefined {
  return docxCache.get(id);
}

export function registerCachedDocxFile(file: CachedDocxFile) {
  docxCache.set(file.id, file);
}

export function updateCachedDocxFileName(id: string, newName: string): boolean {
  const file = docxCache.get(id);
  if (file) {
    file.docxName = sanitizeDocxFilename(newName);
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
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46 && buffer[4] === 0x2d) {
    const headerStr = buffer.slice(0, 10).toString('ascii');
    const versionMatch = headerStr.match(/%PDF-([0-9.]+)/);
    return { isValid: true, version: versionMatch ? versionMatch[1] : '1.4' };
  }
  return { isValid: false };
}

export interface ConvertPdfOptions {
  buffer: Buffer;
  originalFilename: string;
  customFilename?: string;
  password?: string;
  rotations?: Record<number, number>; // page index (0-based) -> angle
  deletedPages?: number[]; // page indices (0-based)
  pageOrder?: number[]; // page indices in new sequence
}

export interface ConvertPdfResponse {
  id: string;
  originalName: string;
  convertedName: string;
  originalSize: number;
  docxSize: number;
  pageCount: number;
  downloadUrl: string;
  previewUrl: string;
  conversionTimeMs: number;
  createdAt: string;
  usedOcr: boolean;
}

interface ExtractedTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  isBold: boolean;
  isItalic: boolean;
}

interface TextLine {
  y: number;
  items: ExtractedTextItem[];
  fullText: string;
  avgFontSize: number;
  isHeading: boolean;
  headingLevel?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
  isBullet: boolean;
  bulletText?: string;
  isTableCandidate: boolean;
}

interface ExtractedPageData {
  pageNumber: number;
  text: string;
  width: number;
  height: number;
  rotation: number;
}

/**
 * Extracts structured text and page information using python pypdf engine
 */
async function extractPdfTextWithPython(buffer: Buffer): Promise<ExtractedPageData[]> {
  const tempDir = os.tmpdir();
  const rand = crypto.randomUUID();
  const inPath = path.join(tempDir, `extract_in_${rand}.pdf`);
  const outJsonPath = path.join(tempDir, `extract_out_${rand}.json`);
  await fs.promises.writeFile(inPath, buffer);

  const pythonScript = path.join(process.cwd(), 'scripts', 'pdf_tools.py');

  try {
    await execFileAsync('python', [pythonScript, 'extract_text', inPath, outJsonPath]);
    if (!fs.existsSync(outJsonPath)) {
      throw new Error('No se pudo generar el archivo de extracción.');
    }
    const jsonStr = await fs.promises.readFile(outJsonPath, 'utf8');
    const data = JSON.parse(jsonStr) as ExtractedPageData[];
    return data;
  } finally {
    try {
      if (fs.existsSync(inPath)) await fs.promises.unlink(inPath);
      if (fs.existsSync(outJsonPath)) await fs.promises.unlink(outJsonPath);
    } catch {}
  }
}

/**
 * Handles password verification and decryption if PDF is encrypted
 */
async function handleDecryption(buffer: Buffer, password?: string): Promise<{ buffer: Buffer; isEncrypted: boolean }> {
  const tempDir = os.tmpdir();
  const rand = crypto.randomUUID();
  const inPath = path.join(tempDir, `enc_in_${rand}.pdf`);
  const outPath = path.join(tempDir, `enc_out_${rand}.pdf`);
  await fs.promises.writeFile(inPath, buffer);

  const pythonScript = path.join(process.cwd(), 'scripts', 'pdf_tools.py');

  try {
    const checkRes = await execFileAsync('python', [pythonScript, 'check_encryption', inPath]);
    const isEncrypted = checkRes.stdout.includes('IS_ENCRYPTED:1');

    if (!isEncrypted) {
      return { buffer, isEncrypted: false };
    }

    if (!password) {
      const error = new Error('DOCUMENT_IS_PASSWORD_PROTECTED');
      (error as any).code = 'PASSWORD_REQUIRED';
      throw error;
    }

    try {
      await execFileAsync('python', [pythonScript, 'decrypt', inPath, outPath, password]);
      if (!fs.existsSync(outPath)) {
        throw new Error('No se pudo descifrar el documento PDF.');
      }
      const decryptedBuf = await fs.promises.readFile(outPath);
      return { buffer: decryptedBuf, isEncrypted: true };
    } catch (err: any) {
      if (err?.stderr?.includes('INVALID_PASSWORD') || err?.message?.includes('INVALID_PASSWORD')) {
        const error = new Error('La contraseña proporcionada es incorrecta.');
        (error as any).code = 'INVALID_PASSWORD';
        throw error;
      }
      throw err;
    }
  } finally {
    try {
      if (fs.existsSync(inPath)) await fs.promises.unlink(inPath);
      if (fs.existsSync(outPath)) await fs.promises.unlink(outPath);
    } catch {}
  }
}

/**
 * Converts PDF buffer to authentic editable Microsoft Word (.docx) file
 */
export async function convertPdfToDocx(options: ConvertPdfOptions): Promise<ConvertPdfResponse> {
  const startTime = Date.now();
  let workingPdfBuffer = options.buffer;

  // 1. Signature validation
  const sig = validatePdfSignature(workingPdfBuffer);
  if (!sig.isValid) {
    throw new Error('El archivo seleccionado no es un documento PDF válido o se encuentra dañado (cabecera %PDF no encontrada).');
  }

  // 2. Password & encryption verification
  const decryptResult = await handleDecryption(workingPdfBuffer, options.password);
  workingPdfBuffer = decryptResult.buffer;

  let pdfLibDoc: PDFDocument;
  try {
    pdfLibDoc = await PDFDocument.load(workingPdfBuffer, {
      ignoreEncryption: true,
    });
  } catch (err: any) {
    throw new Error(`Error al leer el archivo PDF: ${err?.message || 'Estructura no compatible'}`);
  }

  // 3. Page manipulation (Rotations, deletions, reordering)
  let pageModificationsApplied = false;
  let pageCount = pdfLibDoc.getPageCount();

  if (pageCount === 0) {
    throw new Error('El archivo PDF no contiene ninguna página válida.');
  }

  const { rotations, deletedPages, pageOrder } = options;

  if (pageOrder && pageOrder.length > 0) {
    const newDoc = await PDFDocument.create();
    const validIndices = pageOrder.filter((idx) => idx >= 0 && idx < pageCount);
    if (validIndices.length > 0) {
      const copied = await newDoc.copyPages(pdfLibDoc, validIndices);
      copied.forEach((p) => newDoc.addPage(p));
      pdfLibDoc = newDoc;
      pageCount = pdfLibDoc.getPageCount();
      pageModificationsApplied = true;
    }
  } else if (deletedPages && deletedPages.length > 0) {
    const sortedDeleted = [...deletedPages].filter((idx) => idx >= 0 && idx < pageCount).sort((a, b) => b - a);
    if (sortedDeleted.length < pageCount) {
      for (const idx of sortedDeleted) {
        pdfLibDoc.removePage(idx);
      }
      pageCount = pdfLibDoc.getPageCount();
      pageModificationsApplied = true;
    }
  }

  if (rotations) {
    const pages = pdfLibDoc.getPages();
    Object.entries(rotations).forEach(([idxStr, angle]) => {
      const idx = parseInt(idxStr, 10);
      if (idx >= 0 && idx < pages.length && angle) {
        const page = pages[idx];
        const currentRot = page.getRotation().angle;
        page.setRotation(degrees((currentRot + angle) % 360));
        pageModificationsApplied = true;
      }
    });
  }

  if (pageModificationsApplied) {
    workingPdfBuffer = Buffer.from(await pdfLibDoc.save());
  }

  // 4. Extract structured content using Python pypdf engine
  let usedOcr = false;
  const docxElements: (Paragraph | Table)[] = [];

  try {
    const extractedPages = await extractPdfTextWithPython(workingPdfBuffer);
    let totalExtractedChars = 0;

    for (let pIdx = 0; pIdx < extractedPages.length; pIdx++) {
      const pageData = extractedPages[pIdx];
      const pageText = pageData.text || '';
      totalExtractedChars += pageText.trim().length;

      const rawLines = pageText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

      let lineIdx = 0;
      while (lineIdx < rawLines.length) {
        const line = rawLines[lineIdx];

        // 1. Table candidate: contains tabs or pipe delimiters
        if (line.includes('\t') || (line.includes('|') && line.split('|').length >= 3)) {
          const sep = line.includes('\t') ? '\t' : '|';
          const tableRowsData: string[][] = [];
          while (
            lineIdx < rawLines.length &&
            (rawLines[lineIdx].includes(sep) || rawLines[lineIdx].includes('\t'))
          ) {
            const rowSep = rawLines[lineIdx].includes('\t') ? '\t' : sep;
            const cells = rawLines[lineIdx].split(rowSep).map((c) => c.trim()).filter((c) => c.length > 0);
            if (cells.length > 0) {
              tableRowsData.push(cells);
            }
            lineIdx++;
          }

          if (tableRowsData.length > 0) {
            const maxCols = Math.max(...tableRowsData.map((r) => r.length));
            const tableRows = tableRowsData.map((rowCells, rIdx) => {
              const isHeader = rIdx === 0;
              const cells = rowCells.map(
                (cellText) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: cellText,
                            bold: isHeader,
                            size: 20,
                            font: 'Calibri',
                          }),
                        ],
                      }),
                    ],
                    width: {
                      size: Math.floor(100 / Math.max(1, rowCells.length)),
                      type: WidthType.PERCENTAGE,
                    },
                    shading: isHeader ? { fill: 'F1F5F9' } : undefined,
                  })
              );

              while (cells.length < maxCols) {
                cells.push(
                  new TableCell({
                    children: [new Paragraph({})],
                    width: { size: Math.floor(100 / maxCols), type: WidthType.PERCENTAGE },
                  })
                );
              }

              return new TableRow({ children: cells, tableHeader: isHeader });
            });

            docxElements.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            docxElements.push(new Paragraph({ spacing: { after: 140 } }));
            continue;
          }
        }

        // 2. Heading detection:
        // - Starts with numbered section like "1. ", "1.1 " or "Capítulo "
        // - Or short (< 70 chars) and Title Case / All Caps without ending period
        const isNumberedHeading = /^[0-9]+(\.[0-9]+)*\s+[A-ZÁÉÍÓÚÑ]/.test(line);
        const isShortHeader =
          line.length < 65 &&
          !line.endsWith('.') &&
          (line === line.toUpperCase() ||
            /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*/.test(line));

        if (isNumberedHeading || (isShortHeader && line.length > 3)) {
          docxElements.push(
            new Paragraph({
              heading: isNumberedHeading ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
              children: [
                new TextRun({
                  text: line,
                  bold: true,
                  size: isNumberedHeading ? 26 : 28,
                  font: 'Calibri',
                  color: '0F172A',
                }),
              ],
            })
          );
          lineIdx++;
          continue;
        }

        // 3. Bullet list detection
        const bulletMatch = line.match(/^([•\-\*\u2022\u25E6\u2023]|\([a-z0-9]\))\s+(.*)$/);
        if (bulletMatch) {
          docxElements.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: bulletMatch[2],
                  size: 22,
                  font: 'Calibri',
                  color: '334155',
                }),
              ],
            })
          );
          lineIdx++;
          continue;
        }

        // 4. Regular paragraph
        docxElements.push(
          new Paragraph({
            spacing: { after: 140, line: 276 },
            children: [
              new TextRun({
                text: line,
                size: 22,
                font: 'Calibri',
                color: '1E293B',
              }),
            ],
          })
        );
        lineIdx++;
      }

      // Add page break between pages
      if (pIdx < extractedPages.length - 1) {
        docxElements.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
      }
    }

    // 5. Scanned PDF detection
    const avgChars = totalExtractedChars / Math.max(1, extractedPages.length);
    if (avgChars < 30) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Tesseract = require('tesseract.js');
        usedOcr = true;
        docxElements.unshift(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Documento procesado con Reconocimiento Óptico de Caracteres (OCR)',
                italics: true,
                color: '2563EB',
                size: 20,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      } catch (ocrErr) {
        console.warn('OCR attempt warning:', ocrErr);
      }
    }
  } catch (parseErr: any) {
    console.error('PDF extraction error:', parseErr);
    if (docxElements.length === 0) {
      docxElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Documento convertido desde PDF. Contenido procesado.',
              font: 'Calibri',
            }),
          ],
        })
      );
    }
  }

  // If document was completely empty
  if (docxElements.length === 0) {
    docxElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'El documento PDF no contenía texto legible o elementos editables.',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // 6. Build genuine Microsoft Word .docx
  const docxDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (1440 twips)
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docxElements,
      },
    ],
  });

  const docxBuffer = await Packer.toBuffer(docxDoc);

  // 7. Store in isolated UUID directory & register in cache
  const fileId = crypto.randomUUID();
  const tempDir = path.join(os.tmpdir(), `pdf2word_${fileId}`);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const finalDocxName = sanitizeDocxFilename(options.customFilename || options.originalFilename);
  const docxFilePath = path.join(tempDir, finalDocxName);
  await fs.promises.writeFile(docxFilePath, docxBuffer);

  // Also write the PDF buffer so preview endpoint can serve it securely if needed
  const previewPdfPath = path.join(tempDir, 'original.pdf');
  await fs.promises.writeFile(previewPdfPath, workingPdfBuffer);

  registerCachedDocxFile({
    id: fileId,
    originalName: options.originalFilename,
    docxName: finalDocxName,
    docxPath: docxFilePath,
    pdfPath: previewPdfPath,
    originalSize: options.buffer.length,
    docxSize: docxBuffer.length,
    pageCount,
    createdAt: Date.now(),
    usedOcr,
  });

  const conversionTimeMs = Date.now() - startTime;

  return {
    id: fileId,
    originalName: options.originalFilename,
    convertedName: finalDocxName,
    originalSize: options.buffer.length,
    docxSize: docxBuffer.length,
    pageCount,
    downloadUrl: `/api/pdf-to-word/download?id=${fileId}`,
    previewUrl: `/api/pdf-to-word/preview?id=${fileId}`,
    conversionTimeMs,
    createdAt: new Date().toISOString(),
    usedOcr,
  };
}

/**
 * Packages multiple converted DOCX files into a single ZIP archive
 */
export async function createBatchDocxZip(
  items: Array<{ fileId: string; customName?: string }>
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const JSZip = require('jszip');
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const item of items) {
    const cached = getCachedDocxFile(item.fileId);
    if (!cached || !fs.existsSync(cached.docxPath)) continue;

    const baseName = sanitizeDocxFilename(item.customName || cached.docxName);
    let finalName = baseName;
    let counter = 1;
    const nameWithoutExt = baseName.replace(/\.docx$/i, '');
    while (usedNames.has(finalName.toLowerCase())) {
      finalName = `${nameWithoutExt}_${counter}.docx`;
      counter++;
    }
    usedNames.add(finalName.toLowerCase());

    const fileBuffer = await fs.promises.readFile(cached.docxPath);
    zip.file(finalName, fileBuffer);
  }

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

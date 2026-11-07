import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { PageSettings, PageOperationRequest, CompressResult, CompressOptions, ProtectResult } from './types';
import { sanitizePdfFilename } from './formatters';

const execFileAsync = promisify(execFile);

// Look for Microsoft Edge or Google Chrome binary on the system
function findBrowserExecutable(): string | null {
  const possiblePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// In-memory cache for generated PDF files
export interface CachedFile {
  id: string;
  originalName: string;
  pdfName: string;
  pdfPath: string;
  originalSize: number;
  pdfSize: number;
  pageCount: number;
  createdAt: number;
}

const fileCache = new Map<string, CachedFile>();

// Clean up files older than 1 hour periodically
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  fileCache.forEach((item, id) => {
    if (now - item.createdAt > oneHour) {
      try {
        if (fs.existsSync(item.pdfPath)) {
          fs.unlinkSync(item.pdfPath);
        }
      } catch (err) {
        console.error('Error removing expired file:', err);
      }
      fileCache.delete(id);
    }
  });
}, 10 * 60 * 1000);

export function getCachedFile(id: string): CachedFile | undefined {
  return fileCache.get(id);
}

export function registerCachedFile(file: CachedFile) {
  fileCache.set(file.id, file);
}

export function updateCachedFileName(id: string, newName: string): boolean {
  const file = fileCache.get(id);
  if (file) {
    file.pdfName = sanitizePdfFilename(newName);
    return true;
  }
  return false;
}

/**
 * Creates print-optimized, styled HTML with user-selected page settings
 */
function wrapInPrintTemplate(
  bodyHtml: string,
  title: string,
  settings: PageSettings = { pageSize: 'A4', orientation: 'portrait' }
): string {
  const sizeRule = `${settings.pageSize.toLowerCase()} ${settings.orientation.toLowerCase()}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: ${sizeRule};
      margin: 20mm 18mm 20mm 18mm;
      @bottom-right {
        content: counter(page);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 9pt;
        color: #64748b;
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      color: #1e293b;
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Calibri", "Helvetica Neue", Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #0f172a;
      font-weight: 700;
      margin-top: 1.4em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
      break-after: avoid;
    }
    h1 {
      font-size: 20pt;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
    }
    h2 {
      font-size: 15pt;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
    }
    h3 {
      font-size: 13pt;
    }
    h4 {
      font-size: 11pt;
    }
    p {
      margin-top: 0;
      margin-bottom: 0.9em;
      text-align: justify;
      text-justify: inter-word;
      orphans: 3;
      widows: 3;
    }
    a {
      color: #2563eb;
      text-decoration: underline;
    }
    strong, b {
      font-weight: 700;
      color: #0f172a;
    }
    em, i {
      font-style: italic;
    }
    u {
      text-decoration: underline;
    }
    ul, ol {
      margin-top: 0.4em;
      margin-bottom: 0.9em;
      padding-left: 28px;
    }
    li {
      margin-bottom: 0.35em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2em 0;
      font-size: 10pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #334155;
    }
    tr:nth-child(even) td {
      background-color: #fafbfc;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1em auto;
      border-radius: 4px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    blockquote {
      margin: 1em 0;
      padding: 8px 16px;
      background-color: #f8fafc;
      border-left: 4px solid #2563eb;
      color: #475569;
      font-style: italic;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    code {
      font-family: Consolas, "Courier New", monospace;
      font-size: 9.5pt;
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 3px;
      color: #0f172a;
    }
    pre {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      overflow-x: auto;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    pre code {
      background: none;
      padding: 0;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 1.5em 0;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates file buffer signatures
 */
export function validateWordSignature(buffer: Buffer, originalFilename: string): { isValid: boolean; format: 'DOCX' | 'DOC' | 'UNKNOWN' } {
  if (!buffer || buffer.length < 4) {
    return { isValid: false, format: 'UNKNOWN' };
  }

  // PK\x03\x04 (Zip archive -> DOCX)
  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b;
  // \xD0\xCF\x11\xE0 (Compound File Binary Format -> DOC)
  const isCfbf = buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0;
  // RTF check {\rtf
  const isRtf = buffer.length > 5 && buffer[0] === 0x7b && buffer[1] === 0x5c && buffer[2] === 0x72 && buffer[3] === 0x74 && buffer[4] === 0x66;

  const lowerName = (originalFilename || '').toLowerCase();

  if (isZip) {
    return { isValid: true, format: 'DOCX' };
  }
  if (isCfbf || isRtf || lowerName.endsWith('.doc')) {
    return { isValid: true, format: 'DOC' };
  }

  if (lowerName.endsWith('.docx')) {
    return { isValid: true, format: 'DOCX' };
  }

  return { isValid: false, format: 'UNKNOWN' };
}

/**
 * Converts DOCX or DOC buffer to clean HTML
 */
export async function wordBufferToHtml(buffer: Buffer, originalFilename: string): Promise<string> {
  const signature = validateWordSignature(buffer, originalFilename);

  // If file is DOCX or zip container
  if (signature.format === 'DOCX') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mammoth = require('mammoth');
    
    const options = {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Title'] => h1.title:fresh",
        "p[style-name='Subtitle'] => p.subtitle:fresh",
      ],
      convertImage: mammoth.images.imgElement((image: any) => {
        return image.read('base64').then((imageBuffer: string) => {
          return {
            src: `data:${image.contentType};base64,${imageBuffer}`,
          };
        });
      }),
    };

    const result = await mammoth.convertToHtml({ buffer }, options);
    let html = result.value;
    if (!html || html.trim() === '') {
      html = '<p>El documento procesado no contiene texto visible.</p>';
    }
    return html;
  }

  // If binary DOC format (Word 97-2004 CFBF)
  if (signature.format === 'DOC') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const WordExtractor = require('word-extractor');
      const extractor = new WordExtractor();
      const extracted = await extractor.extract(buffer);
      const body = extracted.getBody();
      const headers = extracted.getHeaders();
      const footers = extracted.getFooters();

      let html = '';
      if (headers && headers.trim()) {
        html += `<header style="font-size: 9pt; color: #64748b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">${escapeHtml(headers.trim())}</header>`;
      }

      // Convert paragraphs
      const paragraphs = body.split(/\r?\n\r?\n/);
      for (const p of paragraphs) {
        const trimmed = p.trim();
        if (trimmed) {
          if (trimmed.length < 70 && !trimmed.endsWith('.') && (trimmed === trimmed.toUpperCase() || /^[0-9]+(\.[0-9]+)*\s+[A-Z]/.test(trimmed))) {
            html += `<h2>${escapeHtml(trimmed)}</h2>`;
          } else {
            html += `<p>${escapeHtml(trimmed).replace(/\r?\n/g, '<br/>')}</p>`;
          }
        }
      }

      if (footers && footers.trim()) {
        html += `<footer style="font-size: 9pt; color: #64748b; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 4px;">${escapeHtml(footers.trim())}</footer>`;
      }

      if (!html || html.trim() === '') {
        html = '<p>Documento Word procesado con éxito.</p>';
      }
      return html;
    } catch (docErr) {
      console.warn('WordExtractor error, falling back to text extraction:', docErr);
      const text = buffer.toString('utf-8').replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' ');
      const cleanLines = text.split(/\r?\n/).filter((l) => l.trim().length > 4);
      return cleanLines.map((l) => `<p>${escapeHtml(l.trim())}</p>`).join('');
    }
  }

  return `<p>Contenido del archivo: ${escapeHtml(originalFilename)}</p>`;
}

/**
 * Converts formatted HTML to PDF using headless Chrome / Edge if available on system
 */
async function htmlToPdfWithBrowser(
  browserPath: string,
  html: string,
  title: string,
  settings: PageSettings
): Promise<{ pdfBuffer: Buffer; pageCount: number }> {
  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  const htmlPath = path.join(tempDir, `doc_${timestamp}_${randomStr}.html`);
  const pdfPath = path.join(tempDir, `doc_${timestamp}_${randomStr}.pdf`);

  const fullHtml = wrapInPrintTemplate(html, title, settings);
  await fs.promises.writeFile(htmlPath, fullHtml, 'utf8');

  try {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      htmlPath,
    ];

    await execFileAsync(browserPath, args, { timeout: 35000 });

    if (!fs.existsSync(pdfPath)) {
      throw new Error('El motor de conversión no generó el archivo PDF esperado.');
    }

    const pdfBuffer = await fs.promises.readFile(pdfPath);

    let pageCount = 1;
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      pageCount = pdfDoc.getPageCount();
    } catch (countErr) {
      console.warn('Could not read page count from PDFDocument:', countErr);
    }

    return { pdfBuffer, pageCount };
  } finally {
    try {
      if (fs.existsSync(htmlPath)) await fs.promises.unlink(htmlPath);
      if (fs.existsSync(pdfPath)) await fs.promises.unlink(pdfPath);
    } catch (cleanupErr) {
      console.error('Error limpiando archivos temporales:', cleanupErr);
    }
  }
}

/**
 * Pure Node.js / Serverless PDF renderer using pdf-lib.
 * Does not require Chromium, Chrome, Edge, or external browser binaries.
 * Guaranteed 100% reliable on Vercel, AWS Lambda, Docker, Linux, Windows, and macOS.
 */
export async function htmlToPdfPureNode(
  html: string,
  title: string,
  settings: PageSettings = { pageSize: 'A4', orientation: 'portrait' }
): Promise<{ pdfBuffer: Buffer; pageCount: number }> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const isLandscape = settings.orientation === 'landscape';
  let pageWidth = settings.pageSize === 'Letter' ? 612 : 595.28;
  let pageHeight = settings.pageSize === 'Letter' ? 792 : 841.89;

  if (isLandscape) {
    const temp = pageWidth;
    pageWidth = pageHeight;
    pageHeight = temp;
  }

  const marginX = 54;
  const marginTop = 54;
  const marginBottom = 54;
  const contentWidth = pageWidth - marginX * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - marginTop;

  function checkPageBreak(neededHeight: number) {
    if (currentY - neededHeight < marginBottom) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - marginTop;
      return true;
    }
    return false;
  }

  function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (!word) continue;
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      try {
        const testWidth = font.widthOfTextAtSize(testLine, size);
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      } catch (e) {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  const cleanHtml = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'");

  interface ParsedBlock {
    type: string;
    text?: string;
    mime?: string;
    base64?: string;
  }

  const rawBlocks: ParsedBlock[] = [];
  const tagRegex = /<(\/?)(h[1-6]|p|li|table|tr|td|th|img|hr)([^>]*)>|([^<]+)/gi;
  let currentTag = 'p';
  let tagMatch: RegExpExecArray | null;

  while ((tagMatch = tagRegex.exec(cleanHtml)) !== null) {
    const [, isClose, tagName, attrs, text] = tagMatch;
    if (text) {
      const trimmed = text.trim();
      if (trimmed) {
        rawBlocks.push({ type: currentTag, text: trimmed });
      }
    } else if (tagName) {
      if (!isClose) {
        currentTag = tagName.toLowerCase();
        if (currentTag === 'img') {
          const srcMatch = attrs.match(/src="data:image\/(png|jpeg|jpg);base64,([^"]+)"/i);
          if (srcMatch) {
            rawBlocks.push({ type: 'img', mime: srcMatch[1].toLowerCase(), base64: srcMatch[2] });
          }
        } else if (currentTag === 'hr') {
          rawBlocks.push({ type: 'hr' });
        }
      } else {
        currentTag = 'p';
      }
    }
  }

  if (rawBlocks.length === 0) {
    const plainLines = cleanHtml.replace(/<[^>]+>/g, '').split(/\r?\n/).filter((l) => l.trim());
    plainLines.forEach((line) => rawBlocks.push({ type: 'p', text: line.trim() }));
  }

  for (const block of rawBlocks) {
    if (block.type === 'hr') {
      checkPageBreak(20);
      currentY -= 10;
      currentPage.drawLine({
        start: { x: marginX, y: currentY },
        end: { x: pageWidth - marginX, y: currentY },
        thickness: 0.75,
        color: rgb(0.85, 0.88, 0.92),
      });
      currentY -= 10;
      continue;
    }

    if (block.type === 'img' && block.base64) {
      try {
        const imgBuffer = Buffer.from(block.base64, 'base64');
        const embeddedImg =
          block.mime === 'png'
            ? await pdfDoc.embedPng(imgBuffer)
            : await pdfDoc.embedJpg(imgBuffer);

        const imgDim = embeddedImg.scale(1.0);
        let scale = 1.0;
        if (imgDim.width > contentWidth) {
          scale = contentWidth / imgDim.width;
        }
        const imgW = imgDim.width * scale;
        const imgH = Math.min(imgDim.height * scale, pageHeight - marginTop - marginBottom);

        checkPageBreak(imgH + 16);
        currentY -= imgH;
        currentPage.drawImage(embeddedImg, {
          x: marginX + (contentWidth - imgW) / 2,
          y: currentY,
          width: imgW,
          height: imgH,
        });
        currentY -= 12;
      } catch (imgErr) {
        console.warn('Failed to embed image in pdf-lib:', imgErr);
      }
      continue;
    }

    if (!block.text) continue;

    let fontSize = 10.5;
    let lineHeight = 15;
    let font = fontRegular;
    let textColor = rgb(0.12, 0.16, 0.22);
    let extraSpacing = 8;
    let indentX = 0;

    if (block.type === 'h1') {
      fontSize = 18;
      lineHeight = 22;
      font = fontBold;
      textColor = rgb(0.09, 0.12, 0.18);
      extraSpacing = 14;
    } else if (block.type === 'h2') {
      fontSize = 14;
      lineHeight = 18;
      font = fontBold;
      textColor = rgb(0.12, 0.16, 0.22);
      extraSpacing = 10;
    } else if (block.type === 'h3') {
      fontSize = 12;
      lineHeight = 16;
      font = fontBold;
      textColor = rgb(0.15, 0.2, 0.28);
      extraSpacing = 8;
    } else if (block.type === 'li') {
      indentX = 14;
    }

    const effectiveWidth = contentWidth - indentX;
    const lines = wrapText(block.text, font, fontSize, effectiveWidth);

    checkPageBreak(lines.length * lineHeight + extraSpacing);

    if (block.type === 'li') {
      currentPage.drawText('•', {
        x: marginX,
        y: currentY - fontSize,
        size: fontSize,
        font: fontBold,
        color: textColor,
      });
    }

    for (const line of lines) {
      checkPageBreak(lineHeight);
      try {
        currentPage.drawText(line, {
          x: marginX + indentX,
          y: currentY - fontSize,
          size: fontSize,
          font,
          color: textColor,
        });
      } catch (drawErr) {
        const safeText = line.replace(/[^\x00-\xFF]/g, '?');
        currentPage.drawText(safeText, {
          x: marginX + indentX,
          y: currentY - fontSize,
          size: fontSize,
          font,
          color: textColor,
        });
      }
      currentY -= lineHeight;
    }
    currentY -= extraSpacing;
  }

  // Draw Page Numbers at Bottom
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const p = pdfDoc.getPage(i);
    const pageNumText = `${i + 1} / ${totalPages}`;
    const pageNumWidth = fontRegular.widthOfTextAtSize(pageNumText, 8.5);
    p.drawText(pageNumText, {
      x: (pageWidth - pageNumWidth) / 2,
      y: marginBottom / 2,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.62),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return {
    pdfBuffer: Buffer.from(pdfBytes),
    pageCount: totalPages,
  };
}

/**
 * Converts formatted HTML to high-quality PDF using Microsoft Edge / Chrome headless
 * or seamlessly falls back to pure Node.js (pdf-lib) engine when no browser is available (e.g. Vercel serverless)
 */
export async function htmlToPdf(
  html: string,
  title: string,
  settings: PageSettings = { pageSize: 'A4', orientation: 'portrait' }
): Promise<{ pdfBuffer: Buffer; pageCount: number }> {
  const browserPath = findBrowserExecutable();
  
  // If Chrome or Edge is available on host system, use headless browser printing
  if (browserPath) {
    try {
      return await htmlToPdfWithBrowser(browserPath, html, title, settings);
    } catch (browserErr) {
      console.warn('Headless browser conversion failed, falling back to pure Node.js engine:', browserErr);
    }
  }

  // Serverless Pure Node.js Engine (100% reliable on Vercel / Linux Lambda)
  return await htmlToPdfPureNode(html, title, settings);
}

export interface PdfInfoResult {
  fileSize: number;
  pageCount: number;
  isEncrypted: boolean;
  hasDigitalSignature: boolean;
  error?: string;
}

/**
 * Fast inspection of PDF metadata, page count, and encryption
 */
export async function getPdfInfoFromFile(filePath: string, password?: string): Promise<PdfInfoResult> {
  const pythonScript = path.join(process.cwd(), 'scripts', 'pdf_tools.py');
  const args = ['info', filePath];
  if (password) args.push(password);

  const { stdout } = await execFileAsync('python', [pythonScript, ...args]);
  const match = stdout.match(/INFO_JSON:(.+)/);
  if (!match) {
    throw new Error('Error al inspeccionar el archivo PDF.');
  }
  return JSON.parse(match[1]);
}

/**
 * Compresses an arbitrary PDF file with advanced options
 */
export async function compressPdfFile(
  inputPath: string,
  originalFilename: string,
  options: CompressOptions
): Promise<CompressResult> {
  if (!fs.existsSync(inputPath)) {
    throw new Error('Archivo de entrada no encontrado.');
  }

  const tempDir = os.tmpdir();
  const fileHash = crypto.randomBytes(8).toString('hex');
  const compressedId = `comp_${fileHash}`;
  const originalId = `orig_${fileHash}`;
  const compressedPath = path.join(tempDir, `compressed_${compressedId}.pdf`);

  // Cache original for inline preview / comparison
  const origStats = fs.statSync(inputPath);
  registerCachedFile({
    id: originalId,
    originalName: originalFilename,
    pdfName: sanitizePdfFilename(originalFilename),
    pdfPath: inputPath,
    originalSize: origStats.size,
    pdfSize: origStats.size,
    pageCount: 0,
    createdAt: Date.now(),
  });

  const pythonScript = path.join(process.cwd(), 'scripts', 'pdf_tools.py');
  const optsJson = JSON.stringify(options);

  const { stdout, stderr } = await execFileAsync('python', [
    pythonScript,
    'compress_advanced',
    inputPath,
    compressedPath,
    optsJson,
  ]);

  const match = stdout.match(/RESULT_JSON:(.+)/);
  if (!match) {
    if (stdout.includes('FILE_IS_ENCRYPTED') || stderr.includes('ENCRYPTED')) {
      const err = new Error('PASSWORD_REQUIRED');
      (err as any).isEncrypted = true;
      throw err;
    }
    if (stdout.includes('INVALID_PASSWORD') || stderr.includes('INVALID_PASSWORD')) {
      const err = new Error('INVALID_PASSWORD');
      (err as any).isEncrypted = true;
      throw err;
    }
    throw new Error('No se pudo procesar la compresión del documento.');
  }

  const resultData = JSON.parse(match[1]);
  if (resultData.status !== 'SUCCESS') {
    throw new Error(resultData.error || 'Error en la compresión del PDF.');
  }

  const originalSize = resultData.originalSize;
  const compressedSize = resultData.compressedSize;
  const reductionBytes = resultData.reductionBytes;
  const reductionPercent = resultData.reductionPercent;
  const pageCount = resultData.pageCount;

  const baseName = originalFilename.replace(/\.pdf$/i, '');
  const compressedName = `${baseName}-comprimido.pdf`;

  registerCachedFile({
    id: compressedId,
    originalName: originalFilename,
    pdfName: compressedName,
    pdfPath: compressedPath,
    originalSize,
    pdfSize: compressedSize,
    pageCount,
    createdAt: Date.now(),
  });

  let message = '';
  if (reductionPercent < 1) {
    message = 'El documento ya cuenta con un tamaño óptimo. Se mantuvieron las fuentes e imágenes intactas.';
  } else {
    message = `Se redujo el tamaño en un ${reductionPercent}% (${(reductionBytes / 1024).toFixed(1)} KB ahorrados).`;
  }

  return {
    success: true,
    fileId: compressedId,
    originalName: originalFilename,
    compressedName,
    originalSize,
    compressedSize,
    reductionBytes,
    reductionPercent,
    downloadUrl: `/api/download?id=${compressedId}`,
    previewUrl: `/api/download?id=${compressedId}&inline=true`,
    originalPreviewUrl: `/api/download?id=${originalId}&inline=true`,
    pageCount,
    targetSizeAchieved: resultData.targetSizeAchieved,
    targetSizeKb: resultData.targetSizeKb,
    isEncrypted: resultData.isEncrypted,
    hasDigitalSignature: resultData.hasDigitalSignature,
    mode: resultData.mode,
    message,
  };
}

/**
 * Compresses an existing cached PDF (backward compatibility for CompressPdfModal)
 */
export async function compressPdf(
  fileId: string,
  levelOrOptions: 'low' | 'medium' | 'high' | CompressOptions = 'medium'
): Promise<CompressResult> {
  const cached = getCachedFile(fileId);
  if (!cached || !fs.existsSync(cached.pdfPath)) {
    throw new Error('Archivo no encontrado o expirado.');
  }

  let options: CompressOptions;
  if (typeof levelOrOptions === 'string') {
    const modeMap: Record<string, 'basic' | 'recommended' | 'extreme'> = {
      low: 'basic',
      medium: 'recommended',
      high: 'extreme',
    };
    options = { mode: modeMap[levelOrOptions] || 'recommended' };
  } else {
    options = levelOrOptions;
  }

  return compressPdfFile(cached.pdfPath, cached.pdfName, options);
}

/**
 * Encrypts an existing PDF with user password using pypdf
 */
export async function protectPdf(fileId: string, password: string): Promise<ProtectResult> {
  const cached = getCachedFile(fileId);
  if (!cached || !fs.existsSync(cached.pdfPath)) {
    throw new Error('Archivo no encontrado o expirado.');
  }

  if (!password || password.trim().length < 3) {
    throw new Error('La contraseña debe tener al menos 3 caracteres.');
  }

  const tempDir = os.tmpdir();
  const protectedId = `${cached.id}_prot`;
  const protectedPath = path.join(tempDir, `protected_${protectedId}.pdf`);

  const pythonScript = path.join(process.cwd(), 'scripts', 'pdf_tools.py');

  try {
    await execFileAsync('python', [
      pythonScript,
      'encrypt',
      cached.pdfPath,
      protectedPath,
      password,
    ]);

    if (!fs.existsSync(protectedPath)) {
      throw new Error('No se pudo generar el archivo PDF protegido.');
    }

    const protectedSize = fs.statSync(protectedPath).size;
    const protectedName = cached.pdfName.replace(/\.pdf$/i, '_protegido.pdf');

    registerCachedFile({
      id: protectedId,
      originalName: cached.originalName,
      pdfName: protectedName,
      pdfPath: protectedPath,
      originalSize: cached.originalSize,
      pdfSize: protectedSize,
      pageCount: cached.pageCount,
      createdAt: Date.now(),
    });

    return {
      success: true,
      fileId: cached.id,
      protectedId,
      downloadUrl: `/api/download?id=${protectedId}`,
    };
  } catch (err: any) {
    console.error('Error encrypting PDF:', err);
    throw new Error(err.message || 'Error al proteger el documento con contraseña.');
  }
}

/**
 * Reorders, rotates, and deletes pages in an existing PDF using pdf-lib
 */
export async function reorganizePdfPages(req: PageOperationRequest): Promise<{
  id: string;
  pdfName: string;
  pageCount: number;
  newSize: number;
  downloadUrl: string;
  previewUrl: string;
}> {
  const cached = getCachedFile(req.fileId);
  if (!cached || !fs.existsSync(cached.pdfPath)) {
    throw new Error('Archivo no encontrado o expirado.');
  }

  const originalBuffer = await fs.promises.readFile(cached.pdfPath);
  const pdfDoc = await PDFDocument.load(originalBuffer);
  const totalPages = pdfDoc.getPageCount();

  // Create new document
  const newDoc = await PDFDocument.create();

  // Determine order of pages
  let order = req.pageOrder && req.pageOrder.length > 0 ? req.pageOrder : Array.from({ length: totalPages }, (_, i) => i);
  const deletedSet = new Set(req.deletedPages || []);

  const pagesToInclude = order.filter((idx) => idx >= 0 && idx < totalPages && !deletedSet.has(idx));

  if (pagesToInclude.length === 0) {
    throw new Error('No puedes eliminar todas las páginas del documento. Debe quedar al menos una página.');
  }

  // Copy pages and apply rotations
  for (const pageIndex of pagesToInclude) {
    const [copiedPage] = await newDoc.copyPages(pdfDoc, [pageIndex]);
    const currentAngle = copiedPage.getRotation().angle;
    const addAngle = (req.rotations && req.rotations[pageIndex]) || 0;
    copiedPage.setRotation(degrees((currentAngle + addAngle) % 360));
    newDoc.addPage(copiedPage);
  }

  const modifiedBytes = await newDoc.save();
  const modifiedId = `${cached.id}_mod_${Date.now()}`;
  const tempDir = os.tmpdir();
  const modifiedPath = path.join(tempDir, `modified_${modifiedId}.pdf`);

  await fs.promises.writeFile(modifiedPath, Buffer.from(modifiedBytes));

  const modifiedName = cached.pdfName.replace(/\.pdf$/i, '_editado.pdf');

  registerCachedFile({
    id: modifiedId,
    originalName: cached.originalName,
    pdfName: modifiedName,
    pdfPath: modifiedPath,
    originalSize: cached.originalSize,
    pdfSize: modifiedBytes.length,
    pageCount: newDoc.getPageCount(),
    createdAt: Date.now(),
  });

  return {
    id: modifiedId,
    pdfName: modifiedName,
    pageCount: newDoc.getPageCount(),
    newSize: modifiedBytes.length,
    downloadUrl: `/api/download?id=${modifiedId}`,
    previewUrl: `/api/download?id=${modifiedId}&inline=true`,
  };
}

/**
 * Creates a valid ZIP archive containing multiple converted PDFs
 */
export async function createBatchZip(items: Array<{ fileId: string; customName?: string }>): Promise<Buffer> {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const item of items) {
    const cached = getCachedFile(item.fileId);
    if (!cached || !fs.existsSync(cached.pdfPath)) {
      continue;
    }

    const fileBuffer = await fs.promises.readFile(cached.pdfPath);

    // Pick desired name or fall back to cached pdfName
    let targetName = item.customName ? sanitizePdfFilename(item.customName) : cached.pdfName;

    // Handle duplicates safely (e.g. document.pdf, document (1).pdf)
    if (usedNames.has(targetName.toLowerCase())) {
      const base = targetName.replace(/\.pdf$/i, '');
      let counter = 1;
      while (usedNames.has(`${base}_${counter}.pdf`.toLowerCase())) {
        counter++;
      }
      targetName = `${base}_${counter}.pdf`;
    }

    usedNames.add(targetName.toLowerCase());
    zip.file(targetName, fileBuffer);
  }

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return zipBuffer;
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { promisify } from 'util';
import { execFile } from 'child_process';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { registerCachedFile } from '@/lib/converter';
import { sanitizeFilename, PAGE_SIZES, MARGIN_VALUES, hexToRgb01 } from '@/lib/jpgToPdfConverter';

const execFileAsync = promisify(execFile);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;

    const allFiles: File[] = [];
    if (files && files.length > 0) {
      allFiles.push(...files);
    } else if (singleFile) {
      allFiles.push(singleFile);
    }

    if (allFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se enviaron imágenes para convertir. Sube al menos un archivo JPG o PNG.' },
        { status: 400 }
      );
    }

    // Parse options
    const settingsRaw = formData.get('settings') as string | null;
    let settings: any = {};
    if (settingsRaw) {
      try {
        settings = JSON.parse(settingsRaw);
      } catch {}
    }

    const pageSize = settings.pageSize || (formData.get('pageSize') as string) || 'a4';
    const orientation = settings.orientation || (formData.get('orientation') as string) || 'auto';
    const margin = settings.margin || (formData.get('margin') as string) || 'small';
    const customMargin = Number(settings.customMargin || formData.get('customMargin') || 0);
    const customWidth = Number(settings.customWidth || 595.28);
    const customHeight = Number(settings.customHeight || 841.89);
    const imagePosition = settings.imagePosition || 'center';
    const imageScaling = settings.imageScaling || 'fit';
    const customFilename = settings.filename || (formData.get('filename') as string) || 'imagenes-convertidas.pdf';
    const password = settings.password || (formData.get('password') as string) || '';
    const title = settings.title || '';
    const author = settings.author || '';
    const subject = settings.subject || '';
    const pageNumbering = settings.pageNumbering || 'none';
    const backgroundColor = settings.backgroundColor || '#ffffff';

    const pdfDoc = await PDFDocument.create();
    if (title) pdfDoc.setTitle(title);
    if (author) pdfDoc.setAuthor(author);
    if (subject) pdfDoc.setSubject(subject);
    pdfDoc.setProducer('Convertir JPG a PDF Online');
    pdfDoc.setCreator('Plataforma Documental');

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bgRgb = hexToRgb01(backgroundColor);

    let marginPt = 0;
    if (margin === 'small') marginPt = MARGIN_VALUES.small;
    else if (margin === 'medium') marginPt = MARGIN_VALUES.medium;
    else if (margin === 'custom') marginPt = Math.max(0, customMargin);

    const totalPages = allFiles.length;

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      const arrayBuf = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);

      if (bytes.length === 0) continue;

      // Detect format
      let isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
      let isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e;

      let embeddedImg;
      if (isPng) {
        embeddedImg = await pdfDoc.embedPng(bytes);
      } else if (isJpeg) {
        embeddedImg = await pdfDoc.embedJpg(bytes);
      } else {
        // Try embedding as jpg then png
        try {
          embeddedImg = await pdfDoc.embedJpg(bytes);
        } catch {
          embeddedImg = await pdfDoc.embedPng(bytes);
        }
      }

      const imgWidth = embeddedImg.width;
      const imgHeight = embeddedImg.height;

      // Determine page dimensions
      let pWidth: number;
      let pHeight: number;

      if (pageSize === 'fit-image') {
        pWidth = imgWidth + 2 * marginPt;
        pHeight = imgHeight + 2 * marginPt;
      } else if (pageSize === 'custom') {
        pWidth = Math.max(72, customWidth);
        pHeight = Math.max(72, customHeight);
      } else {
        const std = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES] || PAGE_SIZES.a4;
        let isLand = false;
        if (orientation === 'auto') {
          isLand = imgWidth > imgHeight;
        } else if (orientation === 'landscape') {
          isLand = true;
        }

        if (isLand) {
          pWidth = Math.max(std.width, std.height);
          pHeight = Math.min(std.width, std.height);
        } else {
          pWidth = Math.min(std.width, std.height);
          pHeight = Math.max(std.width, std.height);
        }
      }

      const page = pdfDoc.addPage([pWidth, pHeight]);

      // Background
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pWidth,
        height: pHeight,
        color: rgb(bgRgb.r, bgRgb.g, bgRgb.b),
      });

      const usableW = Math.max(10, pWidth - 2 * marginPt);
      const usableH = Math.max(10, pHeight - 2 * marginPt);

      let targetW = imgWidth;
      let targetH = imgHeight;

      if (imageScaling === 'fit') {
        const scale = Math.min(usableW / imgWidth, usableH / imgHeight);
        targetW = imgWidth * scale;
        targetH = imgHeight * scale;
      } else if (imageScaling === 'fill') {
        const scale = Math.max(usableW / imgWidth, usableH / imgHeight);
        targetW = imgWidth * scale;
        targetH = imgHeight * scale;
      } else if (imageScaling === 'original') {
        if (imgWidth > usableW || imgHeight > usableH) {
          const scale = Math.min(usableW / imgWidth, usableH / imgHeight);
          targetW = imgWidth * scale;
          targetH = imgHeight * scale;
        }
      }

      let posX = marginPt;
      let posY = marginPt;

      if (imagePosition === 'center' || imagePosition === 'top' || imagePosition === 'bottom') {
        posX = marginPt + (usableW - targetW) / 2;
      } else if (imagePosition === 'right') {
        posX = marginPt + (usableW - targetW);
      }

      if (imagePosition === 'center' || imagePosition === 'left' || imagePosition === 'right') {
        posY = marginPt + (usableH - targetH) / 2;
      } else if (imagePosition === 'top') {
        posY = marginPt + (usableH - targetH);
      }

      page.drawImage(embeddedImg, {
        x: posX,
        y: posY,
        width: targetW,
        height: targetH,
      });

      if (pageNumbering !== 'none') {
        const numText = `${i + 1} / ${totalPages}`;
        const fontSize = 9;
        const textWidth = helvetica.widthOfTextAtSize(numText, fontSize);
        let numX = marginPt + (usableW - textWidth) / 2;
        const numY = Math.max(6, marginPt / 2);

        if (pageNumbering === 'bottom-right') {
          numX = pWidth - marginPt - textWidth;
        } else if (pageNumbering === 'bottom-left') {
          numX = marginPt;
        }

        page.drawText(numText, {
          x: numX,
          y: numY,
          size: fontSize,
          font: helvetica,
          color: rgb(0.4, 0.45, 0.5),
        });
      }
    }

    let finalPdfBytes = await pdfDoc.save();

    // Temp file handling
    const tempDir = os.tmpdir();
    const fileId = crypto.randomUUID();
    const safeName = sanitizeFilename(customFilename, 'imagenes-convertidas.pdf');
    const outPdfPath = path.join(tempDir, `jpg2pdf_${fileId}.pdf`);

    await fs.promises.writeFile(outPdfPath, finalPdfBytes);

    // If password encryption requested
    if (password && password.trim().length >= 3) {
      const pythonScript = path.join(process.cwd(), 'scripts', 'pdf_tools.py');
      const encPdfPath = path.join(tempDir, `enc_jpg2pdf_${fileId}.pdf`);

      await execFileAsync('python', [
        pythonScript,
        'encrypt',
        outPdfPath,
        encPdfPath,
        password.trim(),
      ]);

      if (fs.existsSync(encPdfPath)) {
        await fs.promises.unlink(outPdfPath);
        await fs.promises.rename(encPdfPath, outPdfPath);
        finalPdfBytes = await fs.promises.readFile(outPdfPath);
      }
    }

    const finalSize = fs.statSync(outPdfPath).size;

    registerCachedFile({
      id: fileId,
      originalName: allFiles[0].name,
      pdfName: safeName,
      pdfPath: outPdfPath,
      originalSize: allFiles.reduce((acc, f) => acc + f.size, 0),
      pdfSize: finalSize,
      pageCount: totalPages,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      id: fileId,
      filename: safeName,
      downloadUrl: `/api/download?id=${fileId}`,
      originalSize: allFiles.reduce((acc, f) => acc + f.size, 0),
      pdfSize: finalSize,
      pageCount: totalPages,
      processingTimeMs: Date.now() - startTime,
    });
  } catch (err: any) {
    console.error('JPG to PDF Convert Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error durante la conversión de JPG a PDF.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { wordBufferToHtml, htmlToPdf, registerCachedFile, validateWordSignature } from '@/lib/converter';
import { getPdfFilename, sanitizePdfFilename } from '@/lib/formatters';
import { PageSettings } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customNameRaw = (formData.get('customName') as string) || '';
    const pageSize = ((formData.get('pageSize') as string) || 'A4') as 'A4' | 'Letter';
    const orientation = ((formData.get('orientation') as string) || 'portrait') as 'portrait' | 'landscape';

    const pageSettings: PageSettings = {
      pageSize: pageSize === 'Letter' ? 'Letter' : 'A4',
      orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
    };

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se ha enviado ningún archivo. Por favor, selecciona un documento Word.' },
        { status: 400 }
      );
    }

    const originalName = file.name || 'documento.docx';
    const lowerName = originalName.toLowerCase();
    const isDocx = lowerName.endsWith('.docx');
    const isDoc = lowerName.endsWith('.doc');

    if (!isDocx && !isDoc) {
      return NextResponse.json(
        {
          success: false,
          error: 'Formato no compatible. Por favor sube únicamente archivos con extensión .doc o .docx.',
        },
        { status: 400 }
      );
    }

    // Maximum file size: 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'El archivo excede el tamaño máximo permitido de 50 MB.',
        },
        { status: 400 }
      );
    }

    // Convert file to Node buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El archivo subido está vacío.' },
        { status: 400 }
      );
    }

    // Validate signature
    const signature = validateWordSignature(buffer, originalName);
    if (!signature.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'El archivo no tiene una estructura de documento Word válida.',
        },
        { status: 400 }
      );
    }

    // Determine target PDF name
    let pdfName = customNameRaw ? sanitizePdfFilename(customNameRaw) : getPdfFilename(originalName);

    // Step 1: Convert Word buffer to semantic HTML
    const html = await wordBufferToHtml(buffer, originalName);

    // Step 2: Convert semantic HTML to high-fidelity PDF with page settings
    const { pdfBuffer, pageCount } = await htmlToPdf(html, pdfName, pageSettings);

    // Step 3: Cache the PDF temporarily on disk
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const tempDir = os.tmpdir();
    const storagePath = path.join(tempDir, `converted_${id}.pdf`);
    await fs.promises.writeFile(storagePath, pdfBuffer);

    registerCachedFile({
      id,
      originalName,
      pdfName,
      pdfPath: storagePath,
      originalSize: file.size,
      pdfSize: pdfBuffer.length,
      pageCount,
      createdAt: Date.now(),
    });

    const conversionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      id,
      originalName,
      convertedName: pdfName,
      originalSize: file.size,
      pdfSize: pdfBuffer.length,
      pageCount,
      downloadUrl: `/api/download?id=${id}&name=${encodeURIComponent(pdfName)}`,
      previewUrl: `/api/download?id=${id}&inline=true`,
      conversionTimeMs,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Ocurrió un error inesperado al procesar y convertir el archivo.',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { compressPdf, compressPdfFile, getPdfInfoFromFile } from '@/lib/converter';
import { CompressOptions } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // If multipart/form-data (direct file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const action = formData.get('action') as string | null;
      const password = (formData.get('password') as string) || undefined;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No se envió ningún archivo para comprimir.' },
          { status: 400 }
        );
      }

      // Validate MIME / extension
      const fileName = file.name || 'documento.pdf';
      if (!fileName.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        return NextResponse.json(
          { success: false, error: 'Formato de archivo inválido. Por favor, selecciona un documento PDF.' },
          { status: 400 }
        );
      }

      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'El archivo excede el tamaño máximo permitido de 100 MB.' },
          { status: 400 }
        );
      }

      // Write uploaded file buffer to temp file
      const tempDir = os.tmpdir();
      const tempId = `upload_${crypto.randomBytes(8).toString('hex')}`;
      const tempPath = path.join(tempDir, `${tempId}.pdf`);
      const fileBytes = Buffer.from(await file.arrayBuffer());
      await fs.promises.writeFile(tempPath, fileBytes);

      // Fast info pre-check if requested
      if (action === 'info') {
        try {
          const info = await getPdfInfoFromFile(tempPath, password);
          return NextResponse.json({ success: true, ...info });
        } catch (err: any) {
          return NextResponse.json({ success: false, error: err.message }, { status: 400 });
        }
      }

      // Build options
      const mode = (formData.get('mode') as 'basic' | 'recommended' | 'extreme') || 'recommended';
      const targetSizeKbRaw = formData.get('targetSizeKb');
      const targetSizeKb = targetSizeKbRaw ? parseInt(targetSizeKbRaw.toString(), 10) : undefined;
      const qualityRaw = formData.get('quality');
      const quality = qualityRaw ? parseInt(qualityRaw.toString(), 10) : undefined;
      const dpiRaw = formData.get('dpi');
      const dpi = dpiRaw ? (parseInt(dpiRaw.toString(), 10) as any) : undefined;
      const grayscale = formData.get('grayscale') === 'true';
      const removeMetadata = formData.get('removeMetadata') === 'true';
      const removeThumbnails = formData.get('removeThumbnails') !== 'false';
      const optimizeStreams = formData.get('optimizeStreams') !== 'false';

      const options: CompressOptions = {
        mode,
        targetSizeKb,
        quality,
        dpi,
        grayscale,
        removeMetadata,
        removeThumbnails,
        optimizeStreams,
        password,
      };

      try {
        const result = await compressPdfFile(tempPath, fileName, options);
        return NextResponse.json(result);
      } catch (err: any) {
        if (err.message === 'PASSWORD_REQUIRED' || err.isEncrypted) {
          return NextResponse.json(
            { success: false, isEncrypted: true, error: 'El archivo PDF está protegido con contraseña.' },
            { status: 401 }
          );
        }
        if (err.message === 'INVALID_PASSWORD') {
          return NextResponse.json(
            { success: false, isEncrypted: true, error: 'La contraseña ingresada es incorrecta.' },
            { status: 401 }
          );
        }
        throw err;
      }
    }

    // Otherwise JSON body (existing cached fileId support)
    const body = await request.json();
    const { fileId, level, mode, options, password } = body;

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'Identificador de archivo no proporcionado.' },
        { status: 400 }
      );
    }

    // Merge options
    let compressOptions: CompressOptions;
    if (options && typeof options === 'object') {
      compressOptions = { ...options, password: password || options.password };
    } else if (mode) {
      compressOptions = { mode, password };
    } else {
      const modeMap: Record<string, 'basic' | 'recommended' | 'extreme'> = {
        low: 'basic',
        medium: 'recommended',
        high: 'extreme',
      };
      compressOptions = { mode: modeMap[level || 'medium'] || 'recommended', password };
    }

    const result = await compressPdf(fileId, compressOptions);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Compress API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al comprimir el archivo PDF.' },
      { status: 500 }
    );
  }
}

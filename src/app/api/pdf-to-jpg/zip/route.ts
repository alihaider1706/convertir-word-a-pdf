import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { sanitizeZipFilename } from '@/lib/formatters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const zipNameRaw = (formData.get('zipName') as string) || 'imagenes-convertidas.zip';
    const zipName = sanitizeZipFilename(zipNameRaw);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se enviaron imágenes para empaquetar.' },
        { status: 400 }
      );
    }

    const zip = new JSZip();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = await file.arrayBuffer();
      const filename = file.name || `pagina-${i + 1}.jpg`;
      zip.file(filename, buffer);
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error al generar archivo ZIP.' },
      { status: 500 }
    );
  }
}

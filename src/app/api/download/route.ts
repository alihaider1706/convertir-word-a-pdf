import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getCachedFile, updateCachedFileName } from '@/lib/converter';
import { sanitizePdfFilename } from '@/lib/formatters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const inline = searchParams.get('inline') === 'true';
  const customNameParam = searchParams.get('name');

  if (!id) {
    return new NextResponse('Identificador de archivo no proporcionado.', { status: 400 });
  }

  const cached = getCachedFile(id);
  if (!cached || !fs.existsSync(cached.pdfPath)) {
    return new NextResponse(
      'El archivo solicitado ha expirado o no existe. Por favor, realiza la conversión nuevamente.',
      { status: 404 }
    );
  }

  // If client passed a custom filename, update the cache and use it
  let finalFilename = cached.pdfName;
  if (customNameParam) {
    finalFilename = sanitizePdfFilename(customNameParam);
    updateCachedFileName(id, finalFilename);
  }

  const fileBuffer = await fs.promises.readFile(cached.pdfPath);
  const dispositionType = inline ? 'inline' : 'attachment';
  const encodedFilename = encodeURIComponent(finalFilename);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${dispositionType}; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

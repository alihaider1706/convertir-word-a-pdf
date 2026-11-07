import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getCachedPptFile, updateCachedPptFileName } from '@/lib/pdfToPptConverter';
import { sanitizePptxFilename } from '@/lib/formatters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const customNameParam = searchParams.get('name');

  if (!id) {
    return new NextResponse('Identificador de archivo no proporcionado.', { status: 400 });
  }

  const cached = getCachedPptFile(id);
  if (!cached || !fs.existsSync(cached.pptxPath)) {
    return new NextResponse(
      'El archivo solicitado ha expirado o no existe en el servidor. Por favor realiza la conversión nuevamente.',
      { status: 404 }
    );
  }

  let finalFilename = cached.pptxName;
  if (customNameParam) {
    finalFilename = sanitizePptxFilename(customNameParam);
    updateCachedPptFileName(id, finalFilename);
  }

  const fileBuffer = await fs.promises.readFile(cached.pptxPath);
  const encodedFilename = encodeURIComponent(finalFilename);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

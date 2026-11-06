import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getCachedDocxFile, updateCachedDocxFileName } from '@/lib/pdfToWordConverter';
import { sanitizeDocxFilename } from '@/lib/formatters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const customNameParam = searchParams.get('name');

  if (!id) {
    return new NextResponse('Identificador de archivo no proporcionado.', { status: 400 });
  }

  const cached = getCachedDocxFile(id);
  if (!cached || !fs.existsSync(cached.docxPath)) {
    return new NextResponse(
      'El archivo solicitado ha expirado o no existe. Por favor realiza la conversión nuevamente.',
      { status: 404 }
    );
  }

  let finalFilename = cached.docxName;
  if (customNameParam) {
    finalFilename = sanitizeDocxFilename(customNameParam);
    updateCachedDocxFileName(id, finalFilename);
  }

  const fileBuffer = await fs.promises.readFile(cached.docxPath);
  const encodedFilename = encodeURIComponent(finalFilename);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

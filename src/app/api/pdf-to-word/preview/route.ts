import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getCachedDocxFile } from '@/lib/pdfToWordConverter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Identificador de archivo no proporcionado.', { status: 400 });
  }

  const cached = getCachedDocxFile(id);
  if (!cached || !cached.pdfPath || !fs.existsSync(cached.pdfPath)) {
    return new NextResponse(
      'La vista previa no está disponible o ha expirado.',
      { status: 404 }
    );
  }

  const pdfBuffer = await fs.promises.readFile(cached.pdfPath);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Content-Length': pdfBuffer.length.toString(),
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

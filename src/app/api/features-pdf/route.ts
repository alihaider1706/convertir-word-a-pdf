import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'Convertir_Word_a_PDF_Features_Document.pdf');

  if (!fs.existsSync(filePath)) {
    return new NextResponse('PDF document not found', { status: 404 });
  }

  const fileBuffer = await fs.promises.readFile(filePath);

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="Convertir_Word_a_PDF_Features_Document.pdf"',
      'Content-Length': fileBuffer.length.toString(),
    },
  });
}

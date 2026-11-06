import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se ha proporcionado ningún archivo PDF.' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Validate %PDF- signature
    if (bytes.length < 5) {
      return NextResponse.json(
        { success: false, error: 'El archivo está vacío o dañado.' },
        { status: 400 }
      );
    }

    const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
    if (header !== '%PDF-') {
      return NextResponse.json(
        { success: false, error: 'El archivo no tiene una cabecera PDF válida.' },
        { status: 400 }
      );
    }

    try {
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      const isEncrypted = pdfDoc.isEncrypted;

      return NextResponse.json({
        success: true,
        filename: file.name,
        fileSize: file.size,
        pageCount,
        isEncrypted,
      });
    } catch (parseErr: any) {
      return NextResponse.json(
        {
          success: false,
          error: parseErr.message || 'Error al analizar la estructura del documento PDF.',
        },
        { status: 422 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

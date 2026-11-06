import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { validatePdfSignature } from '@/lib/pdfToWordConverter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const password = (formData.get('password') as string) || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se envió ningún archivo PDF.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sig = validatePdfSignature(buffer);
    if (!sig.isValid) {
      return NextResponse.json({ success: false, error: 'Cabecera PDF no válida.' }, { status: 400 });
    }

    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: false });
    } catch (err: any) {
      const errMsg = err?.message?.toLowerCase() || '';
      if (errMsg.includes('encrypt') || errMsg.includes('password')) {
        return NextResponse.json(
          { success: false, isEncrypted: true, requiresPassword: true, error: 'Documento protegido con contraseña.' },
          { status: 423 }
        );
      }
      throw err;
    }

    const pageCount = pdfDoc.getPageCount();
    const pages = pdfDoc.getPages().map((p, idx) => {
      const { width, height } = p.getSize();
      const rot = p.getRotation().angle;
      return {
        index: idx,
        pageNumber: idx + 1,
        width,
        height,
        rotation: rot,
      };
    });

    return NextResponse.json({
      success: true,
      pageCount,
      pages,
    });
  } catch (error: any) {
    console.error('Error inspeccionando páginas del PDF:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al procesar las páginas del PDF.' },
      { status: 500 }
    );
  }
}

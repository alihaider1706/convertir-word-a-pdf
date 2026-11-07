import { NextRequest, NextResponse } from 'next/server';
import { createBatchPptxZip } from '@/lib/pdfToPptConverter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = body.items as Array<{ fileId: string; customName?: string }>;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se enviaron archivos válidos para comprimir en ZIP.' },
        { status: 400 }
      );
    }

    const zipBuffer = await createBatchPptxZip(items);

    if (!zipBuffer || zipBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron presentaciones PPTX disponibles para generar el ZIP.' },
        { status: 404 }
      );
    }

    const zipName = 'presentaciones_powerpoint_convertidas.zip';

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generando ZIP de presentaciones PowerPoint:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al generar el archivo ZIP.' },
      { status: 500 }
    );
  }
}

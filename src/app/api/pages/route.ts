import { NextRequest, NextResponse } from 'next/server';
import { reorganizePdfPages } from '@/lib/converter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, pageOrder, rotations, deletedPages } = body;

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'Identificador de archivo no proporcionado.' },
        { status: 400 }
      );
    }

    const result = await reorganizePdfPages({
      fileId,
      pageOrder,
      rotations,
      deletedPages,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Page management API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar la edición de páginas del PDF.' },
      { status: 500 }
    );
  }
}

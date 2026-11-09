import { NextRequest, NextResponse } from 'next/server';
import { compressPdf } from '@/lib/converter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, level = 'medium' } = body;

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'Identificador de archivo no proporcionado.' },
        { status: 400 }
      );
    }

    const result = await compressPdf(fileId, level);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Compress API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al comprimir el archivo PDF.' },
      { status: 500 }
    );
  }
}

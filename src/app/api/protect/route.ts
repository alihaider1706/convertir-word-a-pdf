import { NextRequest, NextResponse } from 'next/server';
import { protectPdf } from '@/lib/converter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, password, confirmPassword } = body;

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'Identificador de archivo no proporcionado.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 3 caracteres.' },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Las contraseñas no coinciden. Por favor verifícalas.' },
        { status: 400 }
      );
    }

    const result = await protectPdf(fileId, password.trim());
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Protect API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al proteger el archivo PDF con contraseña.' },
      { status: 500 }
    );
  }
}

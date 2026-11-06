import { NextRequest, NextResponse } from 'next/server';
import { convertPdfToDocx, validatePdfSignature } from '@/lib/pdfToWordConverter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customFilename = (formData.get('customFilename') as string) || '';
    const password = (formData.get('password') as string) || '';
    const rotationsRaw = formData.get('rotations') as string | null;
    const deletedPagesRaw = formData.get('deletedPages') as string | null;
    const pageOrderRaw = formData.get('pageOrder') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se ha subido ningún archivo. Por favor selecciona un documento PDF.' },
        { status: 400 }
      );
    }

    const originalFilename = file.name || 'documento.pdf';
    if (!originalFilename.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Formato no compatible. Únicamente se admiten archivos con extensión .pdf.' },
        { status: 400 }
      );
    }

    // Maximum file size: 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'El archivo excede el límite máximo permitido de 50 MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El archivo PDF proporcionado está vacío.' },
        { status: 400 }
      );
    }

    // Signature verification (%PDF-)
    const sig = validatePdfSignature(buffer);
    if (!sig.isValid) {
      return NextResponse.json(
        { success: false, error: 'El archivo no tiene una cabecera PDF válida o está dañado.' },
        { status: 400 }
      );
    }

    // Parse optional page modification parameters
    let rotations: Record<number, number> | undefined;
    if (rotationsRaw) {
      try {
        rotations = JSON.parse(rotationsRaw);
      } catch {}
    }

    let deletedPages: number[] | undefined;
    if (deletedPagesRaw) {
      try {
        deletedPages = JSON.parse(deletedPagesRaw);
      } catch {}
    }

    let pageOrder: number[] | undefined;
    if (pageOrderRaw) {
      try {
        pageOrder = JSON.parse(pageOrderRaw);
      } catch {}
    }

    // Convert PDF to genuine DOCX
    const result = await convertPdfToDocx({
      buffer,
      originalFilename,
      customFilename: customFilename.trim() || undefined,
      password: password.trim() || undefined,
      rotations,
      deletedPages,
      pageOrder,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error en conversión PDF a Word:', error);

    // Password required handling
    if (error?.code === 'PASSWORD_REQUIRED' || error?.message === 'DOCUMENT_IS_PASSWORD_PROTECTED') {
      return NextResponse.json(
        {
          success: false,
          code: 'PASSWORD_REQUIRED',
          isEncrypted: true,
          requiresPassword: true,
          error: 'El documento PDF está protegido con contraseña. Por favor ingresa la contraseña para continuar.',
        },
        { status: 423 } // Locked
      );
    }

    // Invalid password handling
    if (error?.code === 'INVALID_PASSWORD') {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_PASSWORD',
          isEncrypted: true,
          requiresPassword: true,
          error: 'La contraseña proporcionada es incorrecta o no permite la extracción del texto.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Ocurrió un error al convertir el PDF a Word. Por favor verifica el archivo.',
      },
      { status: 500 }
    );
  }
}

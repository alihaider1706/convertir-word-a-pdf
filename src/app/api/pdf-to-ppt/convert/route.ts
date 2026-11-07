import { NextRequest, NextResponse } from 'next/server';
import { convertPdfToPpt, validatePdfSignature } from '@/lib/pdfToPptConverter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customFilename = (formData.get('customFilename') as string) || '';
    const password = (formData.get('password') as string) || '';
    const mode = (formData.get('mode') as 'editable' | 'fidelity') || 'editable';
    const pageRange = (formData.get('pageRange') as string) || '';
    const orientation = (formData.get('orientation') as 'auto' | 'landscape' | 'portrait') || 'auto';

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
        { success: false, error: 'El archivo PDF proporcionado está vacío (0 bytes).' },
        { status: 400 }
      );
    }

    // Signature verification (%PDF-)
    const sig = validatePdfSignature(buffer);
    if (!sig.isValid) {
      return NextResponse.json(
        { success: false, error: 'El archivo no tiene una cabecera PDF válida (%PDF-) o está dañado.' },
        { status: 400 }
      );
    }

    // Convert PDF to genuine PowerPoint presentation
    const result = await convertPdfToPpt({
      buffer,
      originalFilename,
      customFilename: customFilename.trim() || undefined,
      password: password.trim() || undefined,
      mode,
      pageRange: pageRange.trim() || undefined,
      orientation,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error en conversión PDF a PowerPoint:', error);
    const errMessage = String(error?.message || '');

    if (
      errMessage.includes('FILE_IS_ENCRYPTED') ||
      errMessage.includes('PASSWORD_REQUIRED') ||
      errMessage.includes('is_encrypted')
    ) {
      return NextResponse.json(
        {
          success: false,
          code: 'PASSWORD_REQUIRED',
          isEncrypted: true,
          requiresPassword: true,
          error: 'El documento PDF está protegido con contraseña. Por favor ingresa la contraseña para continuar.',
        },
        { status: 423 }
      );
    }

    if (errMessage.includes('INVALID_PASSWORD')) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_PASSWORD',
          isEncrypted: true,
          requiresPassword: true,
          error: 'La contraseña proporcionada es incorrecta o no permite abrir el documento.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Ocurrió un error al convertir el PDF a PowerPoint. Por favor verifica el archivo.',
      },
      { status: 500 }
    );
  }
}

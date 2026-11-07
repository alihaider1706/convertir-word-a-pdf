import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, AUTH_COOKIE_NAME } from '@/lib/seo-service';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!verifyAuthToken(cookie)) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Formato no soportado. Usa JPG, PNG, WEBP o SVG.' },
        { status: 400 }
      );
    }

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: 'La imagen excede el límite de 10MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalExt = path.extname(file.name) || '.png';
    const cleanBase = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
    const fileName = `feat-${cleanBase}-${Date.now()}${originalExt}`;

    // Target upload folder in public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      fileName,
      size: file.size,
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { ok: false, error: 'Error interno al procesar la imagen' },
      { status: 500 }
    );
  }
}

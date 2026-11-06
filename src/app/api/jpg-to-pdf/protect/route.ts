import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { execFile } from 'child_process';
import crypto from 'crypto';

const execFileAsync = promisify(execFile);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo PDF para cifrar.' },
        { status: 400 }
      );
    }

    if (!password || password.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'La contraseña de cifrado debe tener al menos 3 caracteres.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const tempDir = os.tmpdir();
    const uniqueId = crypto.randomUUID();
    const inputPath = path.join(tempDir, `raw_${uniqueId}.pdf`);
    const outputPath = path.join(tempDir, `enc_${uniqueId}.pdf`);

    await fs.promises.writeFile(inputPath, inputBuffer);

    const pythonScript = path.join(process.cwd(), 'scripts', 'pdf_tools.py');

    try {
      await execFileAsync('python', [
        pythonScript,
        'encrypt',
        inputPath,
        outputPath,
        password.trim(),
      ]);

      if (!fs.existsSync(outputPath)) {
        throw new Error('No se generó el archivo PDF protegido.');
      }

      const protectedBytes = await fs.promises.readFile(outputPath);

      // Clean up temp files
      try {
        await fs.promises.unlink(inputPath);
        await fs.promises.unlink(outputPath);
      } catch {}

      return new NextResponse(protectedBytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="documento_protegido.pdf"',
          'Cache-Control': 'no-store',
        },
      });
    } catch (err: any) {
      try {
        if (fs.existsSync(inputPath)) await fs.promises.unlink(inputPath);
        if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath);
      } catch {}
      console.error('Python encrypt error:', err);
      return NextResponse.json(
        { success: false, error: 'Error durante el cifrado AES-256 del PDF: ' + (err.message || 'Error desconocido') },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('Protect API handler error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error en el servidor al proteger el PDF.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, createAuthToken, verifyAuthToken, AUTH_COOKIE_NAME } from '@/lib/seo-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { ok: false, error: 'Contraseña incorrecta. Acceso denegado.' },
        { status: 401 }
      );
    }

    const token = createAuthToken();
    const response = NextResponse.json({
      ok: true,
      message: 'Autenticación exitosa',
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error in auth API:', error);
    return NextResponse.json(
      { ok: false, error: 'Error del servidor durante la autenticación' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = verifyAuthToken(cookie);

  return NextResponse.json({
    ok: true,
    authenticated: isAuthenticated,
  });
}

export async function DELETE() {
  const response = NextResponse.json({
    ok: true,
    message: 'Sesión cerrada correctamente',
  });

  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

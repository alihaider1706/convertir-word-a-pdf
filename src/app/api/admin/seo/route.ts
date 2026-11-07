import { NextRequest, NextResponse } from 'next/server';
import {
  getSeoStore,
  saveSeoStore,
  verifyAuthToken,
  AUTH_COOKIE_NAME,
  PageSeoConfig,
  RedirectRule,
  GlobalSeoSettings,
  SeoStoreData,
} from '@/lib/seo-service';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!verifyAuthToken(cookie)) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const store = getSeoStore();
  return NextResponse.json({ ok: true, data: store });
}

export async function PUT(req: NextRequest) {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!verifyAuthToken(cookie)) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const currentStore = getSeoStore();

    let newStore: SeoStoreData = { ...currentStore };

    if (body.fullStore) {
      newStore = { ...body.fullStore, version: (currentStore.version || 1) + 1 };
    } else {
      if (body.page && body.page.slug) {
        const slug = body.page.slug;
        newStore.pages = {
          ...newStore.pages,
          [slug]: {
            ...body.page,
            lastModified: new Date().toISOString(),
          },
        };
      }

      if (body.redirects && Array.isArray(body.redirects)) {
        newStore.redirects = body.redirects;
      }

      if (body.globalSettings) {
        newStore.globalSettings = {
          ...newStore.globalSettings,
          ...body.globalSettings,
        };
      }

      newStore.version = (newStore.version || 1) + 1;
    }

    const success = await saveSeoStore(newStore);

    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'No se pudo guardar la configuración en disco' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Configuración guardada exitosamente',
      data: newStore,
    });
  } catch (error) {
    console.error('Error saving SEO config:', error);
    return NextResponse.json(
      { ok: false, error: 'Error procesando la solicitud de guardado' },
      { status: 500 }
    );
  }
}

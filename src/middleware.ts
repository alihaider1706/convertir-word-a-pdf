import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import seoStore from '@/data/seo-store.json';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check redirects from active rules
  const redirects = seoStore.redirects || [];
  for (const rule of redirects) {
    if (!rule.active) continue;

    const normSource = rule.source.trim();
    const normPathname = pathname.trim();

    // Check exact match or trailing slash variant
    if (
      normPathname === normSource ||
      normPathname === normSource.replace(/\/$/, '') ||
      normPathname === `${normSource}/`
    ) {
      const destination = rule.destination.startsWith('http')
        ? rule.destination
        : new URL(rule.destination, request.url).toString();

      return NextResponse.redirect(destination, rule.permanent ? 301 : 302);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, apple-touch-icon.png, uploads
     * - api routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|uploads).*)',
  ],
};

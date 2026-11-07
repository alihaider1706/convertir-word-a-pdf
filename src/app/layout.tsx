import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { getSeoStore } from '@/lib/seo-service';

export async function generateMetadata(): Promise<Metadata> {
  const store = getSeoStore();
  const bingVerification = store.globalSettings?.bingSiteVerification;

  return {
    metadataBase: new URL('https://convertirwordapdf.net'),
    title: {
      default: 'Convertir Word a PDF Gratis Online | DOC a PDF',
      template: '%s',
    },
    description:
      'Convierte Word a PDF gratis online. Transforma archivos DOC y DOCX en documentos PDF fácilmente, sin instalar programas.',
    keywords: [
      'convertir word a pdf',
      'word a pdf gratis',
      'doc a pdf',
      'docx a pdf',
      'convertidor word pdf',
      'transformar word en pdf online',
    ],
    authors: [{ name: 'Convertir Word a PDF' }],
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: 'JrH2dh7QIfa4oUxtnxHzd7BWVVaESuoDlqIiF42DCr8',
      other: bingVerification ? { 'msvalidate.01': bingVerification } : undefined,
    },
    openGraph: {
      title: 'Convertir Word a PDF Gratis Online | DOC a PDF',
      description:
        'Convierte Word a PDF gratis online de forma rápida y sencilla. Sube tu archivo DOC o DOCX y descarga tu PDF en segundos.',
      type: 'website',
      locale: 'es_ES',
      siteName: 'Convertir Word a PDF',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Convertir Word a PDF Gratis Online | DOC a PDF',
      description:
        'Convierte Word a PDF gratis online. Rápido, seguro y sin necesidad de instalar programas.',
    },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = getSeoStore();
  const gaId = store.globalSettings?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta
          name="google-site-verification"
          content="JrH2dh7QIfa4oUxtnxHzd7BWVVaESuoDlqIiF42DCr8"
        />
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}

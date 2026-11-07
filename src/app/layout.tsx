import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { getSeoStore } from '@/lib/seo-service';

export async function generateMetadata(): Promise<Metadata> {
  const store = getSeoStore();
  const bingVerification = store.globalSettings?.bingSiteVerification;

  return {
    metadataBase: new URL('https://www.convertirwordapdf.net'),
    title: {
      default: 'Convertir Word a PDF Gratis Online | DOC a PDF',
      template: '%s',
    },
    description:
      'Convierte Word a PDF gratis online. Transforma archivos DOC y DOCX en documentos PDF fácilmente, preservando el formato original y sin instalar programas.',
    keywords: [
      'convertir word a pdf',
      'word a pdf gratis',
      'doc a pdf',
      'docx a pdf',
      'convertidor word pdf',
      'transformar word en pdf online',
      'como pasar un word a pdf',
      'convertir docx a pdf sin desconfigurar',
    ],
    authors: [{ name: 'Convertir Word a PDF' }],
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
    alternates: {
      canonical: 'https://www.convertirwordapdf.net/',
      languages: {
        es: 'https://www.convertirwordapdf.net/',
        'x-default': 'https://www.convertirwordapdf.net/',
      },
    },
    manifest: '/manifest.webmanifest',
    verification: {
      google: 'JrH2dh7QIfa4oUxtnxHzd7BWVVaESuoDlqIiF42DCr8',
      other: bingVerification ? { 'msvalidate.01': bingVerification } : undefined,
    },
    openGraph: {
      title: 'Convertir Word a PDF Gratis Online | DOC a PDF',
      description:
        'Convierte Word a PDF gratis online de forma rápida y sencilla. Sube tu archivo DOC o DOCX y descarga tu PDF en segundos sin perder formato.',
      type: 'website',
      url: 'https://www.convertirwordapdf.net/',
      locale: 'es_ES',
      siteName: 'Convertir Word a PDF',
      images: [
        {
          url: 'https://www.convertirwordapdf.net/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Convertir Word a PDF Gratis Online',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Convertir Word a PDF Gratis Online | DOC a PDF',
      description:
        'Convierte Word a PDF gratis online con fidelidad milimétrica. Rápido, seguro y sin instalar software.',
      images: ['https://www.convertirwordapdf.net/og-image.png'],
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
  const gaId = store.globalSettings?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID || 'G-ZBQ15GMFJ5';

  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta
          name="google-site-verification"
          content="JrH2dh7QIfa4oUxtnxHzd7BWVVaESuoDlqIiF42DCr8"
        />
        <link rel="alternate" hrefLang="es" href="https://www.convertirwordapdf.net/" />
        <link rel="alternate" hrefLang="x-default" href="https://www.convertirwordapdf.net/" />
        <link rel="manifest" href="/manifest.webmanifest" />
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

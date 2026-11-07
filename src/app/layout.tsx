import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Convertir Word a PDF Gratis Online | DOC a PDF',
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
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}

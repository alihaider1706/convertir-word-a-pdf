import type { Metadata } from 'next';
import PdfToJpgClientPage from '@/components/pdf-to-jpg/PdfToJpgClientPage';

export const metadata: Metadata = {
  title: 'Convertir PDF a JPG Gratis Online | PDF a Imagen',
  description:
    'Convierte PDF a JPG gratis online. Transforma cada página en imágenes de alta calidad, ajusta la resolución y descarga tus imágenes por separado o en ZIP.',
  keywords: [
    'convertir pdf a jpg',
    'pdf a jpg',
    'convertir pdf en jpg',
    'convertir pdf a imagen',
    'convertir pdf a jpg gratis',
    'convertir páginas pdf a jpg',
    'convertir pdf a jpeg',
    'pasar pdf a jpg',
    'pdf a imagen online',
    'extraer imágenes de pdf',
    'convertir documento pdf a imagen',
    'convertir todas las páginas de pdf a jpg',
    'convertir pdf a jpg sin perder calidad',
    'convertir pdf a jpg online gratis',
    'descargar páginas pdf como imágenes',
    'convertir pdf a imágenes jpg',
    'transformar pdf en jpg',
  ],
  alternates: {
    canonical: '/convertir-pdf-a-jpg/',
  },
  openGraph: {
    title: 'Convertir PDF a JPG Gratis Online | PDF a Imagen',
    description:
      'Convierte documentos PDF en imágenes JPG de alta calidad página por página. Ajusta DPI de 72 a 300, calidad de compresión y descarga en ZIP al instante.',
    type: 'website',
    url: '/convertir-pdf-a-jpg/',
    locale: 'es_ES',
    siteName: 'Convertir PDF a JPG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convertir PDF a JPG Gratis Online | PDF a Imagen',
    description:
      'Convierte cada página de tu PDF a JPG con la resolución que elijas. Descarga individual o en archivo ZIP 100% gratis y privado.',
  },
};

export default function PdfToJpgPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Convertir PDF a JPG Gratis Online',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    description:
      'Herramienta en línea gratuita y profesional para convertir páginas de documentos PDF en imágenes JPG de alta resolución (72 a 300 DPI) con compresión ajustable, descarga individual y empaquetado en ZIP.',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://convertirwordapdf.org/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Convertir PDF a JPG',
        item: 'https://convertirwordapdf.org/convertir-pdf-a-jpg/',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PdfToJpgClientPage />
    </>
  );
}

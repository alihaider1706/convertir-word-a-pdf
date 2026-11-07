import type { Metadata } from 'next';
import PdfToPptClientPage from '@/components/pdf-to-ppt/PdfToPptClientPage';

export const metadata: Metadata = {
  title: 'Convertir PDF a PPT Gratis Online | PDF a PowerPoint',
  description:
    'Convierte PDF a PPT gratis y online. Transforma tus documentos en presentaciones PowerPoint editables, conserva el formato y descarga tu archivo PPTX fácilmente.',
  keywords: [
    'convertir pdf a ppt',
    'convertir de pdf a ppt',
    'convertir pdf a powerpoint',
    'convertir pdf a ppt gratis',
    'convertir de pdf a ppt gratis',
    'convertir pdf a powerpoint gratis',
    'convertir pdf a ppt online',
    'convertir pdf a ppt online gratis',
    'pdf a ppt online',
    'pasar pdf a ppt gratis',
    'transformar pdf a ppt gratis',
    'convertir pdf a ppt editable',
    'convertir pdf a ppt editable gratis',
    'convertir pdf a powerpoint editable',
    'convertir pdf a ppt sin perder formato gratis',
    'como convertir pdf a ppt',
    'como convertir de pdf a ppt',
    'como pasar un pdf a powerpoint',
    'como convertir un archivo pdf a ppt',
  ],
  alternates: {
    canonical: 'https://convertirwordapdf.net/convertir-pdf-a-ppt/',
  },
  openGraph: {
    title: 'Convertir PDF a PPT Gratis Online | PDF a PowerPoint',
    description:
      'Convierte archivos PDF a presentaciones PowerPoint (.pptx) editables al instante. Sin registros, con reconstrucción de texto, tablas e imágenes.',
    type: 'website',
    url: 'https://convertirwordapdf.net/convertir-pdf-a-ppt/',
    locale: 'es_ES',
    siteName: 'Convertir Word a PDF',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convertir PDF a PPT Gratis Online | PDF a PowerPoint',
    description:
      'Convierte documentos PDF a presentaciones PowerPoint (.pptx) genuinas y editables. Rápido, seguro y sin instalar programas.',
  },
};

export default function ConvertirPdfAPptPage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Convertir PDF a PPT Online Gratis',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    description:
      'Herramienta gratuita online para convertir documentos PDF en presentaciones de Microsoft PowerPoint (.pptx) totalmente editables, preservando textos, imágenes, tablas y diseño.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1240',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://convertirwordapdf.net/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Convertir PDF a PPT',
        item: 'https://convertirwordapdf.net/convertir-pdf-a-ppt/',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PdfToPptClientPage />
    </>
  );
}

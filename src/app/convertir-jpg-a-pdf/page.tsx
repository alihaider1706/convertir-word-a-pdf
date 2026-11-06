import type { Metadata } from 'next';
import JpgToPdfClientPage from '@/components/jpg-to-pdf/JpgToPdfClientPage';

export const metadata: Metadata = {
  title: 'Convertir JPG a PDF Gratis Online | Imágenes a PDF',
  description:
    'Convierte JPG a PDF gratis online. Une varias imágenes en un solo PDF, organiza páginas, ajusta el tamaño y descarga tu documento fácilmente.',
  keywords: [
    'convertir jpg a pdf',
    'jpg a pdf',
    'convertir de jpg a pdf',
    'convertir imagen a pdf',
    'convertir jpg a pdf gratis',
    'convertir jpeg a pdf',
    'imagenes a pdf',
    'fotos a pdf',
    'varias imagenes a pdf',
    'unir imagenes en pdf',
    'convertir fotos en pdf',
    'jpg a pdf online',
    'pasar jpg a pdf',
    'convertir imagen jpg a pdf',
    'convertir jpg a pdf sin perder calidad',
    'convertir jpg a pdf gratis sin registro',
  ],
  alternates: {
    canonical: '/convertir-jpg-a-pdf/',
  },
  openGraph: {
    title: 'Convertir JPG a PDF Gratis Online | Imágenes a PDF',
    description:
      'Convierte imágenes JPG, PNG y WebP a documentos PDF al instante. Combina múltiples fotos, define orden de páginas y descarga gratis.',
    type: 'website',
    url: '/convertir-jpg-a-pdf/',
    locale: 'es_ES',
    siteName: 'Convertir JPG a PDF',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convertir JPG a PDF Gratis Online | Imágenes a PDF',
    description:
      'Convierte y une fotos JPG a PDF en segundos sin perder calidad. Herramienta online gratuita y segura.',
  },
};

export default function JpgToPdfPage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Convertir JPG a PDF Gratis Online',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    description:
      'Herramienta en línea gratuita y profesional para convertir y combinar imágenes JPG, JPEG, PNG y WebP en documentos PDF de alta resolución con orientación automática, márgenes ajustables, recorte y cifrado AES-256.',
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
        name: 'Convertir JPG a PDF',
        item: 'https://convertirwordapdf.org/convertir-jpg-a-pdf/',
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
      <JpgToPdfClientPage />
    </>
  );
}

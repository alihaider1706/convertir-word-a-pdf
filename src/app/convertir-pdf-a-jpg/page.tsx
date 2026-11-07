import type { Metadata } from 'next';
import PdfToJpgClientPage from '@/components/pdf-to-jpg/PdfToJpgClientPage';
import { generatePageMetadata, getPageSeo } from '@/lib/seo-service';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('/convertir-pdf-a-jpg/', {
    title: 'Convertir PDF a JPG Gratis Online | PDF a Imagen',
    description:
      'Convierte PDF a JPG gratis online. Transforma cada página en imágenes de alta calidad, ajusta la resolución y descarga tus imágenes por separado o en ZIP.',
  });
}

export default function PdfToJpgPage() {
  const pageSeo = getPageSeo('/convertir-pdf-a-jpg/');

  const defaultWebAppSchema = {
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

  const defaultBreadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://convertirwordapdf.net/' },
    { '@type': 'ListItem', position: 2, name: 'Convertir PDF a JPG', item: 'https://convertirwordapdf.net/convertir-pdf-a-jpg/' },
  ];

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: pageSeo?.breadcrumbs?.length
      ? pageSeo.breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: b.item,
        }))
      : defaultBreadcrumbs,
  };

  const schemaToRender = pageSeo?.schemaJsonLd || defaultWebAppSchema;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaToRender) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <PdfToJpgClientPage />
    </>
  );
}

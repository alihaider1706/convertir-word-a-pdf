import type { Metadata } from 'next';
import PdfToPptClientPage from '@/components/pdf-to-ppt/PdfToPptClientPage';
import { generatePageMetadata, getPageSeo } from '@/lib/seo-service';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('/convertir-pdf-a-ppt/', {
    title: 'Convertir PDF a PPT Gratis Online | PDF a PowerPoint',
    description:
      'Convierte PDF a PPT gratis y online. Transforma tus documentos en presentaciones PowerPoint editables, conserva el formato y descarga tu archivo PPTX fácilmente.',
  });
}

export default function ConvertirPdfAPptPage() {
  const pageSeo = getPageSeo('/convertir-pdf-a-ppt/');

  const defaultSoftwareSchema = {
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

  const defaultBreadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://convertirwordapdf.net/' },
    { '@type': 'ListItem', position: 2, name: 'Convertir PDF a PPT', item: 'https://convertirwordapdf.net/convertir-pdf-a-ppt/' },
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

  const schemaToRender = pageSeo?.schemaJsonLd || defaultSoftwareSchema;

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
      <PdfToPptClientPage />
    </>
  );
}

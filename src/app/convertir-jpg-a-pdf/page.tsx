import type { Metadata } from 'next';
import JpgToPdfClientPage from '@/components/jpg-to-pdf/JpgToPdfClientPage';
import { generatePageMetadata, getPageSeo } from '@/lib/seo-service';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('/convertir-jpg-a-pdf/', {
    title: 'Convertir JPG a PDF Gratis Online | Imágenes a PDF',
    description:
      'Convierte JPG a PDF gratis online. Une varias imágenes en un solo PDF, organiza páginas, ajusta el tamaño y descarga tu documento fácilmente.',
  });
}

export default function JpgToPdfPage() {
  const pageSeo = getPageSeo('/convertir-jpg-a-pdf/');

  const defaultSoftwareSchema = {
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

  const defaultBreadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://convertirwordapdf.net/' },
    { '@type': 'ListItem', position: 2, name: 'Convertir JPG a PDF', item: 'https://convertirwordapdf.net/convertir-jpg-a-pdf/' },
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
      <JpgToPdfClientPage />
    </>
  );
}

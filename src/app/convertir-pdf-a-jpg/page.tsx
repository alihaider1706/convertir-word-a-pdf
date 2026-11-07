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
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.convertirwordapdf.net/' },
    { '@type': 'ListItem', position: 2, name: 'Convertir PDF a JPG', item: 'https://www.convertirwordapdf.net/convertir-pdf-a-jpg/' },
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo convertir páginas de PDF a imágenes JPG de alta resolución',
    description: 'Extrae páginas de un archivo PDF y guárdalas como imágenes JPG o PNG nítidas en 3 pasos.',
    totalTime: 'PT30S',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Sube tu documento PDF',
        text: 'Arrastra el archivo PDF cuyas páginas deseas convertir en fotos.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Selecciona la resolución DPI',
        text: 'Elige entre 72 DPI (web), 150 DPI (estándar) o 300 DPI (alta resolución para impresión).',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Descarga tus imágenes',
        text: 'Guarda cada página como imagen individual o descarga todas juntas empaquetadas en un archivo ZIP.',
      },
    ],
  };

  const faqsToRender = [
    {
      question: '¿Qué calidad y resolución tienen las imágenes JPG obtenidas?',
      answer: 'Puedes seleccionar resoluciones desde 72 hasta 300 DPI con compresión JPEG calibrada para máxima nitidez de texto y gráficos vectoriales.',
    },
    {
      question: '¿Puedo descargar todas las páginas en un archivo comprimido?',
      answer: 'Sí. Dispones de un botón para descargar todas las páginas convertidas en un único archivo ZIP descargable con un clic.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqsToRender.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PdfToJpgClientPage />
    </>
  );
}

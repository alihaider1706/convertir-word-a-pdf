import type { Metadata } from 'next';
import ComprimirPdfClientPage from '@/components/compress-pdf/ComprimirPdfClientPage';
import { generatePageMetadata, getPageSeo } from '@/lib/seo-service';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('/comprimir-pdf/', {
    title: 'Comprimir PDF Gratis Online - Reduce Tamaño sin Perder Calidad',
    description:
      'Comprimir archivos PDF online gratis y rápido. Reduce el peso de tus documentos PDF a 1MB, 2MB o al máximo sin perder calidad. Seguro, privado y sin registro.',
  });
}

export default function ComprimirPdfPage() {
  const pageSeo = getPageSeo('/comprimir-pdf/');

  const defaultWebAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Comprimir PDF Gratis Online',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    description:
      'Herramienta en línea gratuita para comprimir y reducir el tamaño de documentos PDF al máximo o sin perder calidad. Incluye perfiles de compresión básica, recomendada y extrema, y ajuste a tamaños objetivo de 1MB, 2MB y 300KB.',
  };

  const defaultBreadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.convertirwordapdf.net/' },
    { '@type': 'ListItem', position: 2, name: 'Comprimir PDF', item: 'https://www.convertirwordapdf.net/comprimir-pdf/' },
  ];

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo comprimir un archivo PDF sin perder calidad gratis',
    description: 'Reduce el peso de cualquier documento PDF a menos de 1MB o 2MB en 3 pasos rápidos.',
    totalTime: 'PT20S',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Sube tu documento PDF pesado',
        text: 'Arrastra tu archivo PDF en la herramienta de compresión.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Elige el nivel de compresión',
        text: 'Selecciona entre compresión básica, recomendada, extrema o fija un peso límite como 1MB o 2MB.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Descarga tu PDF optimizado',
        text: 'Haz clic en Descargar PDF para guardar tu archivo optimizado y ligero.',
      },
    ],
  };

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

  const faqList = pageSeo?.faqs?.length
    ? pageSeo.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      }))
    : [
        {
          '@type': 'Question',
          name: '¿Cómo comprimir un archivo PDF gratis sin perder calidad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Para comprimir un PDF sin perder nitidez visual, utiliza el modo de "Compresión básica". Este nivel optimiza las estructuras internas y las tablas de objetos aplicando compresión Flate sin alterar la resolución de las imágenes.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Puedo comprimir un PDF a 1MB o 2MB para trámites oficiales?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. Selecciona la opción de "Tamaño objetivo" y marca 1 MB o 2 MB para que el documento pese menos del límite reglamentario.',
          },
        },
      ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList,
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
      <ComprimirPdfClientPage />
    </>
  );
}

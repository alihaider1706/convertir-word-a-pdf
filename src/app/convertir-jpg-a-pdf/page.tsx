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
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.convertirwordapdf.net/' },
    { '@type': 'ListItem', position: 2, name: 'Convertir JPG a PDF', item: 'https://www.convertirwordapdf.net/convertir-jpg-a-pdf/' },
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
    name: 'Cómo convertir imágenes JPG a un documento PDF gratis',
    description: 'Une y convierte fotos JPG, PNG y WebP en un archivo PDF de alta calidad en 3 pasos.',
    totalTime: 'PT30S',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Carga tus fotos o imágenes',
        text: 'Selecciona una o varias imágenes JPG, PNG o WebP desde tu galería o explorador de archivos.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Configura orientación y márgenes',
        text: 'Elige orientación vertical u horizontal, ajusta los márgenes y reordena las páginas arrastrándolas.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Descarga tu documento PDF unido',
        text: 'Haz clic en Convertir a PDF y descarga tu documento listo en segundos.',
      },
    ],
  };

  const faqsToRender = [
    {
      question: '¿Puedo unir varias fotos JPG en un único archivo PDF?',
      answer: 'Sí. Puedes subir tantas fotos como desees, ordenarlas a tu gusto y el convertidor las agrupará secuencialmente en un solo documento PDF.',
    },
    {
      question: '¿Qué formatos de imagen son compatibles?',
      answer: 'La herramienta soporta JPG, JPEG, PNG, WebP y GIF preservando los colores y la nitidez fotográfica original.',
    },
    {
      question: '¿Se comprime la calidad de las imágenes al pasar a PDF?',
      answer: 'No. El conversor mantiene la resolución nativa de cada fotografía asegurando calidad óptima para impresión y archivo.',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <JpgToPdfClientPage />
    </>
  );
}

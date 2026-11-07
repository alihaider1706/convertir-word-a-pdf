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
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.convertirwordapdf.net/' },
    { '@type': 'ListItem', position: 2, name: 'Convertir PDF a PPT', item: 'https://www.convertirwordapdf.net/convertir-pdf-a-ppt/' },
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
    name: 'Cómo convertir un PDF a PowerPoint PPTX editable gratis',
    description: 'Transforma cualquier archivo PDF en una presentación PPTX de diapositivas genuina y editable.',
    totalTime: 'PT45S',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Arrastra tu archivo PDF',
        text: 'Carga tu documento PDF en la caja del convertidor.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Reconstrucción de diapositivas',
        text: 'El motor detecta cada página y la mapea a una diapositiva PPTX con cuadros de texto editables y fondos nítidos.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Descarga tu presentación PPTX',
        text: 'Guarda tu archivo PowerPoint listo para exponer o editar en PowerPoint, Keynote o Google Slides.',
      },
    ],
  };

  const faqsToRender = [
    {
      question: '¿Las diapositivas generadas son editables en PowerPoint?',
      answer: 'Sí. Cada página del PDF se convierte en una diapositiva con cuadros de texto nativos de PowerPoint que puedes modificar libremente.',
    },
    {
      question: '¿Se conservan los fondos y diagramas?',
      answer: 'Sí, la tecnología de renderizado dual preserva los gráficos vectoriales y elementos visuales con la más alta resolución.',
    },
    {
      question: '¿Puedo elegir qué páginas convertir a diapositivas?',
      answer: 'Sí, dispones de un selector de rango para convertir solo las páginas deseadas o el documento completo.',
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
      <PdfToPptClientPage />
    </>
  );
}

import type { Metadata } from 'next';
import PdfToWordClientPage from '@/components/PdfToWordClientPage';
import { generatePageMetadata, getPageSeo } from '@/lib/seo-service';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('/pdf-a-word', {
    title: 'Convertir PDF a Word Gratis y Editable Online | DOCX',
    description:
      'Convierte PDF a Word gratis online sin perder formato. Transforma tus documentos PDF en archivos DOCX totalmente editables con tablas, imágenes y soporte OCR.',
  });
}

export default function PdfToWordPage() {
  const pageSeo = getPageSeo('/pdf-a-word');

  const defaultSoftwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Convertir PDF a Word Online',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    description:
      'Herramienta gratuita online para convertir documentos PDF en archivos editables de Microsoft Word (.docx) conservando tablas, fuentes, párrafos y OCR.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1390',
    },
  };

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://www.convertirwordapdf.net/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Convertir PDF a Word',
        item: 'https://www.convertirwordapdf.net/pdf-a-word',
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo convertir un archivo PDF a Word DOCX editable gratis',
    description: 'Convierte tus documentos PDF en archivos Microsoft Word (.docx) 100% editables en 3 pasos.',
    totalTime: 'PT30S',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Sube tu documento PDF',
        text: 'Arrastra tu archivo PDF o selecciónalo desde tu dispositivo en la zona de carga.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Procesamiento y extracción OCR',
        text: 'El sistema reconstruye la estructura textual, párrafos, tablas e imágenes en formato Word nativo.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Descarga tu archivo Word DOCX',
        text: 'Haz clic en Descargar DOCX para abrir y editar tu documento en Microsoft Word, Google Docs o LibreOffice.',
      },
    ],
  };

  const faqsToRender = [
    {
      question: '¿El archivo Word resultante es 100% editable?',
      answer: 'Sí. A diferencia de convertidores que solo pegan imágenes, nuestro motor extrae y reconstruye texto real, tablas, listas y fuentes para que puedas editar cada párrafo sin inconvenientes.',
    },
    {
      question: '¿Qué ocurre con las imágenes y el diseño original?',
      answer: 'Las imágenes se extraen en alta resolución y se ubican en sus posiciones relativas exactas dentro del documento Word generado.',
    },
    {
      question: '¿Puedo convertir PDFs escaneados a Word?',
      answer: 'Sí, la herramienta cuenta con tecnología de reconocimiento óptico de caracteres (OCR) para extraer texto de documentos escaneados.',
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
      <PdfToWordClientPage />
    </>
  );
}

import type { Metadata } from 'next';
import HomeClientPage from '@/components/home/HomeClientPage';
import { generatePageMetadata, getPageSeo } from '@/lib/seo-service';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('/', {
    title: 'Convertir Word a PDF Gratis Online | DOC a PDF',
    description:
      'Convierte Word a PDF gratis online. Transforma archivos DOC y DOCX en documentos PDF fácilmente, preservando el formato original y sin instalar programas.',
  });
}

export default function HomePage() {
  const pageSeo = getPageSeo('/');

  // 1. WebSite & Organization Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Convertir Word a PDF',
    url: 'https://www.convertirwordapdf.net/',
    description: 'Suite profesional de conversión de documentos Word a PDF, PDF a Word, compresión y optimización online.',
    publisher: {
      '@type': 'Organization',
      name: 'Convertir Word a PDF',
      url: 'https://www.convertirwordapdf.net/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.convertirwordapdf.net/icon-512.png',
      },
    },
  };

  // 2. Software Application Schema
  const softwareSchema = pageSeo?.schemaJsonLd || {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Convertir Word a PDF Gratis Online',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1580',
    },
  };

  // 3. HowTo Schema (Rich SERP snippet for step queries)
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo convertir un documento Word a PDF gratis online',
    description: 'Aprende a transformar archivos DOC o DOCX a formato PDF en 3 sencillos pasos sin perder formato ni fuentes.',
    image: 'https://www.convertirwordapdf.net/og-image.png',
    totalTime: 'PT30S',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Selecciona o arrastra tu archivo Word',
        text: 'Haz clic en el área de carga o arrastra tus documentos .doc o .docx desde tu ordenador o teléfono móvil.',
        url: 'https://www.convertirwordapdf.net/#converter-tool',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Espera el procesamiento automático',
        text: 'El motor analiza las fuentes tipográficas, márgenes, tablas e imágenes y reconstruye el documento en PDF con fidelidad milimétrica.',
        url: 'https://www.convertirwordapdf.net/#converter-tool',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Descarga tu documento PDF listo',
        text: 'Haz clic en el botón Descargar PDF o descarga un paquete comprimido en ZIP si procesaste múltiples archivos por lotes.',
        url: 'https://www.convertirwordapdf.net/#converter-tool',
      },
    ],
  };

  // 4. FAQPage Schema (Rich SERP Accordion dropdowns in Google)
  const defaultFaqs = [
    {
      question: '¿Cómo convertir un documento Word a PDF gratis online?',
      answer: 'Arrastra tu archivo DOC o DOCX al convertidor en línea, espera unos segundos a que el motor procese los elementos gráficos y haz clic en Descargar PDF. No requiere registros ni pagos.',
    },
    {
      question: '¿Se mantiene el formato, las fuentes y las tablas originales al convertir?',
      answer: 'Sí. Nuestro motor de conversión preserva la tipografía, tablas complejas, sangrías, numeraciones e imágenes incrustadas con fidelidad del 100% respecto al archivo original.',
    },
    {
      question: '¿Es seguro subir documentos confidenciales, laborales o personales?',
      answer: 'Totalmente seguro. Las transferencias se cifran de extremo a extremo con SSL TLS 1.3 de 256 bits y los archivos se eliminan automáticamente del servidor transcurrida 1 hora.',
    },
    {
      question: '¿Puedo convertir varios archivos Word a la vez (por lotes)?',
      answer: 'Sí, puedes arrastrar múltiples documentos DOC y DOCX simultáneamente. Se convertirán en paralelo y podrás descargarlos individualmente o agrupados en un único archivo ZIP.',
    },
    {
      question: '¿Puedo usar el convertidor en mi celular (iPhone o Android)?',
      answer: 'Absolutamente. La plataforma está optimizada para funcionar directamente desde navegadores móviles como Chrome, Safari y Edge sin instalar ninguna app adicional.',
    },
  ];

  const faqsToRender = pageSeo?.faqs && pageSeo.faqs.length > 0 ? pageSeo.faqs : defaultFaqs;

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClientPage />
    </>
  );
}

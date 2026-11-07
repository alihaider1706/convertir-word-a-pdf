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
  };

  const schemaToRender = pageSeo?.schemaJsonLd || defaultSoftwareSchema;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaToRender) }}
      />
      <PdfToWordClientPage />
    </>
  );
}

import type { Metadata } from 'next';
import PdfToWordClientPage from '@/components/PdfToWordClientPage';

export const metadata: Metadata = {
  title: 'Convertir PDF a Word Gratis y Editable Online | DOCX',
  description:
    'Convierte PDF a Word gratis online sin perder formato. Transforma tus documentos PDF en archivos DOCX totalmente editables con tablas, imágenes y soporte OCR.',
  keywords: [
    'convertir pdf a word',
    'convertir pdf a word gratis',
    'como convertir pdf a word',
    'convertir pdf a word editable',
    'convertir pdf a word gratis online',
    'convertir pdf a word sin perder formato gratis',
    'convertir pdf a word con ocr',
    'convertir pdf a word ocr gratis',
    'convertir pdf a word gratuito',
    'pasar pdf a word',
    'pdf a docx',
    'transformar pdf a word online',
  ],
  alternates: {
    canonical: '/pdf-a-word',
  },
  openGraph: {
    title: 'Convertir PDF a Word Gratis y Editable Online | DOCX',
    description:
      'Convierte archivos PDF a Microsoft Word (.docx) editables al instante. Sin registros, con OCR y descarga en ZIP.',
    type: 'website',
    url: '/pdf-a-word',
    locale: 'es_ES',
    siteName: 'Convertir PDF a Word',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convertir PDF a Word Gratis y Editable Online',
    description:
      'Convierte documentos PDF a Word (.docx) genuinos y 100% editables. Rápido, seguro y sin instalar software.',
  },
};

export default function PdfToWordPage() {
  const softwareSchema = {
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <PdfToWordClientPage />
    </>
  );
}

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
  const schema = pageSeo?.schemaJsonLd;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <HomeClientPage />
    </>
  );
}

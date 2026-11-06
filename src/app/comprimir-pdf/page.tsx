import type { Metadata } from 'next';
import ComprimirPdfClientPage from '@/components/compress-pdf/ComprimirPdfClientPage';

export const metadata: Metadata = {
  title: 'Comprimir PDF Gratis Online - Reduce Tamaño sin Perder Calidad',
  description:
    'Comprimir archivos PDF online gratis y rápido. Reduce el peso de tus documentos PDF a 1MB, 2MB o al máximo sin perder calidad. Seguro, privado y sin registro.',
  keywords: [
    'comprimir pdf',
    'comprimir pdf gratis',
    'como comprimir un archivo pdf',
    'comprimir archivos pdf',
    'pdf comprimir',
    'comprimir archivo pdf',
    'comprimir pdf online',
    'comprimir pdf gratis online',
    'comprimir archivos pdf gratis',
    'comprimir un pdf',
    'como comprimir un pdf',
    'comprimir pdf al máximo',
    'comprimir pdf a 2mb',
    'comprimir pdf a 1mb',
    'comprimir un pdf gratis',
    'comprimir documentos pdf',
    'comprimir pdf al máximo gratis',
    'comprimir un archivo pdf',
    'comprimir archivo pdf gratis',
    'comprimir pdf sin perder calidad',
    'como comprimir un archivo pdf gratis',
    'comprimir pdf extremo',
    'comprimir pdf en linea',
    'comprimir pdf para que pese menos',
  ],
  alternates: {
    canonical: 'https://convertirwordapdf.org/comprimir-pdf/',
  },
  openGraph: {
    title: 'Comprimir PDF Gratis Online - Reduce Tamaño sin Perder Calidad',
    description:
      'Reduce el tamaño de tus archivos PDF al máximo sin perder nitidez. Optimiza para correos, portales de trámites y almacenamiento en la nube sin costo.',
    type: 'website',
    url: 'https://convertirwordapdf.org/comprimir-pdf/',
    locale: 'es_ES',
    siteName: 'Plataforma Documental',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comprimir PDF Gratis Online - Reduce Tamaño sin Perder Calidad',
    description:
      'Comprime tus documentos PDF en el navegador de manera segura y privada. Reduce a 1MB, 2MB o al máximo con fidelidad visual garantizada.',
  },
};

export default function ComprimirPdfPage() {
  const webAppSchema = {
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://convertirwordapdf.org/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Comprimir PDF',
        item: 'https://convertirwordapdf.org/comprimir-pdf/',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo comprimir un archivo PDF gratis sin perder calidad?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Para comprimir un PDF sin perder nitidez visual, utiliza el modo de "Compresión básica". Este nivel optimiza las estructuras internas y las tablas de objetos aplicando compresión Flate sin alterar la resolución de las imágenes ni convertir las fuentes en mapa de bits.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo comprimir un archivo PDF en el celular (iPhone o Android)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No necesitas instalar aplicaciones. Abre tu navegador web (Safari o Chrome), ingresa a la herramienta, selecciona tu PDF desde la memoria del teléfono o la nube, elige el modo de compresión y pulsa Descargar para guardarlo directamente.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Puedo comprimir un PDF a 1MB o 2MB para trámites oficiales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí. Selecciona la opción de "Tamaño objetivo" y marca 1 MB o 2 MB. Nuestro motor realizará pasadas iterativas ajustando de forma balanceada la resolución de las imágenes incrustadas hasta lograr que el documento pese menos del límite reglamentario.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Es seguro comprimir documentos con información confidencial o bancaria?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Totalmente seguro. El procesamiento de los documentos se ejecuta bajo canales cifrados HTTPS y los archivos temporales se purgan automáticamente de la memoria. No almacenamos copias permanentes ni compartimos información con terceros.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuál es la diferencia entre compresión con pérdida y compresión sin pérdida?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La compresión sin pérdida optimiza la codificación interna sin modificar un solo píxel de las imágenes. La compresión con pérdida recalibra inteligentemente la resolución y cuantización de las imágenes fotográficas incrustadas para alcanzar reducciones drásticas del 70% al 90%.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Puedo comprimir varios archivos PDF al mismo tiempo (por lotes)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, puedes arrastrar varios documentos PDF al área de carga a la vez. Cada archivo se procesará con los ajustes que definas y podrás descargarlos individualmente o empaquetados en un único archivo ZIP descargable.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué hago si mi PDF está protegido con contraseña?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El sistema lo detectará automáticamente y te solicitará ingresar la contraseña legítima para poder descifrar los flujos internos y aplicar la optimización sin vulnerar la seguridad criptográfica.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Por qué algunos archivos PDF casi no se reducen de tamaño?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Si un documento PDF está compuesto primordialmente por texto vectorial puro o ya fue optimizado previamente, los flujos internos ya se encuentran en su mínima expresión matemática. En estos casos, el sistema notifica que el archivo ya cuenta con un tamaño óptimo.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ComprimirPdfClientPage />
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const PDF_TO_JPG_FAQS = [
  {
    question: '¿Cómo convertir PDF a JPG gratis online?',
    answer:
      'Arrastra tu documento PDF a la zona de carga o haz clic en "Seleccionar archivo PDF". Elige la resolución deseada (de 72 a 300 DPI) y la calidad de compresión, luego pulsa en "Convertir PDF a JPG". El sistema procesará cada página y te permitirá descargarlas individualmente o en un archivo ZIP de inmediato.',
  },
  {
    question: '¿Puedo convertir todas las páginas de un PDF a JPG?',
    answer:
      'Sí, por defecto el conversor transforma todas las páginas del archivo PDF en imágenes JPG individuales manteniendo el orden, diseño y orientación original del documento.',
  },
  {
    question: '¿Puedo convertir solo algunas páginas del PDF?',
    answer:
      'Sí. Puedes ingresar un rango de páginas personalizado como "1-5", seleccionar números específicos separados por coma como "1,3,7", elegir solo la primera o la última página, o marcar las páginas deseadas directamente en la cuadrícula visual de miniaturas.',
  },
  {
    question: '¿Cómo convertir PDF a JPG sin perder calidad?',
    answer:
      'Para preservar la máxima fidelidad tipográfica y gráfica, selecciona una resolución alta de 150 DPI o 300 DPI y el nivel de calidad de compresión al 95%. Esto garantiza bordes nítidos en textos y detalles precisos en imágenes.',
  },
  {
    question: '¿Puedo elegir la resolución de las imágenes?',
    answer:
      'Sí, tienes 5 niveles de resolución predefinidos: 72 DPI (web rápida), 96 DPI (pantalla estándar), 150 DPI (calidad equilibrada recomendada), 200 DPI (alta nitidez) y 300 DPI (calidad editorial apta para impresión profesional).',
  },
  {
    question: '¿Puedo descargar cada página por separado?',
    answer:
      'Por supuesto. Una vez completada la conversión, cada página cuenta con su propio botón de descarga individual y una opción de vista previa ampliada en alta resolución.',
  },
  {
    question: '¿Puedo descargar todas las imágenes en un archivo ZIP?',
    answer:
      'Sí. Con un solo clic en el botón "Descargar todas en ZIP", se empaquetan todas las imágenes JPG generadas en un único archivo ZIP comprimido con nombres ordenados secuencialmente.',
  },
  {
    question: '¿Funciona el conversor PDF a JPG en el celular?',
    answer:
      'Sí, nuestra herramienta es 100% responsiva y funciona sin problemas en cualquier smartphone o tablet Android, iPhone o iPad a través de navegadores como Chrome, Safari, Firefox y Edge.',
  },
  {
    question: '¿Necesito registrarme para convertir PDF a JPG?',
    answer:
      'No. El servicio es completamente gratuito y no requiere crear una cuenta, ingresar correo electrónico ni instalar extensiones o programas adicionales.',
  },
  {
    question: '¿Se guardan mis documentos en el servidor?',
    answer:
      'No. La conversión se procesa localmente en la memoria de tu propio navegador web mediante las tecnologías estándar HTML5 Canvas y PDF.js. Tu archivo PDF nunca se transmite a servidores externos ni se almacena en bases de datos.',
  },
  {
    question: '¿Cuál es la diferencia entre JPG y JPEG?',
    answer:
      'No hay ninguna diferencia técnica. Ambos se refieren al mismo formato y algoritmo de compresión de imagen estandarizado por el Joint Photographic Experts Group. La extensión ".jpg" surgió históricamente por la limitación de 3 letras en sistemas operativos antiguos como MS-DOS, mientras que ".jpeg" es el nombre completo.',
  },
  {
    question: '¿Puedo convertir archivos PDF grandes?',
    answer:
      'Sí, el conversor procesa documentos de múltiples páginas de manera secuencial para optimizar el consumo de memoria RAM del navegador. Para documentos extremadamente pesados con cientos de páginas, recomendamos convertir por bloques o rangos para garantizar el mejor rendimiento.',
  },
];

export default function PdfToJpgFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PDF_TO_JPG_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section id="faq-section" className="py-12 px-4 max-w-3xl mx-auto border-t border-slate-200/70">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Preguntas frecuentes sobre PDF a JPG
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Respuestas claras sobre la resolución, descarga en ZIP, privacidad y opciones de conversión de páginas.
        </p>
      </div>

      <div className="space-y-3">
        {PDF_TO_JPG_FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-slate-200/80 rounded-lg bg-white overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 bg-slate-50/30 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

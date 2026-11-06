'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function JpgToPdfFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: '¿Cómo convertir JPG a PDF gratis?',
      a: 'Solo debes subir tus imágenes arrastrándolas o seleccionándolas desde tu dispositivo. Configura el orden, tamaño de página y márgenes según tus preferencias, y pulsa el botón "Convertir JPG a PDF". En cuestión de segundos podrás previsualizar y descargar tu documento PDF sin costo alguno.',
    },
    {
      q: '¿Puedo convertir varias imágenes JPG en un solo PDF?',
      a: 'Sí, puedes subir múltiples fotos simultáneamente. Todas las imágenes seleccionadas se combinan en un único archivo PDF continuo, donde cada imagen se ubica en su propia página según el orden que hayas establecido.',
    },
    {
      q: '¿Puedo cambiar el orden de las imágenes?',
      a: 'Por supuesto. En el panel de imágenes puedes arrastrar y soltar cualquier fotografía para cambiar su posición, o utilizar las flechas izquierda y derecha de cada tarjeta. Las páginas del PDF final respetarán exactamente el orden visual que definas.',
    },
    {
      q: '¿Puedo convertir JPG a PDF desde mi celular?',
      a: 'Sí. Nuestra herramienta está completamente optimizada para teléfonos móviles y tabletas (iOS y Android). Puedes tomar fotos directamente con tu cámara o seleccionar imágenes de tu galería para convertirlas al instante sin instalar ninguna app.',
    },
    {
      q: '¿Qué formatos de imagen son compatibles?',
      a: 'La herramienta admite imágenes en formatos JPG, JPEG, PNG y WebP. Los archivos se validan mediante firmas binarias reales para garantizar que no existan errores de formato o archivos dañados.',
    },
    {
      q: '¿Puedo elegir el tamaño A4 o Letter?',
      a: 'Sí, dispones de opciones estándar como A4, Carta (Letter), Oficio (Legal), A3 y A5, además de la opción "Ajustar al tamaño de imagen" que adapta las dimensiones exactas de la hoja a los píxeles de cada foto.',
    },
    {
      q: '¿Cómo puedo mantener la calidad de mis imágenes?',
      a: 'Selecciona la opción "Alta Calidad" en el selector de compresión. Esto preservará la resolución original y aplicará un muestreo de compresión mínimo para asegurar que los detalles y textos de las fotos no pierdan nitidez.',
    },
    {
      q: '¿Es necesario registrarse para convertir JPG a PDF?',
      a: 'No. El servicio es completamente libre, sin registros de cuentas, sin suscripciones y sin necesidad de ingresar correos electrónicos ni tarjetas de crédito.',
    },
    {
      q: '¿Puedo descargar un PDF con varias páginas?',
      a: 'Sí. Al seleccionar el modo "Unir en un solo PDF", se genera un único documento encuadernado de múltiples páginas. Si prefieres archivos separados, también puedes elegir el modo "PDFs individuales" para descargarlos en un archivo ZIP.',
    },
    {
      q: '¿Se guardan mis imágenes en el servidor?',
      a: 'No. El procesamiento de las imágenes y la maquetación del PDF se realiza directamente en el entorno de tu propio navegador web mediante Canvas y PDF-lib. Tus fotografías personales no se transmiten ni quedan almacenadas permanentemente en servidores externos.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <section id="faq" className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mb-8 text-left">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Preguntas frecuentes sobre JPG a PDF
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Respuestas claras a las dudas más habituales sobre la conversión de imágenes a documentos PDF.
        </p>
      </div>

      <div className="space-y-2.5">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-lg border border-slate-200/80 bg-white overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full py-3.5 px-4 text-left flex items-center justify-between gap-4 text-slate-900 hover:text-blue-600 transition-colors focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="text-xs sm:text-sm font-semibold tracking-tight">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100/80">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

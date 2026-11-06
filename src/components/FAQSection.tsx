'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: '¿Cómo convertir Word a PDF gratis?',
      answer:
        'Arrastra tu documento Word (.doc o .docx) al recuadro de carga o haz clic en "Seleccionar archivo". Una vez cargado, pulsa el botón "Convertir a PDF" y en pocos segundos podrás descargar tu documento listo para usar, 100% gratis y sin marcas de agua.',
    },
    {
      question: '¿Puedo convertir archivos DOCX a PDF?',
      answer:
        'Sí. La herramienta es totalmente compatible con el formato estándar DOCX de Microsoft Word, así como con archivos DOC de versiones anteriores y documentos generados por Google Docs o LibreOffice.',
    },
    {
      question: '¿Se conserva el formato original?',
      answer:
        'Sí. El motor de conversión preserva la estructura del documento: familias tipográficas, tamaños de texto, alineaciones, listas con viñetas, tablas con bordes y proporciones de imágenes incrustadas.',
    },
    {
      question: '¿Puedo convertir documentos desde mi móvil?',
      answer:
        'Sí. El sitio está optimizado para funcionar directamente en el navegador de cualquier teléfono o tableta (iOS y Android), permitiéndote cargar documentos desde tus archivos locales o servicios en la nube.',
    },
    {
      question: '¿Existe un límite de tamaño para los archivos?',
      answer:
        'El tamaño máximo permitido es de 50 MB por archivo, lo que cubre con holgura la gran mayoría de informes, tesis, presentaciones y contratos habituales.',
    },
    {
      question: '¿Qué sucede con mis documentos después de convertirlos?',
      answer:
        'La privacidad y seguridad están garantizadas. Todas las conexiones se realizan bajo cifrado SSL y los archivos procesados se eliminan de manera automática e irreversible de nuestros servidores tras 1 hora.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-12 px-4 max-w-4xl mx-auto border-t border-slate-200/70">
      <div className="mb-6 text-left">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Preguntas frecuentes
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Respuestas a las consultas más habituales sobre la conversión de Word a PDF.
        </p>
      </div>

      <div className="divide-y divide-slate-200 border-y border-slate-200">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full text-left flex items-center justify-between gap-4 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-semibold text-slate-900 pr-2">
                  {faq.question}
                </span>
                <span
                  className={`w-6 h-6 flex items-center justify-center shrink-0 text-slate-500 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              {isOpen && (
                <div className="pt-2.5 pb-1 text-xs sm:text-sm text-slate-600 leading-relaxed pr-6">
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

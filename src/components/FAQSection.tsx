'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

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
        'Arrastra tu documento Word (.doc o .docx) a la zona de carga o pulsa en "Seleccionar archivos". Una vez cargado, haz clic en "Convertir a PDF" y en pocos segundos podrás descargar tu archivo de forma gratuita, sin marcas de agua y sin límites.',
    },
    {
      question: '¿Puedo convertir archivos DOCX a PDF?',
      answer:
        'Sí. La plataforma soporta el formato DOCX estándar de Microsoft Word, así como documentos DOC anteriores y archivos creados en Google Docs o LibreOffice Writer.',
    },
    {
      question: '¿Se mantiene el formato original del documento?',
      answer:
        'Sí. El motor de renderizado preserva fielmente fuentes tipográficas, saltos de página, imágenes integradas, márgenes y tablas estructuradas.',
    },
    {
      question: '¿Puedo convertir documentos desde mi móvil?',
      answer:
        'Por supuesto. La herramienta funciona fluidamente en navegadores de iOS (Safari, Chrome) y Android sin requerir la descarga de ninguna app externa.',
    },
    {
      question: '¿Hay un límite de peso por archivo?',
      answer:
        'El tamaño máximo por documento es de 50 MB, suficiente para tesis completas, informes corporativos con fotos y documentos extensos.',
    },
    {
      question: '¿Qué ocurre con mis documentos una vez finalizado el proceso?',
      answer:
        'Toda la conexión cuenta con cifrado SSL de extremo a extremo. Los archivos procesados son eliminados de forma automática y definitiva del servidor transcurrida 1 hora.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-14 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto border-t border-zinc-200/80">
      <div className="mb-10 text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200/60">
          Dudas resueltas
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Preguntas frecuentes
        </h2>
        <p className="mt-1.5 text-sm text-zinc-600">
          Todo lo que necesitas saber sobre el funcionamiento de la herramienta.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 text-sm sm:text-base hover:text-black transition-colors"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <div
                  className={`w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-zinc-900 text-white' : 'text-zinc-600'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 animate-in fade-in duration-150">
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

'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export default function PdfToWordFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: '¿Cómo convertir PDF a Word gratis y sin perder formato?',
      answer:
        'Arrastra tu documento PDF a nuestra herramienta o selecciónalo desde tu ordenador o móvil. El conversor analiza y reproduce la estructura original (títulos, fuentes, tablas, listas y párrafos) generando un archivo Microsoft Word (.docx) 100% editable sin costo alguno ni marcas de agua.',
    },
    {
      question: '¿El archivo Word resultante es verdaderamente editable?',
      answer:
        'Sí. A diferencia de convertidores básicos que solo insertan imágenes en páginas en blanco, nuestro motor genera código OpenXML nativo para Word. Podrás modificar cualquier frase, cambiar tipografías, reestructurar tablas y editar todo el contenido tanto en Microsoft Word como en Google Docs.',
    },
    {
      question: '¿Puedo convertir documentos PDF escaneados con texto en imágenes (OCR)?',
      answer:
        'Sí. Nuestro sistema detecta automáticamente si el documento PDF contiene páginas escaneadas o fotografías de texto. En ese caso, aplica Reconocimiento Óptico de Caracteres (OCR) para extraer el texto y transformarlo en contenido editable en tu archivo DOCX.',
    },
    {
      question: '¿Qué hago si mi PDF está protegido con contraseña?',
      answer:
        'Si tu archivo cuenta con clave de apertura o restricciones de lectura, el sistema te solicitará la contraseña. Una vez ingresada, se descifra en memoria de manera estrictamente confidencial para completar la conversión. Nunca guardamos ni registramos tus contraseñas.',
    },
    {
      question: '¿Puedo rotar, reordenar o eliminar páginas antes de convertir?',
      answer:
        'Sí. Gracias a nuestro Organizador de Páginas integrado, puedes girar cualquier página en 90°, cambiar el orden correlativo de las hojas o eliminar páginas prescindibles para que solo se procesen las secciones que realmente necesitas.',
    },
    {
      question: '¿Es seguro convertir documentos confidenciales en esta plataforma?',
      answer:
        'Absolutamente. La transmisión se realiza mediante cifrado SSL/TLS de 256 bits. Cada documento se procesa en una carpeta temporal con identificador UUID único y se elimina de forma automática e irreversible del servidor tras una hora.',
    },
    {
      question: '¿Puedo convertir varios archivos PDF a la vez y descargarlos en ZIP?',
      answer:
        'Sí. Puedes cargar múltiples documentos simultáneamente. El sistema procesa los archivos en cola con control de concurrencia y te permite descargarlos individualmente con nombre personalizado o todos juntos en un solo archivo comprimido ZIP.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section id="faq-section" className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mb-6 text-left">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
          Preguntas frecuentes
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Respuestas a las dudas más comunes sobre la conversión, compatibilidad y seguridad.
        </p>
      </div>

      <div className="divide-y divide-slate-200/80 border-y border-slate-200/80">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-3.5">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full text-left flex items-center justify-between gap-4 py-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium text-slate-900 pr-2">
                  {faq.question}
                </span>
                <span
                  className={`w-5 h-5 flex items-center justify-center shrink-0 text-slate-400 transition-transform duration-150 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4 stroke-[2]" />
                </span>
              </button>

              {isOpen && (
                <div className="pt-2 pb-1 text-xs sm:text-sm text-slate-600 leading-relaxed pr-6">
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

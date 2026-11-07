'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FaqItem } from '@/lib/types';

export default function PdfToPptFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: '¿Cómo convertir un PDF a PPT gratis?',
      answer:
        'Solo tienes que arrastrar tu archivo PDF a la zona de carga de esta página o hacer clic en "Seleccionar archivos". Elige tus preferencias de conversión (Modo Editable o Alta Fidelidad) y haz clic en "Convertir a PPT". En pocos segundos tu archivo PPTX estará listo para descargar sin necesidad de registros ni suscripciones.',
    },
    {
      question: '¿Puedo convertir un PDF a PowerPoint editable?',
      answer:
        'Sí. Nuestro convertidor cuenta con un Modo Editable específico que analiza las cajas de texto, fuentes, tamaños y colores del PDF para recrear cuadros de texto nativos en PowerPoint. De este modo, al abrir la presentación en Microsoft PowerPoint o Google Slides, podrás hacer clic en el texto y editarlo directamente.',
    },
    {
      question: '¿Cómo convertir un PDF a PPT sin perder el formato?',
      answer:
        'Para documentos con diseños gráficos avanzados, fórmulas matemáticas o tipografías especiales, recomendamos seleccionar el "Modo Alta Fidelidad". Este modo renderiza cada diapositiva con precisión fotográfica 1:1, asegurando que los márgenes, gráficos vectoriales y alineaciones se conserven con exactitud.',
    },
    {
      question: '¿Puedo convertir páginas específicas o un rango de páginas?',
      answer:
        'Por supuesto. En el panel de configuración puedes seleccionar "Rango personalizado" e indicar qué diapositivas deseas extraer (por ejemplo: 1-5, 8, 12-15). La herramienta validará automáticamente que el rango exista dentro del documento para evitar errores.',
    },
    {
      question: '¿Puedo convertir varios PDF a PPT al mismo tiempo?',
      answer:
        'Sí, nuestra plataforma admite conversiones por lotes (batch processing). Puedes subir múltiples documentos PDF a la vez; cada archivo se procesará de forma individual y podrás descargarlos por separado o juntos en un único archivo comprimido ZIP.',
    },
    {
      question: '¿Es seguro convertir archivos PDF online en esta plataforma?',
      answer:
        'Totalmente. Toda la transferencia de datos se realiza a través de conexiones seguras y cifradas mediante SSL/TLS. Los archivos temporales se aíslan en carpetas seguras y se eliminan automáticamente del servidor 1 hora después del procesamiento. Nunca leemos, almacenamos ni compartimos tus documentos.',
    },
    {
      question: '¿Necesito instalar algún programa en mi ordenador o móvil?',
      answer:
        'No, el conversor funciona 100% en la nube y dentro de tu navegador web. Es compatible con Windows, Mac, Linux, Android e iOS sin necesidad de instalar extensiones ni programas adicionales.',
    },
    {
      question: '¿Qué formato tiene el archivo convertido?',
      answer:
        'El archivo generado es un documento genuino en formato .pptx (Microsoft PowerPoint Presentation OpenXML), totalmente compatible con Microsoft PowerPoint 2007 en adelante, Google Slides, LibreOffice Impress y Apple Keynote.',
    },
    {
      question: '¿Qué ocurre si mi archivo PDF está protegido con contraseña?',
      answer:
        'Si tu PDF cuenta con contraseña de apertura, el sistema lo detectará automáticamente y te solicitará la clave para desbloquear el contenido y realizar la conversión. La contraseña no se almacena y se utiliza únicamente para procesar tu archivo de forma segura.',
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq-section" className="py-12 px-4 max-w-3xl mx-auto border-t border-slate-200/80">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[11px] font-semibold text-blue-700 mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Centro de Ayuda</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Preguntas frecuentes sobre convertir PDF a PPT
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
          Respuestas claras a las dudas más comunes sobre la conversión de documentos PDF a presentaciones PowerPoint.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-xl border transition-all ${
                isOpen
                  ? 'border-blue-200 bg-white shadow-xs'
                  : 'border-slate-200/90 bg-white/70 hover:bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(index)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-slate-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
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

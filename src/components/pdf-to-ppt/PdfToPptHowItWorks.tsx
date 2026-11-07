'use client';

import React from 'react';
import { UploadCloud, SlidersHorizontal, Cpu, Download } from 'lucide-react';

export default function PdfToPptHowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Sube tus archivos PDF',
      description:
        'Arrastra tu archivo PDF o haz clic en "Seleccionar archivos". Puedes subir uno o varios documentos a la vez de hasta 50 MB.',
      icon: UploadCloud,
    },
    {
      step: '02',
      title: 'Configura las opciones',
      description:
        'Elige entre el Modo Editable (para modificar textos) o Alta Fidelidad (para preservar diseño 1:1), e indica si deseas convertir páginas específicas.',
      icon: SlidersHorizontal,
    },
    {
      step: '03',
      title: 'Conversión en el servidor',
      description:
        'Nuestro motor analiza la tipografía, tablas e imágenes del PDF y las recompone como elementos nativos de Microsoft PowerPoint.',
      icon: Cpu,
    },
    {
      step: '04',
      title: 'Descarga tu archivo PPTX',
      description:
        'Obtén tu presentación lista para abrir en PowerPoint, Google Slides o Keynote. En conversiones múltiples puedes descargar todo en un archivo ZIP.',
      icon: Download,
    },
  ];

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto border-t border-slate-200/80">
      <div className="text-center mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Cómo convertir PDF a PPT online gratis
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
          Cuatro sencillos pasos para transformar cualquier documento PDF en diapositivas PowerPoint editables en segundos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-2xs relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

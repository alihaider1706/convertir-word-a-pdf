'use client';

import React from 'react';
import { UploadCloud, Sliders, Download } from 'lucide-react';

export default function JpgToPdfHowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Sube tus imágenes',
      description:
        'Arrastra y suelta tus archivos JPG, JPEG, PNG o WebP desde tu ordenador, tableta o celular, o pulsa el botón para seleccionarlos.',
      icon: UploadCloud,
      meta: 'Soporte múltiple',
    },
    {
      num: '02',
      title: 'Organiza y personaliza',
      description:
        'Reordena las fotos arrastrándolas, gíralas 90°, recorta encuadres y ajusta tamaño de página (A4, Carta), márgenes y compresión.',
      icon: Sliders,
      meta: 'Edición en vivo',
    },
    {
      num: '03',
      title: 'Convierte y descarga',
      description:
        'Genera tu archivo PDF consolidado o un archivo ZIP con PDFs individuales. Previsualiza el resultado y descarga de inmediato.',
      icon: Download,
      meta: 'Descarga instantánea',
    },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80">
      <div className="mb-8 text-left">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Cómo convertir JPG a PDF online
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Un flujo de trabajo directo y eficiente en tres fases sin instalaciones ni registros obligatorios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-lg border border-slate-200/90 bg-white shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                    {st.num}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {st.meta}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-700 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {st.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

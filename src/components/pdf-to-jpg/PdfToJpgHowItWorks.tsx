'use client';

import React from 'react';
import { UploadCloud, SlidersHorizontal, Download } from 'lucide-react';

export default function PdfToJpgHowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Sube tu archivo PDF',
      description:
        'Arrastra y suelta tu documento PDF o haz clic en seleccionar archivo. Compatible con documentos de hasta 100 MB.',
      icon: UploadCloud,
    },
    {
      number: '02',
      title: 'Ajusta calidad y páginas',
      description:
        'Elige entre 72 y 300 DPI, define la compresión JPEG y selecciona páginas completas, portadas o un rango específico.',
      icon: SlidersHorizontal,
    },
    {
      number: '03',
      title: 'Descarga tus imágenes JPG',
      description:
        'Procesamiento en segundos. Descarga cada página por separado o guarda todas las imágenes juntas en un archivo ZIP.',
      icon: Download,
    },
  ];

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto border-t border-slate-200/70">
      <div className="text-center mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Cómo convertir PDF a JPG online
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Tres pasos rápidos para extraer páginas completas de PDF en imágenes JPG de alta definición.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="p-4 rounded-lg border border-slate-200/90 bg-white shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-slate-700" />
                </div>
                <span className="text-xs font-mono font-semibold text-slate-400">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

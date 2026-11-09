import React from 'react';
import { Upload, Zap, Download } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Sube tu archivo Word',
      description: 'Arrastra y suelta tu documento .DOC o .DOCX, o selecciónalo desde tu ordenador o teléfono móvil.',
    },
    {
      number: '02',
      icon: Zap,
      title: 'Conversión instantánea',
      description: 'Nuestro motor convierte el archivo en segundos, preservando al 100% fuentes, tablas, imágenes y diseño.',
    },
    {
      number: '03',
      icon: Download,
      title: 'Descarga tu PDF listo',
      description: 'Descarga tu nuevo PDF de inmediato, organízalo, protégelo con contraseña o comprímelo gratis.',
    },
  ];

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-zinc-200/80">
      <div className="text-center max-w-xl mx-auto mb-12 sm:mb-14">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200/60">
          Proceso simple en 3 pasos
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          ¿Cómo funciona?
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Diseñado para ser rápido, sin configuraciones complejas y totalmente directo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-7 shadow-2xs hover:border-zinc-300 hover:shadow-xs transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/70 flex items-center justify-center text-zinc-900">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200/60">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

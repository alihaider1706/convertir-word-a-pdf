import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: '1. Selecciona tu archivo Word',
      description: 'Sube tu documento en formato DOC o DOCX desde tu ordenador o teléfono móvil.',
    },
    {
      number: '2',
      title: '2. Convierte tu documento a PDF',
      description: 'El motor procesa el documento en segundos preservando estilos, fuentes y tablas.',
    },
    {
      number: '3',
      title: '3. Descarga tu archivo PDF',
      description: 'Guarda tu nuevo archivo PDF listo para compartir, imprimir o visualizar online.',
    },
  ];

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto border-t border-slate-200/70">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          ¿Cómo convertir Word a PDF?
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          Tres sencillos pasos para transformar tus documentos DOC y DOCX en PDF de alta fidelidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-start md:items-center text-left md:text-center">
            {/* Number indicator */}
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-sm flex items-center justify-center mb-3">
              {step.number}
            </div>
            {/* Step title */}
            <h3 className="text-base font-semibold text-slate-900 mb-1.5">
              {step.title}
            </h3>
            {/* Short description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

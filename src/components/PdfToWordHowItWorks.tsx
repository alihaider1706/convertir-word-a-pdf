import React from 'react';
import { Upload, Cpu, Download } from 'lucide-react';

export default function PdfToWordHowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Carga de documentos',
      description:
        'Selecciona o arrastra tus archivos PDF. Puedes procesar un único archivo o gestionar múltiples documentos en lote.',
      icon: Upload,
    },
    {
      step: '02',
      title: 'Extracción y maquetación',
      description:
        'El sistema analiza la estructura del documento, reconstruyendo tablas, estilos tipográficos y aplicando OCR si detecta escaneos.',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Descarga en formato DOCX',
      description:
        'Obtén tu archivo Microsoft Word nativo (.docx) con nombre personalizado, listo para editar en Office, Google Docs o LibreOffice.',
      icon: Download,
    },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80">
      <div className="mb-8 text-left">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
          Flujo de conversión a Microsoft Word
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Proceso automatizado en tres etapas diseñado para mantener la integridad visual y editorial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="p-5 rounded-lg border border-slate-200/80 bg-white space-y-3 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200/60 text-slate-700 flex items-center justify-center">
                    <Icon className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 font-mono">
                {idx === 0 && 'Entrada: .pdf'}
                {idx === 1 && 'Procesamiento OpenXML'}
                {idx === 2 && 'Salida: .docx'}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

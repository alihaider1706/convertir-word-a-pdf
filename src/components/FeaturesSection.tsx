import React from 'react';
import {
  Zap,
  Files,
  CheckCircle,
  FileSpreadsheet,
  MonitorSmartphone,
  ShieldCheck,
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Conversión rápida de Word a PDF',
      description:
        'Transforma tus documentos en segundos gracias a un motor de renderizado optimizado para alta velocidad.',
      icon: Zap,
    },
    {
      title: 'Compatibilidad con archivos DOC y DOCX',
      description:
        'Soporta documentos creados en cualquier versión de Word, desde DOC tradicional hasta DOCX moderno.',
      icon: Files,
    },
    {
      title: 'Conservación del formato original',
      description:
        'Mantiene las fuentes tipográficas, sangrías, párrafos, encabezados y saltos de página con total fidelidad.',
      icon: CheckCircle,
    },
    {
      title: 'Conversión de tablas e imágenes',
      description:
        'Procesa tablas estructuradas, bordes e imágenes integradas con resolución vectorial nítida.',
      icon: FileSpreadsheet,
    },
    {
      title: 'Compatible con móviles y ordenadores',
      description:
        'Accede sin restricciones desde iPhone, Android, tablets, Windows, Mac o Linux directamente desde el navegador.',
      icon: MonitorSmartphone,
    },
    {
      title: 'Protección de archivos y privacidad',
      description:
        'Tus archivos se transfieren de forma cifrada y se eliminan automáticamente del servidor transcurrida 1 hora.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto border-t border-slate-200/70">
      {/* Section Heading */}
      <div className="max-w-2xl mb-8 text-left">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Convierte documentos Word a PDF fácilmente
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          Una solución creada para ofrecer máxima fidelidad visual, rapidez y confidencialidad en tus conversiones documentales.
        </p>
      </div>

      {/* Balanced 2-Column Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-md bg-slate-100 text-blue-600 flex items-center justify-center shrink-0 border border-slate-200/80">
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

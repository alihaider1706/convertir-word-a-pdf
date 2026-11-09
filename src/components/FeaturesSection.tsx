import React from 'react';
import {
  Zap,
  Files,
  CheckCircle2,
  FileSpreadsheet,
  MonitorSmartphone,
  ShieldCheck,
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Conversión de alta velocidad',
      description:
        'Transforma tus documentos en segundos con un motor optimizado sin colas de espera ni lentitud.',
      icon: Zap,
    },
    {
      title: 'Compatibilidad DOC & DOCX',
      description:
        'Soporta archivos generados por Microsoft Word, Office 365, LibreOffice y Google Docs sin errores de lectura.',
      icon: Files,
    },
    {
      title: 'Conservación fiel del diseño',
      description:
        'Respeta con exactitud fuentes tipográficas, márgenes, sangrías, encabezados y saltos de página originales.',
      icon: CheckCircle2,
    },
    {
      title: 'Tablas, gráficos e imágenes',
      description:
        'Procesa tablas complejas, fondos y fotografías incrustadas preservando la nitidez vectorial y sin pixelar.',
      icon: FileSpreadsheet,
    },
    {
      title: 'Funciona en cualquier dispositivo',
      description:
        'Acceso directo desde tu navegador en iOS, Android, macOS, Windows o Linux sin instalar software pesado.',
      icon: MonitorSmartphone,
    },
    {
      title: 'Privacidad y borrado irreversible',
      description:
        'Conexión segura SSL/TLS de 256 bits. Los documentos se destruyen permanentemente del servidor tras 1 hora.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-zinc-200/80">
      <div className="max-w-2xl mb-12 sm:mb-14 text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200/60">
          Características Premium
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Diseñado para profesionales exigentes
        </h2>
        <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-relaxed">
          Una suite que prioriza la fidelidad visual, la velocidad de procesamiento y la seguridad de tu información.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-2xs hover:border-zinc-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/70 flex items-center justify-center text-zinc-900 mb-4">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
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

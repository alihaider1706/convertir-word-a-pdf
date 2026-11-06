import React from 'react';
import {
  FileText,
  ScanText,
  Table,
  Lock,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export default function PdfToWordFeaturesSection() {
  const capabilities = [
    {
      title: 'Estructura OpenXML estándar',
      description:
        'Genera documentos .docx con código XML compatible nativamente con Microsoft Word, Google Docs y suites ofimáticas sin pérdida de estilos.',
      icon: FileText,
    },
    {
      title: 'Reconocimiento óptico (OCR)',
      description:
        'Detecta automáticamente páginas digitalizadas o basadas en imágenes e integra un motor OCR para convertir texto estático en contenido editable.',
      icon: ScanText,
    },
    {
      title: 'Reconstrucción de tablas',
      description:
        'Interpreta celdas, bordes y encabezados tabulares, insertando tablas reales de Word en lugar de bloques de texto desalineados.',
      icon: Table,
    },
    {
      title: 'Descifrado seguro en memoria',
      description:
        'Soporte completo para PDF protegidos mediante contraseña autorizada, procesando el descifrado en memoria sin registrar contraseñas.',
      icon: Lock,
    },
    {
      title: 'Gestión previa de páginas',
      description:
        'Permite rotar páginas a 90°, reordenar la secuencia o descartar secciones antes de procesar el archivo final.',
      icon: Layers,
    },
    {
      title: 'Privacidad por diseño',
      description:
        'Aislamiento de cada solicitud en directorios temporales UUID y eliminación automática e irreversible de los archivos tras 1 hora.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80">
      <div className="mb-8 text-left">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
          Capacidades técnicas del motor
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Especificaciones de precisión, compatibilidad y seguridad implementadas en la conversión.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {capabilities.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

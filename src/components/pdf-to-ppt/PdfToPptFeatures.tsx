'use client';

import React from 'react';
import {
  FileCheck,
  Eye,
  Layers,
  Table as TableIcon,
  Archive,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';

export default function PdfToPptFeatures() {
  const features = [
    {
      icon: FileCheck,
      title: 'Texto Genuinamente Editable',
      description:
        'A diferencia de otros conversores que solo pegan capturas de pantalla, nuestra tecnología reconstruye cuadros de texto nativos, párrafos y estilos de fuente que puedes editar libremente en PowerPoint.',
      badge: 'Modo Editable',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      icon: Eye,
      title: 'Modo de Alta Fidelidad Visual',
      description:
        '¿Tienes documentos con maquetaciones complejas, gráficos vectoriales o fórmulas? El modo Alta Fidelidad renderiza cada página con nitidez absoluta y capas de texto seleccionables.',
      badge: 'Modo Fidelidad',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      icon: TableIcon,
      title: 'Tablas e Imágenes Separadas',
      description:
        'Detecta y convierte tablas en tablas nativas de PowerPoint con filas y celdas editables. Las imágenes incrustadas se conservan como objetos individuales con su proporción original.',
      badge: 'Estructura Nativa',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      icon: Layers,
      title: 'Selección de Páginas y Rangos',
      description:
        'Convierte todo el documento o selecciona únicamente las diapositivas que necesitas mediante rangos personalizados (por ejemplo, 1-5, 8, 11-14) sin procesar páginas innecesarias.',
      badge: 'Control Total',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      icon: Archive,
      title: 'Conversión por Lotes en ZIP',
      description:
        'Sube múltiples documentos PDF simultáneamente. Cada archivo se procesa de forma independiente y puedes descargarlos uno por uno o todos juntos en un único archivo comprimido ZIP.',
      badge: 'Multitarea',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      icon: ShieldCheck,
      title: 'Privacidad y Seguridad Garantizada',
      description:
        'Tus archivos se procesan en entornos seguros bajo cifrado SSL y se eliminan automáticamente tras 1 hora. Nunca almacenamos tus presentaciones ni compartimos tu información.',
      badge: '100% Confidencial',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto border-t border-slate-200/80">
      <div className="text-center mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Características de nuestro convertidor de PDF a PPT
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          Diseñado para profesionales, estudiantes y empresas que exigen presentaciones PowerPoint auténticas y completamente funcionales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                    <Icon className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-2">
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

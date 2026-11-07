'use client';

import React from 'react';
import {
  FileText,
  Presentation,
  CheckCircle,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  LayoutGrid,
} from 'lucide-react';

export default function PdfToPptContentSection() {
  return (
    <section className="py-12 px-4 max-w-4xl mx-auto space-y-16 border-t border-slate-200/80">
      {/* Section 1: Convierte PDF a PowerPoint editable */}
      <div className="space-y-6">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-semibold text-blue-700 mb-2">
            <Presentation className="w-3.5 h-3.5" />
            <span>Presentaciones Reales y Editables</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Convierte PDF a PowerPoint editable
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
            A diferencia de herramientas convencionales que simplemente insertan capturas de imagen estáticas dentro de un archivo PPTX, nuestra plataforma realiza una descomposición estructural inteligente del documento PDF para ofrecerte dos modos de trabajo adaptados a tus necesidades:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Card: Modo Editable */}
          <div className="p-6 rounded-2xl border border-blue-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Opción Recomendada
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Modo Editable
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Textos, Formas y Tablas Nativas
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              El motor extrae y genera cuadros de texto flotantes con posición, tamaño tipográfico y color preservados. Al abrir la presentación en PowerPoint podrás corregir erratas, cambiar fuentes, reescribir títulos o reorganizar los párrafos con total libertad.
            </p>
            <ul className="space-y-1.5 pt-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Textos seleccionables y modificables con un clic</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Tablas nativas de PowerPoint con celdas y filas</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Imágenes incrustadas separadas y redimensionables</span>
              </li>
            </ul>
          </div>

          {/* Card: Modo Alta Fidelidad */}
          <div className="p-6 rounded-2xl border border-purple-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Diseño Idéntico 1:1
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Alta Fidelidad
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Preservación Visual Absoluta
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ideal para folletos, informes financieros con diagramas complejos, fórmulas científicas o catálogos vectoriales. Renderiza cada diapositiva en alta resolución fotográfica (150-300 DPI) manteniendo capas de búsqueda para que no se pierda ni un píxel del diseño original.
            </p>
            <ul className="space-y-1.5 pt-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Diseño visual 100% idéntico al documento original</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Soporta gráficos complejos, transparencias y vectores</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Excelente para proyectar en pantallas de gran formato</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong className="text-slate-800">Nota sobre limitaciones técnicas:</strong> Debido a las diferencias inherentes entre la especificación tipográfica de un documento PDF fijo y el formato de flujo libre de PowerPoint, algunos elementos vectoriales propietarios o fuentes no instaladas en tu sistema operativo pueden ser reemplazados por tipografías equivalentes del sistema (como Calibri o Arial) para garantizar la compatibilidad al abrir el archivo.
          </p>
        </div>
      </div>

      {/* Section 2: Cómo funciona la conversión de PDF a PowerPoint */}
      <div className="space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cómo funciona la conversión de PDF a PowerPoint
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-3xl">
            El proceso de transformación combina análisis sintáctico de documentos y generación de esquemas OpenXML de Microsoft Office:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">Análisis y Segmentación</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              El motor inspecciona las tablas de objetos del PDF, delimitando coordenadas de párrafos, bloques de texto, tablas tabulares y mapas de bits.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">Mapeo de Diapositivas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calcula la relación de aspecto exacta de cada página para crear diapositivas que conserven la escala original sin distorsiones ni cortes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">Compilación PPTX</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Empaqueta los elementos en la estructura comprimida oficial PresentationML (.pptx), lista para su edición inmediata sin advertencias de compatibilidad.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Ventajas de convertir PDF a PPT */}
      <div className="space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Ventajas de convertir PDF a PPT
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-3xl">
            Transformar un informe o documento estático en diapositivas de presentación ofrece beneficios inmediatos para la productividad:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Presentaciones Dinámicas</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Añade transiciones, animaciones, notas del orador y efectos visuales imposibles de ejecutar en un lector de documentos PDF estático.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Colaboración en Equipo</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Comparte el archivo resultante en Google Slides o Microsoft Teams para que tus compañeros puedan editar y añadir contenido en tiempo real.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Reutilización de Contenido</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Aprovecha gráficos, tablas numéricas y textos clave de informes extensos para incluirlos directamente en tus reuniones de negocio sin volver a teclear.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Flexibilidad de Formato</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Adapta el orden de las diapositivas, oculta páginas secundarias y ajusta la orientación panorámica para exposiciones profesionales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

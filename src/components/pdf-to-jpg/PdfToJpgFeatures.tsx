'use client';

import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Sliders,
  Archive,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Smartphone,
  Zap,
} from 'lucide-react';

export default function PdfToJpgFeatures() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-12 border-t border-slate-200/70">
      {/* SECTION 1: Convierte todas las páginas de PDF a imágenes */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Convierte todas las páginas de PDF a imágenes
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          A diferencia de otras herramientas que solo capturan la primera página o generan capturas borrosas, nuestro motor procesa el documento PDF completo de manera secuencial. Si subes un documento de 10 páginas, obtendrás exactamente 10 archivos JPG nítidos e independientes, conservando vectores, tipografías originales, diagramas y fotografías con exactitud milimétrica.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
              Proporción original 1:1
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Respetamos las dimensiones exactas de cada página (A4, Carta, Legal o formatos personalizados) sin deformación ni estiramiento.
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
              Selección selectiva de páginas
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ¿Solo necesitas algunas páginas? Ingresa rangos como &ldquo;1-5&rdquo; o &ldquo;2,4,7&rdquo; o selecciónalas visualmente con un clic.
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
              Fondo blanco automático
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Las transparencias nativas del PDF se procesan automáticamente sobre un lienzo blanco sólido para garantizar visibilidad en cualquier visor.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Características de nuestro conversor PDF a JPG */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Características de nuestro conversor PDF a JPG
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          Diseñado bajo los estándares de las aplicaciones SaaS modernas: ligero, sin publicidad intrusiva y enfocado en la productividad.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
          <div className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900 mb-0.5">
              Privacidad garantizada
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              La conversión se ejecuta íntegramente en la memoria de tu navegador mediante HTML5 Canvas y PDF.js. Tus archivos nunca viajan a servidores externos.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
              <Zap className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900 mb-0.5">
              Velocidad instantánea
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sin colas de procesamiento ni límites artificiales de tiempo. Los documentos se renderizan directamente utilizando la potencia de tu procesador.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
              <Sliders className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900 mb-0.5">
              Control granular de calidad
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ajusta la resolución entre 72 y 300 DPI y la compresión JPEG según si necesitas enviar imágenes ligeras por email o imprimir en alta definición.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
              <Smartphone className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900 mb-0.5">
              100% Móvil y táctil
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Diseño adaptable optimizado para teléfonos Android, iPhone, iPad y computadoras de escritorio con selector táctil fluido.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Elige la calidad y resolución de tus imágenes */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Elige la calidad y resolución de tus imágenes
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          Diferentes propósitos requieren diferentes equilibrios entre resolución visual y tamaño de archivo. Te ofrecemos opciones claras para cada necesidad:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs space-y-1">
            <div className="text-[11px] font-mono font-semibold text-slate-500">
              72 - 96 DPI
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              Uso web y correo electrónico
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Produce archivos JPG livianos, ideales para compartir por WhatsApp, adjuntar a correos o publicar en blogs y redes sociales sin sobrecargar almacenamiento.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-blue-500/80 bg-blue-50/20 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-blue-700">
              <span>150 - 200 DPI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100">
                Recomendado
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              Lectura y presentaciones
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              El equilibrio idóneo entre máxima legibilidad de tipografías pequeñas y un tamaño de archivo perfectamente manejable en cualquier plataforma.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs space-y-1">
            <div className="text-[11px] font-mono font-semibold text-slate-500">
              300 DPI
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              Impresión y archivo profesional
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Renderizado de densidad gráfica profesional para planos arquitectónicos, catálogos artísticos o documentos legales que deban imprimirse en papel fotográfico.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: Descarga imágenes JPG individualmente o en ZIP */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Descarga imágenes JPG individualmente o en ZIP
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          Te proporcionamos total flexibilidad para acceder a tus imágenes convertidas como mejor se adapte a tu flujo de trabajo:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs space-y-1">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              Descarga individual página por página
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cada imagen cuenta con un botón directo de descarga y vista previa ampliable. Si solo requieres la página de firmas o un gráfico específico, puedes descargarlo al instante con un solo clic sin tener que bajar las demás.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs space-y-1">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              Paquete ZIP comprimido con nombres limpios
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Con el botón &ldquo;Descargar todas en ZIP&rdquo;, empaquetamos todas las páginas convertidas en un archivo comprimido estándar. Los nombres siguen una estructura clara como <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">documento-pagina-1.jpg</code> para facilitar su clasificación.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Formatos y compatibilidad */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Formatos y compatibilidad
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          Nuestra plataforma admite documentos PDF generados por cualquier aplicación de software moderna:
        </p>

        <div className="p-4 rounded-lg border border-slate-200/90 bg-slate-50/50 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-0.5">Estándares PDF soportados</h4>
            <p className="text-slate-500 leading-relaxed">
              Compatible con PDF 1.3 hasta PDF 2.0, PDF/A (archivo a largo plazo), documentos escaneados con texto OCR, formularios rellenados y documentos vectoriales de Adobe Acrobat, Microsoft Word, Google Docs o LibreOffice.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-0.5">Formato de salida JPG estándar</h4>
            <p className="text-slate-500 leading-relaxed">
              Genera imágenes JPEG codificadas bajo el estándar JFIF con espacio de color sRGB, 100% legibles en Windows, macOS, Linux, iOS, Android, Photoshop, Word y cualquier navegador web actual.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

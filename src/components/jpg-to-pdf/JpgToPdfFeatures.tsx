'use client';

import React from 'react';
import {
  Layers,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  Sparkles,
  Maximize2,
  FileCheck,
  Lock,
} from 'lucide-react';

export default function JpgToPdfFeatures() {
  const capabilities = [
    {
      title: 'Preservación de resolución y relación de aspecto',
      description:
        'El motor de procesamiento calcula las proporciones exactas de cada fotografía para evitar estiramientos o distorsiones, conservando la nitidez tanto en pantalla como en impresiones físicas.',
      icon: Maximize2,
    },
    {
      title: 'Seguridad y cifrado AES-256 opcional',
      description:
        'Protege tus documentos confidenciales mediante contraseña con cifrado estándar de la industria. Tus archivos se procesan en tu propio navegador sin quedar almacenados en servidores externos.',
      icon: Lock,
    },
    {
      title: 'Control de márgenes y geometría',
      description:
        'Elige entre diseño sin márgenes borde a borde, márgenes estándar de 12.7 mm para encuadernación o valores personalizados según las directrices de tu proyecto.',
      icon: SlidersHorizontal,
    },
    {
      title: 'Empaquetado en ZIP y descargas individuales',
      description:
        'Además de combinar fotos en un solo tomo encuadernado, puedes generar un PDF independiente por cada imagen y descargarlas todas juntas comprimidas en ZIP.',
      icon: FileCheck,
    },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80 space-y-12">
      {/* 1. Main Features Heading */}
      <div>
        <div className="mb-6 text-left">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Características de nuestro conversor JPG a PDF
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Diseñado para ofrecer precisión gráfica profesional, rapidez de ejecución y control total sobre el documento final.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-lg border border-slate-200/90 bg-white shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-700 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Convierte varias imágenes en un solo PDF */}
      <div className="p-6 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2">
          Convierte varias imágenes en un solo PDF
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Ya sea que necesites recopilar recibos de gastos, escanear contratos de varias páginas, armar un catálogo fotográfico de productos o preparar una presentación, nuestro conversor te permite unir decenas de fotos en un único documento digital. Gracias a la cuadrícula de organización interactiva, puedes arrastrar y soltar las imágenes para ordenar las páginas exactamente como deseas que aparezcan en el PDF resultante.
        </p>
      </div>

      {/* 3. Ajusta el tamaño y la orientación de las páginas */}
      <div className="p-6 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2">
          Ajusta el tamaño y la orientación de las páginas
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
          No todas las imágenes tienen las mismas proporciones. Por eso, puedes seleccionar estándares internacionales de impresión como <strong>A4 (210 × 297 mm)</strong>, <strong>Carta / Letter</strong>, <strong>Oficio / Legal</strong>, <strong>A3</strong> o <strong>A5</strong>.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Con la función de <strong>Orientación Automática</strong>, el sistema examina cada foto individualmente: si la imagen es horizontal (paisaje), genera una página horizontal; si es vertical (retrato), genera una página vertical. De esta manera, cada fotografía aprovecha al máximo el espacio de la hoja sin recortes indeseados.
        </p>
      </div>

      {/* 4. Convierte imágenes a PDF sin complicaciones */}
      <div className="p-6 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2">
          Convierte imágenes a PDF sin complicaciones
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
          Nuestra herramienta funciona de forma 100% online y es totalmente responsiva: puedes utilizarla desde tu computadora de escritorio, tu tableta o tu teléfono móvil (Android o iOS) directamente desde cualquier navegador web moderno, sin tener que descargar aplicaciones pesadas ni registrar una cuenta de usuario.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Las fotos se procesan en tiempo real con aceleración Canvas y algoritmos de compresión inteligente que reducen el peso en megabytes mientras mantienen los textos y detalles perfectamente legibles.
        </p>
      </div>

      {/* 5. Formatos de imagen compatibles */}
      <div className="p-6 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-3">
          Formatos de imagen compatibles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
            <h3 className="font-semibold text-slate-900 mb-1">JPG / JPEG</h3>
            <p className="text-slate-500 leading-relaxed">
              El formato estándar de cámaras digitales y celulares. Compatible con compresión adaptativa para archivos ligeros.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
            <h3 className="font-semibold text-slate-900 mb-1">PNG</h3>
            <p className="text-slate-500 leading-relaxed">
              Ideal para capturas de pantalla, esquemas e ilustraciones con fondos transparentes o bordes gráficos nítidos.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
            <h3 className="font-semibold text-slate-900 mb-1">WebP</h3>
            <p className="text-slate-500 leading-relaxed">
              El formato moderno para la web. Se decodifica y transfiere a alta resolución para una integración perfecta en el PDF.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Lock,
  ArrowRight,
  HelpCircle,
  FileCheck,
  Zap,
} from 'lucide-react';

export default function HomeSeoArticle() {
  return (
    <section className="py-14 bg-white border-t border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 inline-flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guía Oficial y Estándares de Conversión</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ¿Cómo Convertir Word a PDF Sin Perder el Formato Original?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Descubre por qué nuestra tecnología de renderizado vectorial garantiza que cada margen, fuente tipográfica, tabla e imagen se preserve con fidelidad milimétrica.
          </p>
        </div>

        {/* 3 Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Preservación de Tipografías
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Las fuentes de Microsoft Word (Arial, Calibri, Times New Roman, Roboto, etc.) se incrustan como vectores puros para evitar que el texto se mueva o cambie de tamaño en otros dispositivos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Estructura de Tablas y Márgenes
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Las columnas, sangrías francesas, encabezados y pies de página se recalculan geométricamente para garantizar que no existan saltos de página indeseados.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Imágenes en Alta Definición
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Las fotografías, gráficos de barras y diagramas SmartArt se exportan sin compresión destructiva, manteniendo la nitidez óptima para impresión comercial o lectura en pantallas Retina.
            </p>
          </div>
        </div>

        {/* In-Depth Article Text Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-slate-100">
          <div className="lg:col-span-8 space-y-6 text-sm text-slate-700 leading-relaxed">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">
                Diferencias Clave entre Archivos DOC, DOCX y PDF
              </h3>
              <p>
                Los formatos de Microsoft Word (<strong>.doc</strong> originario de 1997-2003 y <strong>.docx</strong> basado en el estándar OpenXML) son archivos de procesamiento de texto concebidos para ser editados. Esto implica que su visualización depende de las fuentes instaladas en la computadora del destinatario y de la versión de software empleada.
              </p>
              <p>
                Por el contrario, el formato <strong>PDF (Portable Document Format)</strong> es un estándar ISO (ISO 32000) de formato cerrado. Una vez que conviertes tu archivo Word en PDF, el documento se congela en un diseño visualmente inmutable: se verá con idéntica precisión en Windows, macOS, Linux, iPhone o smartphones Android sin desconfigurarse jamás.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">
                ¿Por Qué Convertir Documentos Word a PDF Antes de Enviarlos?
              </h3>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Compatibilidad Universal:</strong> El receptor no necesita tener instalado Microsoft Word ni una suscripción a Office 365 para leer el documento.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Inalterabilidad y Seguridad:</strong> Evita ediciones accidentales de presupuestos, facturas, contratos legales, tesis académicas y currículums vitae (CV).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Menor Peso y Fácil Envío:</strong> Los documentos PDF suelen pesar menos que los archivos DOCX con imágenes pesadas, facilitando su envío por correo electrónico o WhatsApp. Si necesitas reducir aún más su tamaño, puedes usar nuestro módulo de <Link href="/comprimir-pdf/" className="text-blue-600 font-semibold hover:underline">compresión de PDF</Link>.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">
                Paso a Paso: Cómo Realizar la Conversión en Línea
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-xs pl-1">
                <li><strong>Arrastra o selecciona tus archivos:</strong> Sube uno o varios archivos Word (.doc o .docx) desde tu almacenamiento local o dispositivo móvil.</li>
                <li><strong>Ajusta las opciones opcionales:</strong> Puedes previsualizar, reorganizar páginas, o activar compresión si deseas un archivo ligero.</li>
                <li><strong>Procesa y descarga:</strong> Pulsa en <em>Descargar PDF</em> o baja un archivo ZIP agrupado si convertiste un lote completo.</li>
              </ol>
            </div>
          </div>

          {/* Right 4 cols: Interlinking Hub */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200">
                Otras Herramientas Populares
              </h4>
              <nav className="space-y-2.5 text-xs font-medium">
                <Link
                  href="/pdf-a-word"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-2xs group"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Convertir PDF a Word editable</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/convertir-pdf-a-ppt/"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-2xs group"
                >
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-600" />
                    <span>Convertir PDF a PowerPoint</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/comprimir-pdf/"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-2xs group"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Comprimir PDF sin perder calidad</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/convertir-jpg-a-pdf/"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-2xs group"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>Convertir JPG a PDF</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </nav>
            </div>

            {/* Privacy Pledge Banner */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/60 rounded-2xl border border-emerald-200/80 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Garantía de Privacidad 100%</span>
              </div>
              <p className="text-[11px] text-emerald-950 leading-relaxed">
                Tus archivos nunca se leen, no se almacenan permanentemente ni se comparten. El sistema purga automáticamente todos los documentos de memoria transcurrida 1 hora.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

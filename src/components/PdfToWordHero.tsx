import React from 'react';
import { ShieldCheck, FileCheck, Lock } from 'lucide-react';

export default function PdfToWordHero() {
  return (
    <section className="pt-8 pb-4 sm:pt-10 sm:pb-5 px-4 max-w-3xl mx-auto text-center">
      {/* Category label */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 mb-3 border border-slate-200/60">
        <span>Conversión de PDF a DOCX</span>
      </div>

      {/* Main Single H1 */}
      <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
        Convertir PDF a Word
      </h1>

      {/* Subtitle */}
      <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
        Transforma tus documentos PDF en archivos Microsoft Word (.docx) completamente editables, preservando tablas, estilos tipográficos y diseño original.
      </p>

      {/* Trust & Guarantee Indicators */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Formato DOCX nativo</span>
        </span>
        <span className="flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>OCR para páginas escaneadas</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Soporte para PDF cifrados</span>
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Eliminación segura en 1 hora</span>
        </span>
      </div>
    </section>
  );
}

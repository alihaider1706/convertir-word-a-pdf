'use client';

import React from 'react';
import { Presentation, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function PdfToPptHero() {
  return (
    <section className="text-center pt-8 pb-4 px-4 max-w-3xl mx-auto">
      {/* Feature Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-semibold text-amber-800 mb-3.5 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <span>Conversión Genuina a PowerPoint (.pptx) Editable</span>
      </div>

      <h1 className="text-2xl sm:text-[34px] font-bold text-slate-900 tracking-tight leading-tight">
        Convertir PDF a PPT Gratis
      </h1>

      <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
        Convierte tus archivos PDF en presentaciones PowerPoint editables en segundos. Sube tu documento, personaliza las opciones y descarga tu archivo PPTX fácilmente.
      </p>

      {/* Trust Highlights */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Presentation className="w-3.5 h-3.5 text-amber-600" />
          <span>Diapositivas y texto 100% editables</span>
        </div>
        <span className="hidden sm:inline text-slate-300">•</span>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span>Procesamiento instantáneo</span>
        </div>
        <span className="hidden sm:inline text-slate-300">•</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sin registro y eliminación automática</span>
        </div>
      </div>
    </section>
  );
}

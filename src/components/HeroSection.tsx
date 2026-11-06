import React from 'react';
import { Shield, Zap, CheckCircle2 } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="text-center pt-8 pb-4 sm:pt-10 sm:pb-5 px-4 max-w-3xl mx-auto">
      {/* Category tag */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 mb-3 border border-slate-200/60">
        <span>Conversión de Word a PDF</span>
      </div>

      {/* Main H1 Heading */}
      <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
        Convertir Word a PDF Gratis
      </h1>

      {/* Subtitle Description */}
      <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
        Convierte tus documentos Word a PDF online de forma rápida y sencilla. Sube tu archivo DOC o DOCX y descarga tu PDF en segundos.
      </p>

      {/* Trust & Guarantee Indicators */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Formato original intacto</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Conversión instantánea</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Archivos eliminados tras 1 hora</span>
        </span>
      </div>
    </section>
  );
}

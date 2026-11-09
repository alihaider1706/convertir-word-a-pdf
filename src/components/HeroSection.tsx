import React from 'react';
import { Sparkles, Shield, Zap, CheckCircle2 } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="text-center pt-8 pb-4 sm:pt-12 sm:pb-6 px-4 max-w-4xl mx-auto">
      {/* Top pill badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-medium mb-5 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
        <span>Convertidor de DOC y DOCX a PDF nº 1</span>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        <span className="font-semibold">Sin límites de uso</span>
      </div>

      {/* Main H1 Heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
        Convertir Word a PDF Gratis
      </h1>

      {/* Subtitle Description */}
      <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
        Convierte tus documentos Word a PDF online de forma rápida y sencilla. Sube tu archivo{' '}
        <span className="font-semibold text-slate-800">DOC</span> o{' '}
        <span className="font-semibold text-slate-800">DOCX</span> y descarga tu PDF en segundos.
      </p>

      {/* Quick Trust Badges */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs sm:text-sm text-slate-600">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Formato original intacto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Conversión en 3 segundos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Archivos eliminados tras 1h</span>
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { ShieldCheck, Zap, Lock } from 'lucide-react';

export default function JpgToPdfHero() {
  return (
    <section className="pt-8 pb-4 sm:pt-10 sm:pb-5 text-center px-4 max-w-3xl mx-auto">
      {/* Category Tag */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 mb-3 border border-slate-200/60">
        <span>Conversión de Imágenes a PDF</span>
      </div>

      {/* Main Single H1 */}
      <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
        Convertir JPG a PDF Gratis Online
      </h1>

      {/* Subtitle */}
      <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
        Convierte imágenes JPG a PDF fácilmente. Combina varias fotos en un solo documento, organiza las páginas y descarga tu archivo PDF en segundos.
      </p>

      {/* Trust Indicators */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Procesamiento seguro y privado</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Sin límite de imágenes</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span>Cifrado opcional y descarga directa</span>
        </span>
      </div>
    </section>
  );
}

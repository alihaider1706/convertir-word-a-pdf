'use client';

import React from 'react';
import { ShieldCheck, Lock, Clock, CheckCircle } from 'lucide-react';

export default function SecurityBanner() {
  return (
    <section className="py-8 px-4 max-w-4xl mx-auto">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Garantía de Privacidad y Cumplimiento</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Tus documentos están 100% protegidos y confidenciales
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cifrado SSL Activo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Cifrado TLS 1.3 / 256 bits</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                La transferencia de archivos entre tu navegador y nuestros servidores viaja encriptada de punto a punto.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Eliminación en 1 hora</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Los archivos temporales se purgan de forma automática e irrecuperable de la memoria tras 60 minutos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 border border-purple-100">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Sin copias ni registros</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                No leemos, no almacenamos copias ni compartimos tu contenido con terceros bajo ninguna circunstancia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

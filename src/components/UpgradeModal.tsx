'use client';

import React from 'react';
import Link from 'next/link';
import { X, Sparkles, Check, Zap, Shield, FileArchive, ArrowRight } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-blue-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plan Pro</span>
          </div>
          
          <h3 className="text-xl font-bold tracking-tight">
            {reason || '¡Desbloquea Conversiones Ilimitadas!'}
          </h3>
          <p className="text-sm text-zinc-300 mt-1">
            Supera los límites gratuitos y convierte documentos grandes al instante con velocidad prioritaria.
          </p>
        </div>

        {/* Features comparison */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-zinc-900">Conversiones Ilimitadas:</span> Sin límites diarios ni tiempos de espera.
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <FileArchive className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-zinc-900">Archivos hasta 150 MB:</span> Convierte documentos pesados sin restricciones.
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-zinc-900">Empaquetado Batch ZIP:</span> Descarga decenas de PDFs a la vez en 1 solo clic.
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
            <span>Suscripción mensual o anual desde <strong>$4.99/mes</strong></span>
            <span className="text-[10px] bg-amber-200/60 font-bold px-2 py-0.5 rounded-md">Cancela cuando quieras</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link
              href="/precios"
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 text-white hover:bg-black font-semibold text-sm transition-all shadow-md active:scale-[0.98]"
            >
              <span>Ver Planes & Precios</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-medium text-sm transition-colors"
            >
              Continuar gratis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ShieldCheck, Lock, Trash2, Clock } from 'lucide-react';

export default function SecurityBanner() {
  return (
    <section className="py-10 px-4 max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Cifrado de grado bancario</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Toda la comunicación y carga de archivos está blindada mediante cifrado TLS 1.3 / SSL de 256 bits.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Eliminación automática en 1h</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tus documentos se eliminan de forma irreversible de nuestros servidores una hora después de su conversión.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-400/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Privacidad 100% garantizada</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Nadie tiene acceso a tus archivos. No leemos, no almacenamos copias ni compartimos tu información con terceros.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

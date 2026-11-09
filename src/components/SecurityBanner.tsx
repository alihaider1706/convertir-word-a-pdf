import React from 'react';
import { ShieldCheck, Lock, Trash2 } from 'lucide-react';

export default function SecurityBanner() {
  return (
    <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="bg-zinc-900 text-white rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden border border-zinc-800">
        <div className="relative z-10">
          <div className="max-w-xl mb-10 text-center sm:text-left">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
              Garantía de Privacidad Total
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tus documentos te pertenecen solo a ti
            </h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              No guardamos copias, no leemos tus datos ni los compartimos con ningún tercero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-zinc-850/80 border border-zinc-800/90 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Cifrado de grado bancario</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Toda la transferencia se ejecuta bajo túnel seguro TLS 1.3 con clave de 256 bits punto a punto.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-850/80 border border-zinc-800/90 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Destrucción automática en 1h</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Los archivos se purgan y borran de forma permanente e irrecuperable una hora después del proceso.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-850/80 border border-zinc-800/90 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Cero registro de datos</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sin cuentas, sin recopilación de correos ni rastreadores publicitarios intrusivos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

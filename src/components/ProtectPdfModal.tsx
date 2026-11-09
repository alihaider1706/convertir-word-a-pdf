'use client';

import React, { useState } from 'react';
import { X, Lock, Key, Download, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ConversionResult, ProtectResult } from '@/lib/types';

interface ProtectPdfModalProps {
  isOpen: boolean;
  result: ConversionResult | null;
  onClose: () => void;
}

export default function ProtectPdfModal({
  isOpen,
  result,
  onClose,
}: ProtectPdfModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [protectData, setProtectData] = useState<ProtectResult | null>(null);

  if (!isOpen || !result) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 3) {
      setErrorMessage('La contraseña debe contener al menos 3 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor, revísalas.');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/protect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: result.id,
          password,
          confirmPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al proteger el documento PDF.');
      }

      const data: ProtectResult = await res.json();
      setProtectData(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al proteger el archivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setProtectData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200/90 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="protect-modal-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="protect-modal-title" className="text-base font-extrabold text-zinc-900 tracking-tight">
                Proteger PDF con clave
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">Cifra tu archivo para restringir su apertura.</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {protectData ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900">¡PDF protegido exitosamente!</h4>
              <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto leading-relaxed">
                El documento ha sido cifrado con seguridad. Se solicitará la contraseña para poder visualizarlo.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href={protectData.downloadUrl}
                download={result.convertedName.replace(/\.pdf$/i, '_protegido.pdf')}
                className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all inline-flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF protegido</span>
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 border border-zinc-200 text-zinc-700 text-xs font-medium rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label htmlFor="p-pass" className="block text-xs font-semibold text-zinc-700 mb-1">
                Contraseña de acceso
              </label>
              <input
                id="p-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce una contraseña segura"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="p-confirm" className="block text-xs font-semibold text-zinc-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                id="p-confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <p className="text-[11px] text-zinc-400 font-medium">
              * El archivo original sin contraseña se mantendrá temporalmente en tu sesión.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-black active:scale-[0.98] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cifrando...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Cifrar documento</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

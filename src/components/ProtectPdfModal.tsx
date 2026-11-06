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
      setErrorMessage('Las contraseñas no coinciden. Por favor, verifícalas.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg max-w-md w-full p-5 sm:p-6 shadow-card border border-slate-200/90 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="protect-modal-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="protect-modal-title" className="text-sm sm:text-base font-bold text-slate-900">
                Proteger PDF con contraseña
              </h3>
              <p className="text-[11px] text-slate-500">Cifrado de alta seguridad para tu archivo.</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {protectData ? (
          <div className="py-5 text-center space-y-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">¡PDF protegido con éxito!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                El documento se ha cifrado correctamente. Necesitarás ingresar la contraseña para abrirlo.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href={protectData.downloadUrl}
                download={result.convertedName.replace(/\.pdf$/i, '_protegido.pdf')}
                className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF protegido</span>
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {errorMessage && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label htmlFor="p-pass" className="block text-xs font-medium text-slate-700 mb-1">
                Contraseña de apertura
              </label>
              <input
                id="p-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce la contraseña"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="p-confirm" className="block text-xs font-medium text-slate-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                id="p-confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              * El archivo original sin contraseña se mantendrá disponible en tu sesión.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cifrando...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Cifrar PDF</span>
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

'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Key, X, AlertCircle } from 'lucide-react';

interface PdfPasswordModalProps {
  isOpen: boolean;
  fileName: string;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

export default function PdfPasswordModal({
  isOpen,
  fileName,
  errorMessage,
  onClose,
  onSubmit,
}: PdfPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLocalError('Por favor ingresa la contraseña del documento PDF.');
      return;
    }
    setLocalError('');
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className="bg-white rounded-xl max-w-sm w-full shadow-xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 id="password-modal-title" className="text-sm font-semibold text-slate-900">
                Documento protegido
              </h3>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">{fileName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <p className="text-xs text-slate-500 leading-relaxed">
            Ingresa la contraseña de apertura para descifrar el documento en memoria y continuar la conversión.
          </p>

          {(errorMessage || localError) && (
            <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200/80 rounded-md text-xs text-rose-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{localError || errorMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="pdf-password-input" className="block text-xs font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="pdf-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLocalError('');
                }}
                placeholder="Contraseña del PDF..."
                autoFocus
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md pr-9 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label={showPassword ? 'Ocultar' : 'Ver'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Key className="w-3 h-3" />
              <span>Desbloquear</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

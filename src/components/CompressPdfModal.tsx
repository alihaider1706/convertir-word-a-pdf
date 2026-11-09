'use client';

import React, { useState } from 'react';
import { X, Minimize2, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConversionResult, CompressResult } from '@/lib/types';
import { formatBytes } from '@/lib/formatters';

interface CompressPdfModalProps {
  isOpen: boolean;
  result: ConversionResult | null;
  onClose: () => void;
}

export default function CompressPdfModal({
  isOpen,
  result,
  onClose,
}: CompressPdfModalProps) {
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressResult, setCompressResult] = useState<CompressResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !result) return null;

  const handleCompress = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: result.id,
          level,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al comprimir el PDF.');
      }

      const data: CompressResult = await res.json();
      setCompressResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al comprimir el archivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCompressResult(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200/90 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compress-modal-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Minimize2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="compress-modal-title" className="text-base font-extrabold text-zinc-900 tracking-tight">
                Comprimir PDF
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">Reduce el tamaño optimizando recursos internos.</p>
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

        {compressResult ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-zinc-900">
                {compressResult.reductionPercent > 0
                  ? `¡Comprimido en un ${compressResult.reductionPercent}%!`
                  : 'Documento procesado'}
              </h4>
              <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto leading-relaxed">
                {compressResult.message}
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/90 rounded-xl p-3.5 text-xs flex justify-around">
              <div>
                <span className="text-zinc-400 block text-[10px] font-mono uppercase tracking-wider">Original</span>
                <strong className="text-zinc-700 font-semibold">{formatBytes(compressResult.originalSize)}</strong>
              </div>
              <div className="border-r border-zinc-200" />
              <div>
                <span className="text-zinc-400 block text-[10px] font-mono uppercase tracking-wider">Comprimido</span>
                <strong className="text-emerald-700 font-bold">{formatBytes(compressResult.compressedSize)}</strong>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href={compressResult.downloadUrl}
                download={result.convertedName.replace(/\.pdf$/i, '_comprimido.pdf')}
                className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all inline-flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF comprimido</span>
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
          <div className="mt-4 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="text-xs text-zinc-600 font-medium">
              Tamaño del archivo: <strong className="text-zinc-900 font-bold">{formatBytes(result.pdfSize)}</strong>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">
                Nivel de compresión:
              </label>

              {[
                { id: 'low', name: 'Baja compresión', desc: 'Preserva calidad exacta sin pérdidas visuales.' },
                { id: 'medium', name: 'Compresión equilibrada (Recomendada)', desc: 'Excelente balance entre reducción y nitidez.' },
                { id: 'high', name: 'Alta compresión', desc: 'Máxima reducción de peso para envíos rápidos.' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    level === opt.id
                      ? 'border-zinc-900 bg-zinc-50 shadow-2xs'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="compress-lvl"
                    value={opt.id}
                    checked={level === opt.id}
                    onChange={() => setLevel(opt.id as any)}
                    className="mt-0.5 text-zinc-900 focus:ring-zinc-900"
                  />
                  <div>
                    <span className="block text-xs font-bold text-zinc-900">{opt.name}</span>
                    <span className="block text-[11px] text-zinc-500 mt-0.5">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCompress}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-black active:scale-[0.98] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Comprimiendo...</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Iniciar compresión</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

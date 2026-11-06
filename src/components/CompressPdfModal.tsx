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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg max-w-md w-full p-5 sm:p-6 shadow-card border border-slate-200/90 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compress-modal-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <Minimize2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="compress-modal-title" className="text-sm sm:text-base font-bold text-slate-900">
                Comprimir archivo PDF
              </h3>
              <p className="text-[11px] text-slate-500">Reduce el tamaño optimizando fuentes y streams.</p>
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

        {compressResult ? (
          <div className="py-5 text-center space-y-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {compressResult.reductionPercent > 0
                  ? `¡Comprimido en un ${compressResult.reductionPercent}%!`
                  : 'Documento procesado'}
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                {compressResult.message}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex justify-around">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Original</span>
                <strong className="text-slate-700">{formatBytes(compressResult.originalSize)}</strong>
              </div>
              <div className="border-r border-slate-200" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Comprimido</span>
                <strong className="text-blue-700">{formatBytes(compressResult.compressedSize)}</strong>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href={compressResult.downloadUrl}
                download={result.convertedName.replace(/\.pdf$/i, '_comprimido.pdf')}
                className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF comprimido</span>
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
          <div className="mt-4 space-y-4">
            {errorMessage && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="text-xs text-slate-600">
              Tamaño actual: <strong className="text-slate-800">{formatBytes(result.pdfSize)}</strong>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Nivel de compresión:
              </label>

              {[
                { id: 'low', name: 'Baja compresión', desc: 'Preserva calidad exacta sin pérdidas.' },
                { id: 'medium', name: 'Mediana compresión (Recomendada)', desc: 'Excelente equilibrio entre tamaño y calidad.' },
                { id: 'high', name: 'Alta compresión', desc: 'Máxima reducción para envío por email o web.' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start space-x-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    level === opt.id
                      ? 'border-blue-500 bg-blue-50/40'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="compress-lvl"
                    value={opt.id}
                    checked={level === opt.id}
                    onChange={() => setLevel(opt.id as any)}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block text-xs font-semibold text-slate-900">{opt.name}</span>
                    <span className="block text-[11px] text-slate-500">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCompress}
                disabled={isProcessing}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5"
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

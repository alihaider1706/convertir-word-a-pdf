'use client';

import React, { useState } from 'react';
import {
  X,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RefreshCw,
  FileCheck,
  Check,
} from 'lucide-react';
import { ConversionResult, PageOperationResult } from '@/lib/types';
import { formatBytes } from '@/lib/formatters';

interface PageManagerModalProps {
  isOpen: boolean;
  result: ConversionResult | null;
  onClose: () => void;
  onSaved?: (newResult: ConversionResult) => void;
}

export default function PageManagerModal({
  isOpen,
  result,
  onClose,
  onSaved,
}: PageManagerModalProps) {
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Initialize pages when opened
  React.useEffect(() => {
    if (result) {
      const count = result.pageCount && result.pageCount > 0 ? result.pageCount : 1;
      setPageOrder(Array.from({ length: count }, (_, i) => i));
      setRotations({});
      setDeletedPages([]);
      setErrorMessage('');
    }
  }, [result]);

  if (!isOpen || !result) return null;

  const handleRotate = (pageIdx: number) => {
    setRotations((prev) => ({
      ...prev,
      [pageIdx]: ((prev[pageIdx] || 0) + 90) % 360,
    }));
  };

  const handleToggleDelete = (pageIdx: number) => {
    if (deletedPages.includes(pageIdx)) {
      setDeletedPages((prev) => prev.filter((p) => p !== pageIdx));
    } else {
      if (pageOrder.length - deletedPages.length <= 1) {
        setErrorMessage('El PDF debe conservar al menos una página.');
        return;
      }
      setDeletedPages((prev) => [...prev, pageIdx]);
    }
  };

  const handleMoveLeft = (currentPos: number) => {
    if (currentPos <= 0) return;
    const newOrder = [...pageOrder];
    const temp = newOrder[currentPos];
    newOrder[currentPos] = newOrder[currentPos - 1];
    newOrder[currentPos - 1] = temp;
    setPageOrder(newOrder);
  };

  const handleMoveRight = (currentPos: number) => {
    if (currentPos >= pageOrder.length - 1) return;
    const newOrder = [...pageOrder];
    const temp = newOrder[currentPos];
    newOrder[currentPos] = newOrder[currentPos + 1];
    newOrder[currentPos + 1] = temp;
    setPageOrder(newOrder);
  };

  const handleReset = () => {
    const count = result.pageCount && result.pageCount > 0 ? result.pageCount : 1;
    setPageOrder(Array.from({ length: count }, (_, i) => i));
    setRotations({});
    setDeletedPages([]);
    setErrorMessage('');
  };

  const handleSaveAndDownload = async () => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: result.id,
          pageOrder,
          rotations,
          deletedPages,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar cambios de páginas.');
      }

      const data: PageOperationResult & { pdfName: string } = await res.json();

      // Trigger automatic download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.pdfName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onSaved) {
        onSaved({
          ...result,
          id: data.id,
          convertedName: data.pdfName,
          pdfSize: data.newSize,
          pageCount: data.pageCount,
          downloadUrl: data.downloadUrl,
          previewUrl: data.previewUrl,
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar las páginas.');
    } finally {
      setIsSaving(false);
    }
  };

  const remainingCount = pageOrder.length - deletedPages.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] shadow-card border border-slate-200/90 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="page-manager-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 id="page-manager-title" className="text-sm sm:text-base font-bold text-slate-900">
              Organizar páginas del PDF
            </h3>
            <p className="text-xs text-slate-500">
              Gira, reordena o elimina páginas de tu documento antes de descargarlo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors"
            aria-label="Cerrar organizador"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="px-5 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Pages Grid */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pageOrder.map((pageIdx, position) => {
              const rotation = rotations[pageIdx] || 0;
              const isDeleted = deletedPages.includes(pageIdx);

              return (
                <div
                  key={pageIdx}
                  className={`border rounded-lg p-3 bg-white transition-all flex flex-col justify-between ${
                    isDeleted
                      ? 'opacity-40 border-dashed border-rose-300 bg-rose-50/30'
                      : 'border-slate-200 shadow-2xs hover:border-blue-400'
                  }`}
                >
                  {/* Top Bar with Page Number and Delete */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      Pág. {pageIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleDelete(pageIdx)}
                      className={`p-1 rounded text-xs transition-colors ${
                        isDeleted
                          ? 'text-rose-600 bg-rose-100 font-bold'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                      title={isDeleted ? 'Restaurar página' : 'Eliminar página'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail Mock / Canvas Preview representation */}
                  <div className="h-32 bg-slate-100 border border-slate-200 rounded flex flex-col items-center justify-center p-2 text-center overflow-hidden my-1 relative">
                    <div
                      className="w-16 h-22 bg-white border border-slate-300 shadow-2xs rounded-xs flex flex-col items-center justify-center transition-transform duration-200"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      <span className="text-[10px] font-mono text-slate-400 select-none">
                        #{pageIdx + 1}
                      </span>
                      {rotation > 0 && (
                        <span className="text-[8px] font-bold text-blue-600">
                          {rotation}°
                        </span>
                      )}
                    </div>

                    {isDeleted && (
                      <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-2xs flex items-center justify-center">
                        <span className="text-xs font-bold text-rose-700 bg-white px-2 py-0.5 rounded shadow-xs">
                          Eliminada
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Controls: Rotate & Reorder */}
                  {!isDeleted ? (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(position)}
                        disabled={position === 0}
                        className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20"
                        title="Mover a la izquierda"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRotate(pageIdx)}
                        className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50 transition-colors"
                        title="Girar 90° a la derecha"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveRight(position)}
                        disabled={position === pageOrder.length - 1}
                        className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20"
                        title="Mover a la derecha"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleDelete(pageIdx)}
                      className="w-full text-center text-[11px] font-semibold text-rose-600 hover:text-rose-800 pt-2 border-t border-slate-100 mt-1"
                    >
                      Deshacer eliminación
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span>
              Páginas activas: <strong className="text-slate-800">{remainingCount}</strong>
            </span>
            {deletedPages.length > 0 && (
              <span className="text-rose-600">
                ({deletedPages.length} {deletedPages.length === 1 ? 'eliminada' : 'eliminadas'})
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-500 hover:text-slate-800 underline underline-offset-2 ml-2"
            >
              Restablecer todo
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndDownload}
              disabled={isSaving || remainingCount <= 0}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-md shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Guardar y Descargar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

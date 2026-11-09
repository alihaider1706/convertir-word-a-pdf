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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-zinc-200/90 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="page-manager-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/70">
          <div>
            <h3 id="page-manager-title" className="text-base font-extrabold text-zinc-900 tracking-tight">
              Organizar páginas del PDF
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Gira, reordena o elimina páginas visualmente antes de descargar tu documento.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
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

        {/* Pages Grid (WrongPDF Thumbnail Workspace) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-zinc-50/40">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pageOrder.map((pageIdx, position) => {
              const rotation = rotations[pageIdx] || 0;
              const isDeleted = deletedPages.includes(pageIdx);

              return (
                <div
                  key={pageIdx}
                  className={`border rounded-xl p-3 bg-white transition-all flex flex-col justify-between shadow-2xs ${
                    isDeleted
                      ? 'opacity-40 border-dashed border-rose-300 bg-rose-50/30'
                      : 'border-zinc-200 hover:border-zinc-400 hover:shadow-xs'
                  }`}
                >
                  {/* Top Bar with Page Number and Delete */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/60">
                      Pág. {pageIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleDelete(pageIdx)}
                      className={`p-1 rounded-md text-xs transition-colors ${
                        isDeleted
                          ? 'text-rose-600 bg-rose-100 font-bold'
                          : 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title={isDeleted ? 'Restaurar página' : 'Eliminar página'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail Representation */}
                  <div className="h-32 bg-zinc-50 border border-zinc-200/80 rounded-lg flex flex-col items-center justify-center p-2 text-center overflow-hidden my-1 relative">
                    <div
                      className="w-16 h-22 bg-white border border-zinc-300 shadow-2xs rounded-sm flex flex-col items-center justify-center transition-transform duration-200"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      <span className="text-[10px] font-mono text-zinc-400 select-none">
                        #{pageIdx + 1}
                      </span>
                      {rotation > 0 && (
                        <span className="text-[9px] font-mono font-bold text-zinc-900 bg-zinc-100 px-1 rounded mt-1">
                          {rotation}°
                        </span>
                      )}
                    </div>

                    {isDeleted && (
                      <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-2xs flex items-center justify-center">
                        <span className="text-xs font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md shadow-xs">
                          Eliminada
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Controls: Rotate & Reorder */}
                  {!isDeleted ? (
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 mt-1">
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(position)}
                        disabled={position === 0}
                        className="p-1 text-zinc-500 hover:text-zinc-900 disabled:opacity-20"
                        title="Mover a la izquierda"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRotate(pageIdx)}
                        className="p-1 text-zinc-700 hover:text-black rounded-md hover:bg-zinc-100 transition-colors"
                        title="Girar 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveRight(position)}
                        disabled={position === pageOrder.length - 1}
                        className="p-1 text-zinc-500 hover:text-zinc-900 disabled:opacity-20"
                        title="Mover a la derecha"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleDelete(pageIdx)}
                      className="w-full text-center text-[11px] font-semibold text-rose-600 hover:text-rose-800 pt-2 border-t border-zinc-100 mt-1"
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
        <div className="px-5 sm:px-6 py-3.5 border-t border-zinc-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-zinc-500 font-medium">
            <span>
              Páginas activas: <strong className="text-zinc-900">{remainingCount}</strong>
            </span>
            {deletedPages.length > 0 && (
              <span className="text-rose-600">
                ({deletedPages.length} {deletedPages.length === 1 ? 'eliminada' : 'eliminadas'})
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-zinc-400 hover:text-zinc-900 underline underline-offset-2 ml-2"
            >
              Restablecer orden
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 rounded-xl text-zinc-700 hover:bg-zinc-100 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndDownload}
              disabled={isSaving || remainingCount <= 0}
              className="px-5 py-2 bg-zinc-900 hover:bg-black disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
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

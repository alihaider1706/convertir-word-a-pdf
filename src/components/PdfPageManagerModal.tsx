'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Check,
  Undo2,
  Layers,
  AlertCircle,
} from 'lucide-react';

interface PdfPageManagerModalProps {
  isOpen: boolean;
  fileName: string;
  initialPageCount: number;
  initialRotations?: Record<number, number>;
  initialDeletedPages?: number[];
  initialPageOrder?: number[];
  onClose: () => void;
  onApply: (settings: {
    rotations: Record<number, number>;
    deletedPages: number[];
    pageOrder: number[];
  }) => void;
}

export default function PdfPageManagerModal({
  isOpen,
  fileName,
  initialPageCount,
  initialRotations,
  initialDeletedPages,
  initialPageOrder,
  onClose,
  onApply,
}: PdfPageManagerModalProps) {
  const [pageCount, setPageCount] = useState<number>(initialPageCount || 1);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const count = initialPageCount > 0 ? initialPageCount : 1;
    setPageCount(count);
    if (initialPageOrder && initialPageOrder.length > 0) {
      setPageOrder([...initialPageOrder]);
    } else {
      setPageOrder(Array.from({ length: count }, (_, i) => i));
    }
    setRotations(initialRotations ? { ...initialRotations } : {});
    setDeletedPages(initialDeletedPages ? [...initialDeletedPages] : []);
    setErrorMessage('');
  }, [isOpen, initialPageCount, initialRotations, initialDeletedPages, initialPageOrder]);

  if (!isOpen) return null;

  const handleRotate = (pageIdx: number) => {
    setRotations((prev) => ({
      ...prev,
      [pageIdx]: ((prev[pageIdx] || 0) + 90) % 360,
    }));
  };

  const handleToggleDelete = (pageIdx: number) => {
    if (deletedPages.includes(pageIdx)) {
      setDeletedPages((prev) => prev.filter((p) => p !== pageIdx));
      setErrorMessage('');
    } else {
      if (pageOrder.length - deletedPages.length <= 1) {
        setErrorMessage('El documento debe conservar al menos una página para la conversión.');
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
    setPageOrder(Array.from({ length: pageCount }, (_, i) => i));
    setRotations({});
    setDeletedPages([]);
    setErrorMessage('');
  };

  const handleApply = () => {
    onApply({
      rotations,
      deletedPages,
      pageOrder,
    });
    onClose();
  };

  const activePagesCount = pageOrder.length - deletedPages.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] shadow-xl border border-slate-200 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="page-manager-title"
      >
        {/* Header - Clean, professional header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 id="page-manager-title" className="text-sm font-semibold text-slate-900">
                Organizador de páginas
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-sm">
                {fileName} • {activePagesCount} de {pageCount} páginas seleccionadas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar bar */}
        <div className="flex items-center justify-between px-5 py-2 bg-slate-50 border-b border-slate-100 text-xs">
          <span className="text-slate-500">
            Rota, reordena o excluye páginas antes de procesar el archivo Word.
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Restablecer</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mx-5 mt-3 p-3 bg-rose-50 border border-rose-200/80 rounded-md text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Page Grid */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-50/40">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {pageOrder.map((pageIdx, currentPosition) => {
              const isDeleted = deletedPages.includes(pageIdx);
              const rotation = rotations[pageIdx] || 0;

              return (
                <div
                  key={`page-${pageIdx}`}
                  className={`rounded-lg border p-2.5 flex flex-col items-center transition-all bg-white ${
                    isDeleted
                      ? 'border-rose-200 bg-rose-50/40 opacity-50'
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Position Badge */}
                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                    <span>Pág. {pageIdx + 1}</span>
                    {rotation > 0 && (
                      <span className="text-[10px] text-blue-600 font-medium">
                        {rotation}°
                      </span>
                    )}
                  </div>

                  {/* Page Visual Canvas Representation */}
                  <div className="w-full aspect-3/4 bg-slate-100/60 border border-slate-200/80 rounded flex items-center justify-center p-2 mb-2 relative overflow-hidden">
                    <div
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: 'transform 0.15s ease',
                      }}
                      className="w-full h-full flex flex-col items-center justify-center bg-white shadow-2xs rounded border border-slate-150 p-2 text-slate-400"
                    >
                      <div className="w-full h-1.5 bg-slate-200 rounded-2xs mb-1" />
                      <div className="w-3/4 h-1 bg-slate-100 rounded-2xs mb-1" />
                      <div className="w-5/6 h-1 bg-slate-100 rounded-2xs mb-2" />
                      <span className="text-[11px] font-mono text-slate-400">
                        {pageIdx + 1}
                      </span>
                    </div>

                    {isDeleted && (
                      <div className="absolute inset-0 bg-rose-900/10 backdrop-blur-2xs flex items-center justify-center text-rose-700 font-medium text-[11px]">
                        Excluida
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="w-full flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleMoveLeft(currentPosition)}
                      disabled={currentPosition === 0 || isDeleted}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100"
                      title="Mover a la izquierda"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRotate(pageIdx)}
                      disabled={isDeleted}
                      className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-20 hover:bg-slate-100"
                      title="Girar 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleDelete(pageIdx)}
                      className={`p-1 rounded transition-colors ${
                        isDeleted
                          ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title={isDeleted ? 'Restaurar página' : 'Excluir página'}
                    >
                      {isDeleted ? <Undo2 className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveRight(currentPosition)}
                      disabled={currentPosition === pageOrder.length - 1 || isDeleted}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100"
                      title="Mover a la derecha"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-white">
          <span className="text-xs text-slate-500">
            {deletedPages.length > 0
              ? `${deletedPages.length} ${deletedPages.length === 1 ? 'página excluida' : 'páginas excluidas'}`
              : 'Todas las páginas activas'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-2xs inline-flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

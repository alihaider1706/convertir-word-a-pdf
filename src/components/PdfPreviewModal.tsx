'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
} from 'lucide-react';
import { formatBytes } from '@/lib/formatters';

interface PdfPreviewModalProps {
  isOpen: boolean;
  fileName: string;
  file?: File;
  previewUrl?: string;
  downloadWordUrl?: string;
  pageCount?: number;
  onClose: () => void;
}

export default function PdfPreviewModal({
  isOpen,
  fileName,
  file,
  previewUrl,
  downloadWordUrl,
  pageCount,
  onClose,
}: PdfPreviewModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [objectUrl, setObjectUrl] = useState<string>('');

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (previewUrl) {
      setObjectUrl(previewUrl);
    }
  }, [file, previewUrl]);

  useEffect(() => {
    setCurrentPage(1);
    setZoomLevel(100);
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPages = pageCount && pageCount > 0 ? pageCount : 1;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(200, z + 25));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(50, z - 25));
  };

  const handleFitWidth = () => {
    setZoomLevel(100);
  };

  const currentPreviewSource = objectUrl
    ? `${objectUrl}#page=${currentPage}&zoom=${zoomLevel}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className="bg-white rounded-xl max-w-4xl w-full h-[88vh] shadow-xl border border-slate-200 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-preview-title"
      >
        {/* Top Control Bar - Clean, subtle studio toolbar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white gap-2">
          {/* File Name & Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-rose-50 border border-rose-200/60 text-rose-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3
                id="pdf-preview-title"
                className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-md"
                title={fileName}
              >
                {fileName}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {totalPages} {totalPages === 1 ? 'página' : 'páginas'}
              </p>
            </div>
          </div>

          {/* Navigation & Zoom */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            {/* Page Counter */}
            <div className="flex items-center border border-slate-200 rounded-md bg-slate-50 px-1 py-0.5">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                title="Página anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-700 min-w-14 text-center">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                title="Página siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center border border-slate-200 rounded-md bg-slate-50 px-1 py-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                title="Reducir"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[11px] text-slate-700 min-w-10 text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                title="Aumentar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFitWidth}
                className="p-1 text-slate-400 hover:text-slate-700 border-l border-slate-200 ml-0.5"
                title="Ajustar al 100%"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            {downloadWordUrl && (
              <a
                href={downloadWordUrl}
                download
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-md transition-colors text-xs shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Descargar Word</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors ml-1"
              aria-label="Cerrar vista previa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-100/60 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          {objectUrl ? (
            <div className="w-full h-full bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
              <iframe
                src={currentPreviewSource}
                title={`Vista previa de ${fileName}`}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">Cargando vista previa...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

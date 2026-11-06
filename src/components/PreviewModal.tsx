'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  FileCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { ConversionResult } from '@/lib/types';
import { formatBytes } from '@/lib/formatters';

interface PreviewModalProps {
  isOpen: boolean;
  result: ConversionResult | null;
  onClose: () => void;
}

export default function PreviewModal({
  isOpen,
  result,
  onClose,
}: PreviewModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!isOpen || !result) return null;

  const totalPages = result.pageCount && result.pageCount > 0 ? result.pageCount : 1;

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

  const previewSrc = `/api/download?id=${result.id}&inline=true#page=${currentPage}&zoom=${zoomLevel}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg max-w-4xl w-full h-[90vh] shadow-card border border-slate-200/90 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50 gap-2">
          {/* File Name & Info */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-rose-600 text-white flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3
                id="preview-modal-title"
                className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-md"
                title={result.convertedName}
              >
                {result.convertedName}
              </h3>
              <p className="text-[11px] text-slate-500">
                {formatBytes(result.pdfSize)} • {totalPages} {totalPages === 1 ? 'página' : 'páginas'}
              </p>
            </div>
          </div>

          {/* Page & Zoom Navigation Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs">
            {/* Page Navigation */}
            <div className="flex items-center bg-white border border-slate-200 rounded-md px-1 py-0.5">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-md px-1 py-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 text-slate-500 hover:text-slate-800"
                title="Reducir zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFitWidth}
                className="px-1.5 font-medium text-slate-700 hover:text-blue-600"
                title="Ajustar ancho (100%)"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 text-slate-500 hover:text-slate-800"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Actions: Open in new tab, download, close */}
            <a
              href={`/api/download?id=${result.id}&name=${encodeURIComponent(result.convertedName)}&inline=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-200/60 rounded text-xs transition-colors"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={`/api/download?id=${result.id}&name=${encodeURIComponent(result.convertedName)}`}
              download={result.convertedName}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium inline-flex items-center gap-1 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar</span>
            </a>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors ml-1"
              aria-label="Cerrar vista previa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-slate-100 relative">
          <iframe
            key={previewSrc}
            src={previewSrc}
            title="Vista previa del documento PDF"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, Download, FileText, Maximize2, ExternalLink } from 'lucide-react';
import { formatFileSize } from '@/lib/formatters';

interface JpgPdfPreviewModalProps {
  isOpen: boolean;
  pdfUrl: string | null;
  filename: string;
  fileSize: number;
  pageCount: number;
  onClose: () => void;
  onDownload: () => void;
}

export default function JpgPdfPreviewModal({
  isOpen,
  pdfUrl,
  filename,
  fileSize,
  pageCount,
  onClose,
  onDownload,
}: JpgPdfPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !pdfUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`bg-white rounded-lg shadow-card border border-slate-200/90 flex flex-col transition-all duration-200 overflow-hidden ${
          isFullscreen ? 'w-full h-full rounded-none' : 'max-w-4xl w-full h-[85vh]'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-preview-title"
      >
        {/* Studio Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold">
              PDF
            </div>
            <div className="truncate">
              <h3 id="pdf-preview-title" className="text-xs font-medium text-slate-100 truncate">
                {filename}
              </h3>
              <p className="text-[10px] text-slate-400">
                {pageCount} {pageCount === 1 ? 'página' : 'páginas'} • {formatFileSize(fileSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors hidden sm:inline-flex"
              title={isFullscreen ? 'Ventana estándar' : 'Pantalla completa'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onDownload}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors ml-1"
              aria-label="Cerrar visor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real PDF Viewport */}
        <div className="flex-1 bg-slate-100 relative">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full border-0"
            title="Vista previa del documento PDF"
          />
        </div>
      </div>
    </div>
  );
}

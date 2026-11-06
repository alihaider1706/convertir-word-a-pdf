'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { ConvertedJpgImage, triggerDownload } from '@/lib/pdfToJpgConverter';
import { formatBytes } from '@/lib/formatters';

interface PdfToJpgPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ConvertedJpgImage[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export default function PdfToJpgPreviewModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
}: PdfToJpgPreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [currentIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-white rounded-lg shadow-card border border-slate-200/90 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-md">
              Página {currentImage.pageNumber} de {images.length}
            </span>
            <span className="text-xs font-medium text-slate-700 truncate max-w-xs">
              {currentImage.filename}
            </span>
            <span className="text-xs text-slate-400">
              ({currentImage.width} × {currentImage.height} px • {formatBytes(currentImage.fileSize)})
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              title="Reducir zoom"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors disabled:opacity-40"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-500 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              title="Aumentar zoom"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors disabled:opacity-40"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Restablecer tamaño"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              title="Girar 90°"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              onClick={() => triggerDownload(currentImage.blob, currentImage.filename)}
              title="Descargar esta imagen"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar JPG</span>
            </button>
            <button
              onClick={onClose}
              title="Cerrar (Esc)"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="relative flex-1 min-h-[350px] overflow-auto bg-slate-900/5 p-4 flex items-center justify-center select-none">
          {currentIndex > 0 && (
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              title="Página anterior (←)"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all hover:scale-105 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            className="transition-transform duration-150 ease-out flex items-center justify-center max-w-full max-h-full shadow-lg rounded bg-white"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage.url}
              alt={currentImage.filename}
              className="max-h-[68vh] object-contain rounded"
            />
          </div>

          {currentIndex < images.length - 1 && (
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              title="Página siguiente (→)"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all hover:scale-105 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Usa las teclas de flecha izquierda/derecha para navegar entre páginas</span>
          <span>{currentIndex + 1} de {images.length} imágenes</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Crop, RotateCcw, Check, Sparkles } from 'lucide-react';
import { ImageItem } from '@/lib/jpgToPdfConverter';

interface ImageCropModalProps {
  isOpen: boolean;
  item: ImageItem | null;
  onClose: () => void;
  onSaveCrop: (itemId: string, crop: { x: number; y: number; width: number; height: number } | undefined) => void;
}

export default function ImageCropModal({
  isOpen,
  item,
  onClose,
  onSaveCrop,
}: ImageCropModalProps) {
  const [aspectPreset, setAspectPreset] = useState<'free' | '1:1' | '4:3' | '16:9' | 'a4-p' | 'a4-l'>('free');
  const [cropXPercent, setCropXPercent] = useState(0);
  const [cropYPercent, setCropYPercent] = useState(0);
  const [cropWPercent, setCropWPercent] = useState(100);
  const [cropHPercent, setCropHPercent] = useState(100);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item) return;

    if (item.crop && item.width > 0 && item.height > 0) {
      setCropXPercent(Math.round((item.crop.x / item.width) * 100));
      setCropYPercent(Math.round((item.crop.y / item.height) * 100));
      setCropWPercent(Math.round((item.crop.width / item.width) * 100));
      setCropHPercent(Math.round((item.crop.height / item.height) * 100));
    } else {
      setCropXPercent(0);
      setCropYPercent(0);
      setCropWPercent(100);
      setCropHPercent(100);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handlePresetChange = (preset: typeof aspectPreset) => {
    setAspectPreset(preset);
    if (preset === 'free') return;

    let targetRatio = 1;
    if (preset === '1:1') targetRatio = 1;
    else if (preset === '4:3') targetRatio = 4 / 3;
    else if (preset === '16:9') targetRatio = 16 / 9;
    else if (preset === 'a4-p') targetRatio = 210 / 297;
    else if (preset === 'a4-l') targetRatio = 297 / 210;

    const imgRatio = item.width / item.height;

    let newW = 100;
    let newH = 100;

    if (targetRatio > imgRatio) {
      // Width dominates, shrink height
      newH = Math.round((imgRatio / targetRatio) * 100);
      newW = 100;
    } else {
      // Height dominates, shrink width
      newW = Math.round((targetRatio / imgRatio) * 100);
      newH = 100;
    }

    setCropWPercent(newW);
    setCropHPercent(newH);
    setCropXPercent(Math.round((100 - newW) / 2));
    setCropYPercent(Math.round((100 - newH) / 2));
  };

  const handleReset = () => {
    setCropXPercent(0);
    setCropYPercent(0);
    setCropWPercent(100);
    setCropHPercent(100);
    setAspectPreset('free');
  };

  const handleSave = () => {
    if (cropWPercent >= 99 && cropHPercent >= 99 && cropXPercent === 0 && cropYPercent === 0) {
      onSaveCrop(item.id, undefined);
    } else {
      const realX = Math.round((cropXPercent / 100) * item.width);
      const realY = Math.round((cropYPercent / 100) * item.height);
      const realW = Math.round((cropWPercent / 100) * item.width);
      const realH = Math.round((cropHPercent / 100) * item.height);

      onSaveCrop(item.id, {
        x: Math.max(0, realX),
        y: Math.max(0, realY),
        width: Math.min(item.width - realX, realW),
        height: Math.min(item.height - realY, realH),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg max-w-2xl w-full p-5 shadow-card border border-slate-200/90 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 id="crop-modal-title" className="text-sm font-semibold text-slate-900">
                Recortar imagen
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">
                {item.name} • {item.width} × {item.height} px
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect Ratio Presets */}
        <div className="py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mr-1">
            Proporción:
          </span>
          {[
            { id: 'free', label: 'Libre' },
            { id: '1:1', label: '1:1 Cuadrado' },
            { id: '4:3', label: '4:3 Estándar' },
            { id: '16:9', label: '16:9 Paisaje' },
            { id: 'a4-p', label: 'A4 Vertical' },
            { id: 'a4-l', label: 'A4 Horizontal' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset.id as any)}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                aspectPreset === preset.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Image Canvas Viewport with Crop Overlay */}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-[260px] max-h-[380px] bg-slate-900 rounded-lg overflow-hidden my-3 flex items-center justify-center p-2 select-none"
        >
          <div className="relative inline-block max-w-full max-h-full">
            <img
              src={item.previewUrl}
              alt="Recorte previo"
              className="max-h-[360px] max-w-full object-contain pointer-events-none rounded"
              style={{
                transform: `rotate(${item.rotation}deg)`,
              }}
            />

            {/* Visual Crop Overlay Rectangle */}
            <div
              className="absolute border-2 border-blue-400 bg-blue-500/15 pointer-events-none transition-all duration-75"
              style={{
                left: `${cropXPercent}%`,
                top: `${cropYPercent}%`,
                width: `${cropWPercent}%`,
                height: `${cropHPercent}%`,
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
              }}
            >
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white" />
            </div>
          </div>
        </div>

        {/* Numeric / Range Precision Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
              Ancho ({cropWPercent}%)
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={cropWPercent}
              onChange={(e) => {
                const w = Number(e.target.value);
                setCropWPercent(w);
                if (cropXPercent + w > 100) {
                  setCropXPercent(100 - w);
                }
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
              Alto ({cropHPercent}%)
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={cropHPercent}
              onChange={(e) => {
                const h = Number(e.target.value);
                setCropHPercent(h);
                if (cropYPercent + h > 100) {
                  setCropYPercent(100 - h);
                }
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
              Desplazar X ({cropXPercent}%)
            </label>
            <input
              type="range"
              min="0"
              max={100 - cropWPercent}
              value={cropXPercent}
              onChange={(e) => setCropXPercent(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
              Desplazar Y ({cropYPercent}%)
            </label>
            <input
              type="range"
              min="0"
              max={100 - cropHPercent}
              value={cropYPercent}
              onChange={(e) => setCropYPercent(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restablecer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar recorte</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

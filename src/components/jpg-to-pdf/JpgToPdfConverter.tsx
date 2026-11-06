'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  FileImage,
  Trash2,
  RotateCw,
  RotateCcw,
  Crop,
  Download,
  Eye,
  Plus,
  Sliders,
  Settings,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Layers,
  Sparkles,
  Archive,
  Palette,
  Hash,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ImageItem,
  PdfConversionSettings,
  DEFAULT_SETTINGS,
  PAGE_SIZES,
  validateImageFile,
  processImageCanvas,
  generatePdfDocument,
  generateIndividualPdfsZip,
  estimateOutputSize,
  sanitizeFilename,
} from '@/lib/jpgToPdfConverter';
import { formatFileSize } from '@/lib/formatters';
import ImageCropModal from './ImageCropModal';
import JpgPdfPreviewModal from './JpgPdfPreviewModal';

export default function JpgToPdfConverter() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<PdfConversionSettings>(DEFAULT_SETTINGS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Conversion States
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Result State
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const [resultZipBlob, setResultZipBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const [resultFileSize, setResultFileSize] = useState(0);
  const [resultPageCount, setResultPageCount] = useState(0);

  // Modals
  const [cropItem, setCropItem] = useState<ImageItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetIdRef = useRef<string | null>(null);

  // Helper to load image metadata (width, height, previewUrl)
  const processUploadedFiles = async (files: FileList | File[]) => {
    setErrorMsg(null);
    const newItems: ImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Format validation
      const validation = await validateImageFile(file);
      if (!validation.valid) {
        setErrorMsg(validation.error || `El archivo ${file.name} no es una imagen válida.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);

      // Measure dimensions
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 800, h: 600 });
        img.src = previewUrl;
      });

      newItems.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'image/jpeg',
        previewUrl,
        width: dims.w,
        height: dims.h,
        rotation: 0,
      });
    }

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
      // Reset previous conversion result if any
      if (resultPdfUrl) {
        URL.revokeObjectURL(resultPdfUrl);
        setResultPdfUrl(null);
      }
    }
  };

  // Upload Handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Item Manipulation
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((it) => it.id !== id);
    });
  };

  const handleClearAll = () => {
    images.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setImages([]);
    if (resultPdfUrl) URL.revokeObjectURL(resultPdfUrl);
    setResultPdfUrl(null);
    setResultZipBlob(null);
    setErrorMsg(null);
  };

  const handleRotate = (id: string, dir: 'cw' | 'ccw' | 'reset') => {
    setImages((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let newRot = item.rotation;
        if (dir === 'cw') newRot = (newRot + 90) % 360;
        else if (dir === 'ccw') newRot = (newRot + 270) % 360;
        else newRot = 0;
        return { ...item, rotation: newRot };
      })
    );
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleSaveCrop = (
    itemId: string,
    crop: { x: number; y: number; width: number; height: number } | undefined
  ) => {
    setImages((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, crop } : it))
    );
  };

  const handleReplaceClick = (id: string) => {
    replaceTargetIdRef.current = id;
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = replaceTargetIdRef.current;
    if (!file || !targetId) return;

    const validation = await validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Archivo inválido para reemplazo.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 800, h: 600 });
      img.src = previewUrl;
    });

    setImages((prev) =>
      prev.map((item) => {
        if (item.id === targetId) {
          URL.revokeObjectURL(item.previewUrl);
          return {
            ...item,
            file,
            name: file.name,
            size: file.size,
            type: file.type || 'image/jpeg',
            previewUrl,
            width: dims.w,
            height: dims.h,
            rotation: 0,
            crop: undefined,
          };
        }
        return item;
      })
    );
    e.target.value = '';
  };

  // Convert Action
  const handleConvert = async () => {
    if (images.length === 0) return;

    setIsConverting(true);
    setConversionProgress(5);
    setProgressLabel('Preparando imágenes para conversión...');
    setErrorMsg(null);

    try {
      if (settings.mode === 'individual') {
        const { zipBlob, fileCount, zipName } = await generateIndividualPdfsZip(
          images,
          settings,
          (pct, lbl) => {
            setConversionProgress(pct);
            setProgressLabel(lbl);
          }
        );

        setResultZipBlob(zipBlob);
        setResultFileName(zipName);
        setResultFileSize(zipBlob.size);
        setResultPageCount(fileCount);
      } else {
        const pdfBytes = await generatePdfDocument(images, settings, (pct, lbl) => {
          setConversionProgress(pct);
          setProgressLabel(lbl);
        });

        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);

        setResultPdfUrl(pdfUrl);
        setResultFileName(sanitizeFilename(settings.filename));
        setResultFileSize(blob.size);
        setResultPageCount(images.length);
      }

      setConversionProgress(100);
      setProgressLabel('¡Conversión completada con éxito!');

      // Gentle celebratory confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Conversion execution error:', err);
      setErrorMsg(err.message || 'Ocurrió un error inesperado durante la conversión.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadResult = () => {
    if (settings.mode === 'individual' && resultZipBlob) {
      const url = URL.createObjectURL(resultZipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resultFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (resultPdfUrl) {
      const a = document.createElement('a');
      a.href = resultPdfUrl;
      a.download = resultFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleResetForNewConversion = () => {
    handleClearAll();
  };

  const estimatedBytes = estimateOutputSize(images, settings.quality);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4">
      {/* Hidden File Pickers */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={addMoreInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Main SaaS Card Workspace */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200">
        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border-b border-red-100 flex items-center justify-between text-xs text-red-700 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-500 hover:text-red-800 text-xs font-semibold px-2"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 1: EMPTY UPLOAD DROPZONE */}
        {/* ======================================================== */}
        {images.length === 0 && !resultPdfUrl && !resultZipBlob && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 sm:p-10 text-center cursor-pointer transition-all border border-dashed m-3 sm:m-4 rounded-lg flex flex-col items-center justify-center ${
              isDragOver
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50/50 shadow-2xs'
            }`}
          >
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center mx-auto border border-slate-200/80">
                <UploadCloud className="w-5 h-5 text-slate-600" />
              </div>

              <div>
                <button
                  type="button"
                  className="h-10 px-5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-2xs transition-colors mb-2 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Seleccionar imágenes JPG</span>
                </button>
                <p className="text-xs text-slate-500 font-normal">
                  o arrastra y suelta tus fotografías en este espacio
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-3 text-xs text-slate-400">
                <span>JPG / JPEG</span>
                <span>•</span>
                <span>PNG</span>
                <span>•</span>
                <span>WebP</span>
                <span>•</span>
                <span>Hasta 100 MB</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 2: ACTIVE IMAGE MANAGEMENT WORKSPACE */}
        {/* ======================================================== */}
        {images.length > 0 && !resultPdfUrl && !resultZipBlob && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Top Bar: Summary, Add More, Clear */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                  {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
                </span>
                <span className="text-xs text-slate-400">
                  {formatFileSize(images.reduce((acc, it) => acc + it.size, 0))} en total
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">
                  Est. salida: ~{formatFileSize(estimatedBytes)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addMoreInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-600" />
                  <span>Añadir más fotos</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Limpiar todo</span>
                </button>
              </div>
            </div>

            {/* Grid of Uploaded Images (Sortable with controls) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Organizar páginas (las páginas del PDF seguirán este orden exacto)
                </label>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Usa las flechas para reordenar o arrastra las imágenes
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {images.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggedIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIdx !== null && draggedIdx !== idx) {
                        const copy = [...images];
                        const moved = copy.splice(draggedIdx, 1)[0];
                        copy.splice(idx, 0, moved);
                        setImages(copy);
                      }
                      setDraggedIdx(null);
                    }}
                    className={`group relative bg-slate-50 rounded-lg border border-slate-200/90 overflow-hidden flex flex-col justify-between transition-all duration-150 hover:shadow-xs hover:border-slate-300 ${
                      draggedIdx === idx ? 'opacity-40 scale-95' : ''
                    }`}
                  >
                    {/* Page Number Badge */}
                    <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-slate-900/75 text-white font-mono text-[10px] font-semibold tracking-wider">
                      #{idx + 1}
                    </div>

                    {/* Delete Quick Button */}
                    <button
                      onClick={() => handleRemoveImage(item.id)}
                      className="absolute top-1.5 right-1.5 z-10 p-1 rounded bg-white/90 text-slate-400 hover:text-red-600 hover:bg-white shadow-2xs transition-colors"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {/* Thumbnail Viewport */}
                    <div className="h-28 w-full bg-slate-200/60 relative overflow-hidden flex items-center justify-center p-1 cursor-grab active:cursor-grabbing">
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-200"
                        style={{
                          transform: `rotate(${item.rotation}deg)`,
                        }}
                      />
                      {item.crop && (
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-blue-600 text-white text-[9px] rounded font-medium">
                          Recortado
                        </span>
                      )}
                    </div>

                    {/* Image Meta Info */}
                    <div className="p-2 bg-white border-t border-slate-100 flex flex-col gap-1.5">
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-800 truncate" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.width} × {item.height} • {formatFileSize(item.size)}
                        </p>
                      </div>

                      {/* Card Action Controls: Rotate, Crop, Reorder */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-slate-500">
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleRotate(item.id, 'ccw')}
                            className="p-1 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="Girar 90° izquierda"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRotate(item.id, 'cw')}
                            className="p-1 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="Girar 90° derecha"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setCropItem(item)}
                            className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Recortar imagen"
                          >
                            <Crop className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleReplaceClick(item.id)}
                            className="p-1 hover:text-slate-800 hover:bg-slate-100 rounded text-[10px] font-medium"
                            title="Reemplazar archivo"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Move Position Buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, 'left')}
                            className="p-1 disabled:opacity-30 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="Mover a la izquierda"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            disabled={idx === images.length - 1}
                            onClick={() => handleMove(idx, 'right')}
                            className="p-1 disabled:opacity-30 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="Mover a la derecha"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ======================================================== */}
            {/* PDF SETTINGS PANEL */}
            {/* ======================================================== */}
            <div className="bg-slate-50/70 rounded-lg p-4 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>Configuración de Página y Formato PDF</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500">Modo:</span>
                  <select
                    value={settings.mode}
                    onChange={(e) =>
                      setSettings({ ...settings, mode: e.target.value as 'combined' | 'individual' })
                    }
                    className="text-xs font-medium bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="combined">Unir en un solo PDF</option>
                    <option value="individual">PDFs Individuales (ZIP)</option>
                  </select>
                </div>
              </div>

              {/* Core Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                {/* 1. Page Size */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tamaño de Página</label>
                  <select
                    value={settings.pageSize}
                    onChange={(e) => setSettings({ ...settings, pageSize: e.target.value as any })}
                    className="w-full bg-white border border-slate-200/90 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="a4">A4 (210 × 297 mm)</option>
                    <option value="letter">Carta / Letter (8.5 × 11 in)</option>
                    <option value="legal">Oficio / Legal (8.5 × 14 in)</option>
                    <option value="a3">A3 (297 × 420 mm)</option>
                    <option value="a5">A5 (148 × 210 mm)</option>
                    <option value="fit-image">Ajustar al tamaño exacto de imagen</option>
                    <option value="custom">Personalizado (pt)</option>
                  </select>
                </div>

                {/* 2. Orientation */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Orientación</label>
                  <select
                    value={settings.orientation}
                    onChange={(e) => setSettings({ ...settings, orientation: e.target.value as any })}
                    className="w-full bg-white border border-slate-200/90 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="auto">Automática (según aspecto de imagen)</option>
                    <option value="portrait">Vertical (Retrato)</option>
                    <option value="landscape">Horizontal (Paisaje)</option>
                  </select>
                </div>

                {/* 3. Margins */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Márgenes</label>
                  <select
                    value={settings.margin}
                    onChange={(e) => setSettings({ ...settings, margin: e.target.value as any })}
                    className="w-full bg-white border border-slate-200/90 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="none">Sin márgenes (Borde a borde)</option>
                    <option value="small">Márgenes pequeños (~7 mm)</option>
                    <option value="medium">Márgenes estándar (~12.7 mm)</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                {/* 4. Scaling Mode */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ajuste de Imagen</label>
                  <select
                    value={settings.imageScaling}
                    onChange={(e) => setSettings({ ...settings, imageScaling: e.target.value as any })}
                    className="w-full bg-white border border-slate-200/90 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="fit">Ajustar a la página (proporcional)</option>
                    <option value="fill">Llenar toda la página</option>
                    <option value="original">Tamaño original sin estirar</option>
                  </select>
                </div>

                {/* 5. Image Position */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Posición de Imagen</label>
                  <select
                    value={settings.imagePosition}
                    onChange={(e) => setSettings({ ...settings, imagePosition: e.target.value as any })}
                    className="w-full bg-white border border-slate-200/90 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="center">Centrado (horizontal y vertical)</option>
                    <option value="top">Superior centrado</option>
                    <option value="bottom">Inferior centrado</option>
                    <option value="left">Alineado a la izquierda</option>
                    <option value="right">Alineado a la derecha</option>
                  </select>
                </div>

                {/* 6. Quality & Compression */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Calidad y Compresión</label>
                  <select
                    value={settings.quality}
                    onChange={(e) => setSettings({ ...settings, quality: e.target.value as any })}
                    className="w-full bg-white border border-slate-200/90 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="high">Alta Calidad (Resolución original)</option>
                    <option value="balanced">Equilibrada (Recomendado para web y correo)</option>
                    <option value="small">Archivo más pequeño (Máxima compresión)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Collapsible Options */}
              <div className="pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Opciones avanzadas (Nombre, Metadatos, Numeración, Color, Contraseña)</span>
                  {showAdvanced ? (
                    <ChevronUp className="w-3 h-3 text-slate-400 ml-0.5" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-2">
                    {/* Filename */}
                    <div>
                      <label className="block font-medium text-slate-600 mb-0.5">Nombre del archivo PDF</label>
                      <input
                        type="text"
                        value={settings.filename}
                        onChange={(e) => setSettings({ ...settings, filename: e.target.value })}
                        placeholder="imagenes-convertidas.pdf"
                        className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    {/* Page Numbering */}
                    <div>
                      <label className="block font-medium text-slate-600 mb-0.5">Numeración de páginas</label>
                      <select
                        value={settings.pageNumbering}
                        onChange={(e) => setSettings({ ...settings, pageNumbering: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-blue-600"
                      >
                        <option value="none">Desactivada</option>
                        <option value="bottom-center">Abajo al centro</option>
                        <option value="bottom-right">Abajo a la derecha</option>
                        <option value="bottom-left">Abajo a la izquierda</option>
                      </select>
                    </div>

                    {/* Background Color */}
                    <div>
                      <label className="block font-medium text-slate-600 mb-0.5">Color de fondo</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                          className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5"
                        />
                        <span className="font-mono text-[11px] text-slate-600">
                          {settings.backgroundColor.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Document Title */}
                    <div>
                      <label className="block font-medium text-slate-600 mb-0.5">Título del documento</label>
                      <input
                        type="text"
                        value={settings.title || ''}
                        onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                        placeholder="Ej. Álbum de fotos 2026"
                        className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    {/* Author */}
                    <div>
                      <label className="block font-medium text-slate-600 mb-0.5">Autor</label>
                      <input
                        type="text"
                        value={settings.author || ''}
                        onChange={(e) => setSettings({ ...settings, author: e.target.value })}
                        placeholder="Tu nombre o empresa"
                        className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    {/* Password Protection */}
                    <div>
                      <label className="block font-medium text-slate-600 mb-0.5">
                        Proteger con contraseña (AES-256)
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={settings.password || ''}
                          onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                          placeholder="Mínimo 3 caracteres (opcional)"
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 pr-6 text-slate-800 text-xs focus:ring-1 focus:ring-blue-600 font-mono"
                        />
                        <Lock className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conversion CTA Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                Se generará un archivo PDF con {images.length} {images.length === 1 ? 'página' : 'páginas'} en el orden configurado.
              </div>

              <button
                type="button"
                disabled={isConverting || images.length === 0}
                onClick={handleConvert}
                className="w-full sm:w-auto h-10 px-5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs flex items-center justify-center gap-2"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{progressLabel || 'Procesando...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>
                      {settings.mode === 'individual'
                        ? 'Convertir a PDFs Individuales (ZIP)'
                        : 'Convertir JPG a PDF'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Real Progress Indicator during conversion */}
            {isConverting && (
              <div className="space-y-1.5 pt-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{progressLabel}</span>
                  <span className="font-mono font-semibold">{conversionProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${conversionProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 3: RESULT AND DOWNLOAD SECTION */}
        {/* ======================================================== */}
        {(resultPdfUrl || resultZipBlob) && (
          <div className="p-6 sm:p-10 text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/60">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                ¡Documento convertido exitosamente!
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Tus imágenes han sido procesadas con resolución óptima y organizadas en un documento PDF genuino.
              </p>
            </div>

            {/* File Details Card */}
            <div className="max-w-md mx-auto p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-left flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {settings.mode === 'individual' ? <Archive className="w-4 h-4" /> : 'PDF'}
                </div>
                <div className="min-w-0 truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate" title={resultFileName}>
                    {resultFileName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {resultPageCount} {resultPageCount === 1 ? 'página' : 'páginas'} • {formatFileSize(resultFileSize)}
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded shrink-0">
                Listo
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadResult}
                className="h-10 px-5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>
                  {settings.mode === 'individual' ? 'Descargar archivo ZIP' : 'Descargar archivo PDF'}
                </span>
              </button>

              {resultPdfUrl && (
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="h-10 px-4 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Vista previa</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetForNewConversion}
                className="h-10 px-4 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs sm:text-sm transition-colors"
              >
                Convertir más imágenes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Crop Modal */}
      <ImageCropModal
        isOpen={!!cropItem}
        item={cropItem}
        onClose={() => setCropItem(null)}
        onSaveCrop={handleSaveCrop}
      />

      {/* PDF Real Preview Modal */}
      <JpgPdfPreviewModal
        isOpen={isPreviewOpen}
        pdfUrl={resultPdfUrl}
        filename={resultFileName}
        fileSize={resultFileSize}
        pageCount={resultPageCount}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={handleDownloadResult}
      />
    </div>
  );
}

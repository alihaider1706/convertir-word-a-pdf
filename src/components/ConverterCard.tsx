'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import confetti from 'canvas-confetti';
import {
  FileText,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Eye,
  RefreshCw,
  Loader2,
  FileCheck,
  Lock,
  Archive,
  Sliders,
  Trash2,
  Plus,
  Minimize2,
  Key,
  Layers,
  Edit3,
} from 'lucide-react';
import {
  ConversionStatus,
  BatchFileItem,
  ConversionResult,
  PageSettings,
} from '@/lib/types';
import { formatBytes, formatTime, getWordFormat, sanitizePdfFilename, getPdfFilename } from '@/lib/formatters';

interface ConverterCardProps {
  onPreview: (result: ConversionResult) => void;
  onManagePages: (result: ConversionResult) => void;
  onCompress: (result: ConversionResult) => void;
  onProtect: (result: ConversionResult) => void;
}

export default function ConverterCard({
  onPreview,
  onManagePages,
  onCompress,
  onProtect,
}: ConverterCardProps) {
  const [fileList, setFileList] = useState<BatchFileItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>('');
  const [isConvertingBatch, setIsConvertingBatch] = useState<boolean>(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);

  // Page Settings (A4 / Letter, Portrait / Landscape)
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#0284c7', '#10b981', '#f59e0b'],
      });
    } catch {}
  };

  // Add multiple files with validation
  const handleAddFiles = (files: FileList | File[]) => {
    setGlobalError('');
    const newItems: BatchFileItem[] = [];
    const MAX_SIZE = 50 * 1024 * 1024;

    Array.from(files).forEach((file) => {
      const format = getWordFormat(file.name);
      const isInvalidFormat = format === 'UNKNOWN';
      const isTooLarge = file.size > MAX_SIZE;

      let errorMessage: string | undefined;
      if (isInvalidFormat) {
        errorMessage = 'Formato no compatible. Solo se admiten archivos .doc y .docx.';
      } else if (isTooLarge) {
        errorMessage = `Supera el tamaño máximo de 50 MB (${formatBytes(file.size)}).`;
      }

      // Check duplicates
      const isDuplicate = fileList.some((item) => item.name === file.name && item.size === file.size);
      if (isDuplicate) return;

      newItems.push({
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        customName: getPdfFilename(file.name),
        size: file.size,
        format: format === 'UNKNOWN' ? 'DOCX' : format,
        status: errorMessage ? 'failed' : 'waiting',
        errorMessage,
      });
    });

    if (newItems.length === 0 && Array.from(files).length > 0) {
      setGlobalError('Los archivos seleccionados ya estaban en la lista.');
    } else {
      setFileList((prev) => [...prev, ...newItems]);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveItem = (id: string) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setFileList([]);
    setGlobalError('');
  };

  const handleCustomNameChange = (id: string, newName: string) => {
    setFileList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const sanitized = sanitizePdfFilename(newName);
          return {
            ...item,
            customName: sanitized,
            result: item.result
              ? {
                  ...item.result,
                  convertedName: sanitized,
                  downloadUrl: `/api/download?id=${item.result.id}&name=${encodeURIComponent(sanitized)}`,
                }
              : undefined,
          };
        }
        return item;
      })
    );
  };

  // Load sample file
  const handleLoadSample = async () => {
    try {
      const res = await fetch('/ejemplo-informe.docx');
      if (!res.ok) throw new Error('No se pudo cargar el archivo de ejemplo.');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'ejemplo-informe.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      handleAddFiles([sampleFile]);
    } catch (err: any) {
      setGlobalError(err.message || 'Error al cargar documento de ejemplo.');
    }
  };

  // Convert a single file item
  const convertSingleFile = async (item: BatchFileItem): Promise<ConversionResult> => {
    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('customName', item.customName);
    formData.append('pageSize', pageSettings.pageSize);
    formData.append('orientation', pageSettings.orientation);

    const res = await fetch('/api/convert', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error en la conversión (Código ${res.status})`);
    }

    const data: ConversionResult = await res.json();
    return data;
  };

  // Batch conversion execution with concurrency control (max 2 parallel)
  const handleConvertBatch = async () => {
    const pendingItems = fileList.filter((item) => item.status === 'waiting' || item.status === 'failed');
    if (pendingItems.length === 0) return;

    setIsConvertingBatch(true);
    setGlobalError('');

    const CONCURRENCY = 2;
    const queue = [...pendingItems];

    const processItem = async (item: BatchFileItem) => {
      setFileList((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'processing', errorMessage: undefined } : it))
      );

      try {
        const result = await convertSingleFile(item);
        setFileList((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'completed', result } : it))
        );
      } catch (err: any) {
        setFileList((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'failed', errorMessage: err.message || 'Error en conversión' } : it
          )
        );
      }
    };

    // Worker pool
    const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) {
          await processItem(item);
        }
      }
    });

    await Promise.all(workers);
    setIsConvertingBatch(false);
    triggerConfetti();
  };

  // Retry an individual failed file
  const handleRetryItem = async (item: BatchFileItem) => {
    setFileList((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, status: 'processing', errorMessage: undefined } : it))
    );

    try {
      const result = await convertSingleFile(item);
      setFileList((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'completed', result } : it))
      );
    } catch (err: any) {
      setFileList((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: 'failed', errorMessage: err.message || 'Error en conversión' } : it
        )
      );
    }
  };

  // Download All as ZIP
  const handleDownloadAllZip = async () => {
    const completedItems = fileList.filter((item) => item.status === 'completed' && item.result);
    if (completedItems.length === 0) return;

    setIsGeneratingZip(true);
    try {
      const payload = {
        items: completedItems.map((item) => ({
          fileId: item.result!.id,
          customName: item.customName,
        })),
      };

      const res = await fetch('/api/batch-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Error al empaquetar los archivos en ZIP.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documentos_convertidos.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setGlobalError(err.message || 'No se pudo descargar el archivo ZIP.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const completedCount = fileList.filter((i) => i.status === 'completed').length;
  const failedCount = fileList.filter((i) => i.status === 'failed').length;
  const waitingCount = fileList.filter((i) => i.status === 'waiting').length;

  return (
    <section id="converter-tool" className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-12">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 transition-all">
        {/* Main Heading & Description */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
            Convertir Word a PDF
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Convierte tus documentos DOC y DOCX a PDF online de forma rápida y sencilla con calidad profesional.
          </p>
        </div>

        {/* Hidden File Input (supports multiple) */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileInputChange}
          aria-label="Seleccionar archivos Word"
        />

        {/* ======================================================== */}
        {/* 1. EMPTY STATE - LARGE DRAG & DROP ZONE                 */}
        {/* ======================================================== */}
        {fileList.length === 0 && (
          <div>
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/50 scale-[0.995]'
                  : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 bg-slate-50/20'
              }`}
            >
              <div className="mx-auto w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-2xs">
                <FileText className="w-7 h-7 stroke-[1.75]" />
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Arrastra tu archivo Word aquí
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                o selecciona un archivo desde tu dispositivo
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-2xs transition-all inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Seleccionar archivo</span>
                </button>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-500">
                <span>Formatos compatibles: <strong>DOC y DOCX</strong> (Múltiples archivos)</span>
                <span>•</span>
                <span>Hasta <strong>50 MB</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">100% Gratis y Confidencial</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-slate-500 hover:text-blue-600 font-medium underline underline-offset-4 transition-colors"
              >
                ¿Quieres probarlo primero? Cargar documento Word de ejemplo
              </button>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {globalError && (
          <div className="mt-4 p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="flex-1">{globalError}</span>
            <button onClick={() => setGlobalError('')} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. FILE LIST & BATCH PROCESSING INTERFACE                */}
        {/* ======================================================== */}
        {fileList.length > 0 && (
          <div className="space-y-6">
            {/* Top Toolbar: Add More, Clear All, Page Settings */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir más archivos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-colors inline-flex items-center gap-1.5 ${
                    showSettings ? 'bg-slate-100 border-slate-300 text-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configuración de página</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-500">
                  Total: <strong>{fileList.length}</strong> {fileList.length === 1 ? 'archivo' : 'archivos'}
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isConvertingBatch}
                  className="text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors disabled:opacity-40"
                >
                  Vaciar lista
                </button>
              </div>
            </div>

            {/* Collapsible Page Settings Panel (Section 7) */}
            {showSettings && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3 animate-in fade-in duration-150">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>Configuración del formato de página para la conversión</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tamaño de papel:</label>
                    <select
                      value={pageSettings.pageSize}
                      onChange={(e) => setPageSettings({ ...pageSettings, pageSize: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="A4">A4 (210 × 297 mm) - Estándar</option>
                      <option value="Letter">Carta / Letter (8.5 × 11 in)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Orientación:</label>
                    <select
                      value={pageSettings.orientation}
                      onChange={(e) => setPageSettings({ ...pageSettings, orientation: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="portrait">Vertical (Portrait) - Recomendado</option>
                      <option value="landscape">Horizontal (Landscape)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* List of Files */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white overflow-hidden">
              {fileList.map((item) => {
                const isCompleted = item.status === 'completed' && item.result;
                const isProcessing = item.status === 'processing';
                const isFailed = item.status === 'failed';

                return (
                  <div key={item.id} className="p-3.5 sm:p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Icon & Name details */}
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-md flex flex-col items-center justify-center shrink-0 text-white font-bold text-[9px] shadow-2xs ${
                            isCompleted ? 'bg-rose-600' : 'bg-blue-600'
                          }`}
                        >
                          {isCompleted ? <FileCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          <span className="uppercase">{isCompleted ? 'PDF' : item.format}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Editable PDF Filename Input (Section 1) */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={item.customName}
                              onChange={(e) => handleCustomNameChange(item.id, e.target.value)}
                              placeholder="Nombre_personalizado.pdf"
                              disabled={isProcessing}
                              className="text-xs sm:text-sm font-semibold text-slate-900 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1.5 py-0.5 max-w-xs sm:max-w-md w-full transition-colors truncate"
                              title="Haz clic para personalizar el nombre del archivo PDF"
                            />
                            <Edit3 className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-0.5 px-1.5">
                            <span>Original: {item.name}</span>
                            <span>•</span>
                            <span>{formatBytes(item.size)}</span>
                            {isCompleted && item.result && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-slate-700">
                                  PDF: {formatBytes(item.result.pdfSize)}
                                </span>
                                <span>•</span>
                                <span>{item.result.pageCount || 1} pág.</span>
                              </>
                            )}
                          </div>

                          {/* Error text if individual failure */}
                          {isFailed && item.errorMessage && (
                            <p className="text-[11px] text-rose-600 font-medium mt-1 px-1.5">
                              {item.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Status badge & Actions */}
                      <div className="flex items-center space-x-2 shrink-0 justify-end">
                        {/* Status badge */}
                        {item.status === 'waiting' && (
                          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                            En espera
                          </span>
                        )}

                        {isProcessing && (
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded inline-flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            <span>Procesando...</span>
                          </span>
                        )}

                        {isFailed && (
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                              Falló
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRetryItem(item)}
                              className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50 text-xs font-medium"
                              title="Reintentar este archivo"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {isCompleted && item.result && (
                          <div className="flex items-center space-x-1">
                            {/* Download Button */}
                            <a
                              href={`/api/download?id=${item.result.id}&name=${encodeURIComponent(item.customName)}`}
                              download={item.customName}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium inline-flex items-center gap-1 shadow-2xs transition-colors"
                              title="Descargar este PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Descargar</span>
                            </a>

                            {/* Preview Button */}
                            <button
                              type="button"
                              onClick={() => onPreview({ ...item.result!, convertedName: item.customName })}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded text-xs transition-colors"
                              title="Vista previa del PDF"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Page Manager Button (Rotate, reorder, delete) */}
                            <button
                              type="button"
                              onClick={() => onManagePages({ ...item.result!, convertedName: item.customName })}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded text-xs transition-colors"
                              title="Organizar páginas (girar, reordenar, borrar)"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>

                            {/* Compress Button */}
                            <button
                              type="button"
                              onClick={() => onCompress({ ...item.result!, convertedName: item.customName })}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded text-xs transition-colors"
                              title="Comprimir PDF"
                            >
                              <Minimize2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Protect Password Button */}
                            <button
                              type="button"
                              onClick={() => onProtect({ ...item.result!, convertedName: item.customName })}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded text-xs transition-colors"
                              title="Proteger con contraseña"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isProcessing}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-30"
                          title="Eliminar de la lista"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Global Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {completedCount > 0 && (
                  <span className="text-emerald-700 font-semibold mr-2">
                    ✓ {completedCount} {completedCount === 1 ? 'convertido' : 'convertidos'}
                  </span>
                )}
                {failedCount > 0 && (
                  <span className="text-rose-600 font-medium mr-2">
                    ✕ {failedCount} {failedCount === 1 ? 'fallido' : 'fallidos'}
                  </span>
                )}
                {waitingCount > 0 && (
                  <span className="text-slate-600 font-medium">
                    ⏳ {waitingCount} pendientes
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {/* Download All as ZIP (Section 5) */}
                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isGeneratingZip}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-md shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    {isGeneratingZip ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generando ZIP...</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        <span>Descargar todos (.ZIP)</span>
                      </>
                    )}
                  </button>
                )}

                {/* Batch Convert Button */}
                {waitingCount > 0 && (
                  <button
                    type="button"
                    onClick={handleConvertBatch}
                    disabled={isConvertingBatch}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-md shadow-xs transition-colors inline-flex items-center justify-center gap-2"
                  >
                    {isConvertingBatch ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Convirtiendo documentos...</span>
                      </>
                    ) : (
                      <>
                        <span>Convertir {fileList.length === 1 ? 'a PDF' : 'todos a PDF'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 pt-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Los archivos se eliminan automáticamente del servidor transcurrida 1 hora.</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

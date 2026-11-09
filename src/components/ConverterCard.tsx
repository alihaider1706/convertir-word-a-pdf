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
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  ConversionStatus,
  BatchFileItem,
  ConversionResult,
  PageSettings,
} from '@/lib/types';
import { formatBytes, formatTime, getWordFormat, sanitizePdfFilename, getPdfFilename } from '@/lib/formatters';
import UpgradeModal from '@/components/UpgradeModal';
import { useSession } from 'next-auth/react';

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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [upgradeModalReason, setUpgradeModalReason] = useState<string>('');

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
        colors: ['#09090b', '#2563eb', '#10b981', '#71717a'],
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
  };

  const handleActualDrop = (e: DragEvent<HTMLDivElement>) => {
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
      if (err.limitReached || res.status === 403) {
        setUpgradeModalReason(err.error || 'Has alcanzado el límite diario de conversiones gratuitas.');
        setUpgradeModalOpen(true);
      }
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
    <section id="converter-tool" className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-14">
      {/* WrongPDF Style Header Block */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-700 text-xs font-medium mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
          <span>Rápido, Gratuito & 100% Privado</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight sm:leading-tight">
          Convertir Word a PDF
        </h1>
        <p className="mt-2.5 text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl mx-auto">
          Convierte documentos DOC y DOCX a PDF online de forma instantánea. Sin marcas de agua, sin registros y con total fidelidad.
        </p>
      </div>

      {/* Main Converter Card Container */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-5 sm:p-8 transition-all">
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
        {/* 1. WRONGPDF EMPTY STATE - SLEEK DRAG & DROP ZONE         */}
        {/* ======================================================== */}
        {fileList.length === 0 && (
          <div>
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleActualDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 group ${
                isDragging
                  ? 'border-zinc-900 bg-zinc-100/70 scale-[0.99]'
                  : 'border-zinc-300 hover:border-zinc-500 bg-zinc-50/50 hover:bg-zinc-50/90'
              }`}
            >
              {/* Center Floating Icon */}
              <div className="mx-auto w-16 h-16 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex items-center justify-center text-zinc-900 mb-5 group-hover:scale-105 transition-transform duration-200">
                <FileText className="w-8 h-8 stroke-[1.6]" />
              </div>

              <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                Arrastra y suelta tu archivo Word aquí
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
                o pulsa para explorar archivos en tu ordenador o móvil
              </p>

              {/* High Contrast Primary CTA */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-black active:scale-[0.98] text-white font-medium text-sm rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Seleccionar archivos Word</span>
                </button>
              </div>

              {/* Micro specs pills */}
              <div className="mt-8 pt-5 border-t border-zinc-200/70 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] text-zinc-500 font-medium">
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-zinc-200">.DOC y .DOCX</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-zinc-200">Hasta 50 MB</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-zinc-200">Múltiples archivos</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">100% Gratis</span>
              </div>
            </div>

            {/* Sample File Quick Link */}
            <div className="mt-3.5 text-center">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-zinc-500 hover:text-zinc-900 font-medium underline underline-offset-4 transition-colors inline-flex items-center gap-1"
              >
                <span>¿No tienes un archivo a mano?</span>
                <span className="font-semibold text-zinc-800">Cargar documento Word de prueba</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Error Alert */}
        {globalError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="flex-1">{globalError}</span>
            <button onClick={() => setGlobalError('')} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. WRONGPDF WORKSPACE - FILE LIST & BATCH CONTROLS       */}
        {/* ======================================================== */}
        {fileList.length > 0 && (
          <div className="space-y-5">
            {/* Sleek Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200/80">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir más</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                    showSettings
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configuración</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-zinc-500 font-medium">
                  {fileList.length} {fileList.length === 1 ? 'documento' : 'documentos'}
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isConvertingBatch}
                  className="text-xs font-medium text-zinc-400 hover:text-rose-600 transition-colors disabled:opacity-40"
                >
                  Vaciar lista
                </button>
              </div>
            </div>

            {/* Collapsible Page Settings Panel */}
            {showSettings && (
              <div className="p-4 bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs space-y-3 animate-in fade-in duration-150">
                <h4 className="font-semibold text-zinc-900 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Ajustes de salida PDF</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-zinc-600 font-medium mb-1">Tamaño de página:</label>
                    <select
                      value={pageSettings.pageSize}
                      onChange={(e) => setPageSettings({ ...pageSettings, pageSize: e.target.value as any })}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      <option value="A4">A4 (210 × 297 mm) - Recomendado</option>
                      <option value="Letter">Carta / Letter (8.5 × 11 in)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-600 font-medium mb-1">Orientación:</label>
                    <select
                      value={pageSettings.orientation}
                      onChange={(e) => setPageSettings({ ...pageSettings, orientation: e.target.value as any })}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      <option value="portrait">Vertical (Portrait)</option>
                      <option value="landscape">Horizontal (Landscape)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* List of Files with WrongPDF Cards */}
            <div className="space-y-2.5">
              {fileList.map((item) => {
                const isCompleted = item.status === 'completed' && item.result;
                const isProcessing = item.status === 'processing';
                const isFailed = item.status === 'failed';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300/90 transition-all shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Icon & Editable Details */}
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 font-bold text-[9px] shadow-2xs ${
                            isCompleted
                              ? 'bg-zinc-900 text-white'
                              : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          }`}
                        >
                          {isCompleted ? <FileCheck className="w-4 h-4" /> : <FileText className="w-4 h-4 text-zinc-600" />}
                          <span className="uppercase tracking-tighter">{isCompleted ? 'PDF' : item.format}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Editable PDF Filename Input */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={item.customName}
                              onChange={(e) => handleCustomNameChange(item.id, e.target.value)}
                              placeholder="Nombre_documento.pdf"
                              disabled={isProcessing}
                              className="text-xs sm:text-sm font-semibold text-zinc-900 bg-transparent hover:bg-zinc-100/60 focus:bg-white border border-transparent hover:border-zinc-300 focus:border-zinc-900 rounded-md px-1.5 py-0.5 max-w-xs sm:max-w-md w-full transition-colors truncate"
                              title="Haz clic para personalizar el nombre del PDF"
                            />
                            <Edit3 className="w-3 h-3 text-zinc-400 shrink-0 pointer-events-none" />
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500 mt-0.5 px-1.5 font-medium">
                            <span>{item.name}</span>
                            <span>•</span>
                            <span>{formatBytes(item.size)}</span>
                            {isCompleted && item.result && (
                              <>
                                <span>•</span>
                                <span className="text-zinc-800 font-semibold">
                                  PDF: {formatBytes(item.result.pdfSize)}
                                </span>
                                <span>•</span>
                                <span>{item.result.pageCount || 1} pág.</span>
                              </>
                            )}
                          </div>

                          {/* Error text if failure */}
                          {isFailed && item.errorMessage && (
                            <p className="text-[11px] text-rose-600 font-medium mt-1 px-1.5">
                              {item.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Status badge & Action pills */}
                      <div className="flex items-center space-x-1.5 shrink-0 justify-end">
                        {/* Status badges */}
                        {item.status === 'waiting' && (
                          <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-md">
                            En espera
                          </span>
                        )}

                        {isProcessing && (
                          <span className="text-[11px] font-semibold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-800" />
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
                              className="p-1 text-zinc-600 hover:text-zinc-900 rounded hover:bg-zinc-100 text-xs font-medium"
                              title="Reintentar este archivo"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {isCompleted && item.result && (
                          <div className="flex items-center space-x-1">
                            {/* Individual Download Button */}
                            <a
                              href={`/api/download?id=${item.result.id}&name=${encodeURIComponent(item.customName)}`}
                              download={item.customName}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                              title="Descargar este archivo PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Descargar</span>
                            </a>

                            {/* Preview Button */}
                            <button
                              type="button"
                              onClick={() => onPreview({ ...item.result!, convertedName: item.customName })}
                              className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg text-xs transition-colors"
                              title="Vista previa del PDF"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Page Manager Button */}
                            <button
                              type="button"
                              onClick={() => onManagePages({ ...item.result!, convertedName: item.customName })}
                              className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg text-xs transition-colors"
                              title="Organizar páginas (girar, reordenar, borrar)"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>

                            {/* Compress Button */}
                            <button
                              type="button"
                              onClick={() => onCompress({ ...item.result!, convertedName: item.customName })}
                              className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg text-xs transition-colors"
                              title="Comprimir PDF"
                            >
                              <Minimize2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Protect Password Button */}
                            <button
                              type="button"
                              onClick={() => onProtect({ ...item.result!, convertedName: item.customName })}
                              className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg text-xs transition-colors"
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
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
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

            {/* Bottom Actions Bar (WrongPDF Dock Style) */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200/80">
              <div className="text-xs text-zinc-500 font-medium">
                {completedCount > 0 && (
                  <span className="text-emerald-700 font-semibold mr-2">
                    ✓ {completedCount} {completedCount === 1 ? 'completado' : 'completados'}
                  </span>
                )}
                {failedCount > 0 && (
                  <span className="text-rose-600 mr-2">
                    ✕ {failedCount} {failedCount === 1 ? 'fallido' : 'fallidos'}
                  </span>
                )}
                {waitingCount > 0 && (
                  <span className="text-zinc-600">
                    ⏳ {waitingCount} listos para convertir
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {/* Download All as ZIP */}
                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isGeneratingZip}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all inline-flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    {isGeneratingZip ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Empaquetando ZIP...</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        <span>Descargar todos (.ZIP)</span>
                      </>
                    )}
                  </button>
                )}

                {/* Batch Convert Primary Action */}
                {waitingCount > 0 && (
                  <button
                    type="button"
                    onClick={handleConvertBatch}
                    disabled={isConvertingBatch}
                    className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-black active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all inline-flex items-center justify-center gap-2"
                  >
                    {isConvertingBatch ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
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

            {/* Privacy micro-banner */}
            <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5 pt-1">
              <Lock className="w-3 h-3 text-zinc-400" />
              <span>Tus archivos se procesan de forma privada y se eliminan automáticamente del servidor.</span>
            </p>
          </div>
        )}
      </div>

      {/* SaaS Upgrade Paywall Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        reason={upgradeModalReason}
      />
    </section>
  );
}

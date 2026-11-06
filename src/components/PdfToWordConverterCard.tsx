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
  Lock,
  Archive,
  Trash2,
  Plus,
  Key,
  Layers,
  Sparkles,
  Edit2,
  FileCheck,
} from 'lucide-react';
import { PdfBatchFileItem, PdfToWordConversionResult } from '@/lib/types';
import { formatBytes, formatTime, getDocxFilename, sanitizeDocxFilename } from '@/lib/formatters';
import PdfPasswordModal from './PdfPasswordModal';
import PdfPreviewModal from './PdfPreviewModal';
import PdfPageManagerModal from './PdfPageManagerModal';

export default function PdfToWordConverterCard() {
  const [fileList, setFileList] = useState<PdfBatchFileItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>('');
  const [isConvertingBatch, setIsConvertingBatch] = useState<boolean>(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);

  // Active modals state
  const [passwordTargetItem, setPasswordTargetItem] = useState<PdfBatchFileItem | null>(null);
  const [previewTargetItem, setPreviewTargetItem] = useState<PdfBatchFileItem | null>(null);
  const [pageManagerTargetItem, setPageManagerTargetItem] = useState<PdfBatchFileItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#0284c7', '#10b981', '#64748b'],
      });
    } catch {}
  };

  // Add multiple PDF files with validation
  const handleAddFiles = (files: FileList | File[]) => {
    setGlobalError('');
    const newItems: PdfBatchFileItem[] = [];
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB

    Array.from(files).forEach((file) => {
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      const isTooLarge = file.size > MAX_SIZE;

      let errorMessage: string | undefined;
      if (!isPdf) {
        errorMessage = 'Formato no compatible. Por favor sube únicamente archivos con extensión .pdf.';
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
        customName: getDocxFilename(file.name),
        size: file.size,
        status: errorMessage ? 'failed' : 'waiting',
        errorMessage,
      });
    });

    if (newItems.length === 0 && Array.from(files).length > 0) {
      setGlobalError('Los archivos seleccionados ya estaban añadidos a la lista.');
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
          const sanitized = sanitizeDocxFilename(newName);
          return {
            ...item,
            customName: sanitized,
            result: item.result
              ? {
                  ...item.result,
                  convertedName: sanitized,
                  downloadUrl: `/api/pdf-to-word/download?id=${item.result.id}&name=${encodeURIComponent(sanitized)}`,
                }
              : undefined,
          };
        }
        return item;
      })
    );
  };

  // Convert single PDF item
  const convertSingleFile = async (item: PdfBatchFileItem, passwordOverride?: string): Promise<PdfToWordConversionResult> => {
    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('customFilename', item.customName);

    const activePassword = passwordOverride || item.password;
    if (activePassword) {
      formData.append('password', activePassword);
    }

    if (item.pageSettings) {
      if (item.pageSettings.rotations) {
        formData.append('rotations', JSON.stringify(item.pageSettings.rotations));
      }
      if (item.pageSettings.deletedPages) {
        formData.append('deletedPages', JSON.stringify(item.pageSettings.deletedPages));
      }
      if (item.pageSettings.pageOrder) {
        formData.append('pageOrder', JSON.stringify(item.pageSettings.pageOrder));
      }
    }

    const res = await fetch('/api/pdf-to-word/convert', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 423 || data.code === 'PASSWORD_REQUIRED') {
        const err = new Error(data.error || 'DOCUMENT_IS_PASSWORD_PROTECTED');
        (err as any).code = 'PASSWORD_REQUIRED';
        throw err;
      }
      if (res.status === 401 || data.code === 'INVALID_PASSWORD') {
        const err = new Error(data.error || 'La contraseña proporcionada es incorrecta.');
        (err as any).code = 'INVALID_PASSWORD';
        throw err;
      }
      throw new Error(data.error || `Error en la conversión (Código ${res.status})`);
    }

    return data as PdfToWordConversionResult;
  };

  // Batch conversion execution with concurrency control (max 2 parallel workers)
  const handleConvertBatch = async () => {
    const pendingItems = fileList.filter((item) => item.status === 'waiting' || item.status === 'failed');
    if (pendingItems.length === 0) return;

    setIsConvertingBatch(true);
    setGlobalError('');

    const CONCURRENCY = 2;
    const queue = [...pendingItems];

    const processItem = async (item: PdfBatchFileItem) => {
      setFileList((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'processing', errorMessage: undefined } : it))
      );

      try {
        const result = await convertSingleFile(item);
        setFileList((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'completed',
                  result,
                  pageCount: result.pageCount,
                }
              : it
          )
        );
      } catch (err: any) {
        if (err.code === 'PASSWORD_REQUIRED' || err.code === 'INVALID_PASSWORD') {
          setFileList((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: 'failed',
                    requiresPassword: true,
                    errorMessage: err.message || 'Se requiere contraseña para descifrar este PDF.',
                  }
                : it
            )
          );
        } else {
          setFileList((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: 'failed',
                    errorMessage: err.message || 'Error en la conversión',
                  }
                : it
            )
          );
        }
      }
    };

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

    const allCompleted = fileList.every((it) => it.status === 'completed');
    if (allCompleted) {
      triggerConfetti();
    }
  };

  // Single file retry
  const handleRetryItem = async (item: PdfBatchFileItem, passwordOverride?: string) => {
    setFileList((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, status: 'processing', errorMessage: undefined } : it))
    );

    try {
      const result = await convertSingleFile(item, passwordOverride);
      setFileList((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                status: 'completed',
                result,
                pageCount: result.pageCount,
                requiresPassword: false,
                password: passwordOverride || it.password,
              }
            : it
        )
      );
      triggerConfetti();
    } catch (err: any) {
      if (err.code === 'PASSWORD_REQUIRED' || err.code === 'INVALID_PASSWORD') {
        setFileList((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'failed',
                  requiresPassword: true,
                  errorMessage: err.message || 'Contraseña incorrecta o requerida.',
                }
              : it
          )
        );
      } else {
        setFileList((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'failed', errorMessage: err.message || 'Error en la conversión' } : it
          )
        );
      }
    }
  };

  // Password submission from modal
  const handlePasswordSubmit = async (password: string) => {
    if (!passwordTargetItem) return;
    const target = passwordTargetItem;
    setPasswordTargetItem(null);
    await handleRetryItem(target, password);
  };

  // Download all completed as ZIP
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

      const res = await fetch('/api/pdf-to-word/batch-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('No se pudo generar el archivo ZIP de los documentos Word.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documentos_word_convertidos.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setGlobalError(err.message || 'Error al descargar el archivo ZIP.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const waitingCount = fileList.filter((it) => it.status === 'waiting').length;
  const processingCount = fileList.filter((it) => it.status === 'processing').length;
  const completedCount = fileList.filter((it) => it.status === 'completed').length;
  const failedCount = fileList.filter((it) => it.status === 'failed').length;

  return (
    <section id="pdf-to-word-tool" className="py-2 sm:py-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Converter Main Container - Clean, minimal, purpose-built SaaS panel */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Global Error Banner */}
          {globalError && (
            <div className="flex items-start justify-between gap-3 p-3.5 bg-rose-50 border-b border-rose-200 text-xs text-rose-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>{globalError}</p>
              </div>
              <button
                type="button"
                onClick={() => setGlobalError('')}
                className="text-rose-500 hover:text-rose-700"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
            id="pdf-upload-input"
          />

          {/* STATE A: Empty List Dropzone */}
          {fileList.length === 0 ? (
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-10 text-center cursor-pointer transition-all border border-dashed m-3 sm:m-4 rounded-lg flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50/50 shadow-2xs'
              }`}
            >
              {/* Minimal Document Icon */}
              <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center mb-3 border border-slate-200/80">
                <Upload className="w-5 h-5 text-slate-600" />
              </div>

              {/* Action Headline & Button */}
              <button
                type="button"
                className="h-10 px-5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-2xs transition-colors mb-2 inline-flex items-center gap-2"
              >
                <span>Seleccionar archivos PDF</span>
              </button>

              <p className="text-xs text-slate-500 font-normal">
                o arrastra y suelta tus documentos en este espacio
              </p>

              {/* Supported Specifications Note */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span>PDF estándar hasta 50 MB</span>
                <span>•</span>
                <span>Conversión múltiple simultánea</span>
                <span>•</span>
                <span>OCR automático para escaneos</span>
              </div>
            </div>
          ) : (
            /* STATE B: Active File Queue & Management Workspace */
            <div className="p-4 sm:p-6 space-y-4">
              {/* Workspace Top Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-900 text-sm">
                    {fileList.length} {fileList.length === 1 ? 'documento' : 'documentos'}
                  </span>
                  {completedCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-200/60">
                      {completedCount} {completedCount === 1 ? 'convertido' : 'convertidos'}
                    </span>
                  )}
                  {waitingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                      {waitingCount} pendiente{waitingCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {failedCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium text-[11px] border border-rose-200/60">
                      {failedCount} con error
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Añadir más</span>
                  </button>

                  {completedCount > 1 && (
                    <button
                      type="button"
                      onClick={handleDownloadAllZip}
                      disabled={isGeneratingZip}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingZip ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Archive className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>Descargar todo (ZIP)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isConvertingBatch}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>

              {/* File List */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                {fileList.map((item) => {
                  const isWaiting = item.status === 'waiting';
                  const isProcessing = item.status === 'processing';
                  const isCompleted = item.status === 'completed';
                  const isFailed = item.status === 'failed';

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 sm:p-4 transition-colors ${
                        isCompleted
                          ? 'bg-slate-50/40'
                          : isFailed
                          ? 'bg-rose-50/20'
                          : isProcessing
                          ? 'bg-blue-50/20'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* File Details & Inline Filename Editor */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* File Badge */}
                          <div className="w-9 h-9 rounded-md bg-rose-50 border border-rose-200/60 text-rose-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                            PDF
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            {/* File Name & Size */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-medium text-slate-900 truncate" title={item.name}>
                                {item.name}
                              </span>
                              <span className="text-xs text-slate-400 font-mono shrink-0">
                                {formatBytes(item.size)}
                              </span>
                            </div>

                            {/* Custom Filename Field - Integrated, clean design */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <span className="text-[11px] text-slate-400 shrink-0">Salida:</span>
                              <div className="relative inline-flex items-center max-w-xs w-full">
                                <input
                                  type="text"
                                  value={item.customName}
                                  onChange={(e) => handleCustomNameChange(item.id, e.target.value)}
                                  disabled={isProcessing}
                                  className="w-full px-2 py-0.5 text-xs font-mono text-slate-700 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  title="Nombre del archivo Word (.docx) descargable"
                                />
                              </div>
                            </div>

                            {/* Status Indicators */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                              {isWaiting && (
                                <span className="inline-flex items-center gap-1.5 text-slate-500 text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  Listo para convertir
                                </span>
                              )}
                              {isProcessing && (
                                <span className="inline-flex items-center gap-1.5 text-blue-600 font-medium text-[11px]">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Procesando estructura y texto...
                                </span>
                              )}
                              {isCompleted && item.result && (
                                <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Word generado ({formatBytes(item.result.docxSize)} en {formatTime(item.result.conversionTimeMs)})
                                </span>
                              )}
                              {item.result?.usedOcr && (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-200/60">
                                  OCR activo
                                </span>
                              )}
                              {item.requiresPassword && (
                                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded text-[10px] font-medium border border-amber-200/60 inline-flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-amber-700" />
                                  Requiere contraseña
                                </span>
                              )}
                              {isFailed && item.errorMessage && (
                                <span className="text-rose-600 text-[11px] font-medium">
                                  {item.errorMessage}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {/* Page Organizer Button (before conversion) */}
                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => setPageManagerTargetItem(item)}
                              disabled={isProcessing}
                              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 transition-colors inline-flex items-center gap-1"
                              title="Organizar o eliminar páginas"
                            >
                              <Layers className="w-3.5 h-3.5 text-slate-400" />
                              <span className="hidden sm:inline">Páginas</span>
                            </button>
                          )}

                          {/* Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewTargetItem(item)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 transition-colors inline-flex items-center gap-1"
                            title="Ver vista previa del PDF"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span className="hidden sm:inline">Previsualizar</span>
                          </button>

                          {/* Password Unlock Button */}
                          {item.requiresPassword && (
                            <button
                              type="button"
                              onClick={() => setPasswordTargetItem(item)}
                              className="px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200/80 transition-colors inline-flex items-center gap-1"
                            >
                              <Key className="w-3.5 h-3.5 text-amber-600" />
                              <span>Clave</span>
                            </button>
                          )}

                          {/* Download Word Button (when completed) */}
                          {isCompleted && item.result && (
                            <a
                              href={item.result.downloadUrl}
                              download={item.customName}
                              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition-colors shadow-2xs inline-flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Descargar Word</span>
                            </a>
                          )}

                          {/* Retry Button (if failed) */}
                          {isFailed && !item.requiresPassword && (
                            <button
                              type="button"
                              onClick={() => handleRetryItem(item)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                              <span>Reintentar</span>
                            </button>
                          )}

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isProcessing}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            aria-label="Quitar archivo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Primary Conversion Bar */}
              {waitingCount > 0 && (
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Documentos convertidos a OpenXML (.docx) 100% editables.
                  </p>

                  <button
                    type="button"
                    onClick={handleConvertBatch}
                    disabled={isConvertingBatch}
                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    {isConvertingBatch ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Convirtiendo documentos...</span>
                      </>
                    ) : (
                      <>
                        <span>Convertir a Word ahora</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PdfPasswordModal
        isOpen={!!passwordTargetItem}
        fileName={passwordTargetItem?.name || ''}
        errorMessage={passwordTargetItem?.errorMessage}
        onClose={() => setPasswordTargetItem(null)}
        onSubmit={handlePasswordSubmit}
      />

      <PdfPreviewModal
        isOpen={!!previewTargetItem}
        fileName={previewTargetItem?.name || ''}
        file={previewTargetItem?.file}
        previewUrl={previewTargetItem?.result?.previewUrl}
        downloadWordUrl={previewTargetItem?.result?.downloadUrl}
        pageCount={previewTargetItem?.pageCount}
        onClose={() => setPreviewTargetItem(null)}
      />

      <PdfPageManagerModal
        isOpen={!!pageManagerTargetItem}
        fileName={pageManagerTargetItem?.name || ''}
        initialPageCount={pageManagerTargetItem?.pageCount || 1}
        initialRotations={pageManagerTargetItem?.pageSettings?.rotations}
        initialDeletedPages={pageManagerTargetItem?.pageSettings?.deletedPages}
        initialPageOrder={pageManagerTargetItem?.pageSettings?.pageOrder}
        onClose={() => setPageManagerTargetItem(null)}
        onApply={(settings) => {
          if (!pageManagerTargetItem) return;
          setFileList((prev) =>
            prev.map((it) =>
              it.id === pageManagerTargetItem.id
                ? {
                    ...it,
                    pageSettings: settings,
                  }
                : it
            )
          );
        }}
      />
    </section>
  );
}

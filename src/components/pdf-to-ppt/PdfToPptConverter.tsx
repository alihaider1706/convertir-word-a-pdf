'use client';

import React, { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import confetti from 'canvas-confetti';
import {
  FileText,
  UploadCloud,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
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
  Presentation,
  Check,
  SlidersHorizontal,
  Settings2,
  Eye,
  FileCheck,
} from 'lucide-react';
import {
  PdfToPptBatchFileItem,
  PdfToPptConversionResult,
  PdfToPptMode,
} from '@/lib/types';
import {
  formatBytes,
  formatTime,
  getPptxFilename,
  sanitizePptxFilename,
  parsePageRange,
} from '@/lib/formatters';
import { loadPdfDocument, renderPageThumbnail } from '@/lib/pdfToJpgConverter';

interface PasswordModalProps {
  isOpen: boolean;
  fileName: string;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

function PasswordModal({ isOpen, fileName, onClose, onSubmit }: PasswordModalProps) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd.trim()) {
      setError('Por favor ingresa la contraseña del documento.');
      return;
    }
    setError('');
    onSubmit(pwd.trim());
    setPwd('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">PDF Protegido con Contraseña</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{fileName}</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Este documento PDF está protegido. Ingresa la clave para desbloquear el contenido y convertirlo a PowerPoint:
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="password"
              placeholder="Contraseña del documento"
              value={pwd}
              onChange={(e) => {
                setPwd(e.target.value);
                setError('');
              }}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Desbloquear y Convertir</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PdfToPptConverter() {
  const [fileList, setFileList] = useState<PdfToPptBatchFileItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>('');
  const [isConvertingBatch, setIsConvertingBatch] = useState<boolean>(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);

  // Global tool settings
  const [globalMode, setGlobalMode] = useState<PdfToPptMode>('editable');
  const [globalPageRange, setGlobalPageRange] = useState<string>('');
  const [rangeType, setRangeType] = useState<'all' | 'custom'>('all');
  const [orientation, setOrientation] = useState<'auto' | 'landscape' | 'portrait'>('auto');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Selected file index for active view
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  // Password Modal target
  const [passwordTargetItem, setPasswordTargetItem] = useState<PdfToPptBatchFileItem | null>(null);

  // In-place rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllersRef = useRef<Record<string, AbortController>>({});

  const activeItem: PdfToPptBatchFileItem | undefined = fileList[activeFileIndex] || fileList[0];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#f59e0b', '#10b981', '#6366f1'],
      });
    } catch {}
  };

  // Asynchronously generate client-side thumbnails for a given file item
  const generateThumbnailsForFile = async (item: PdfToPptBatchFileItem) => {
    try {
      const buffer = await item.file.arrayBuffer();
      const { pdfDoc, summary } = await loadPdfDocument(buffer);
      const totalPages = summary.totalPages;
      const initialPages = Array.from({ length: totalPages }, (_, i) => i + 1);

      setFileList((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                pageCount: totalPages,
                selectedPages: f.selectedPages || initialPages,
                isLoadingThumbnails: true,
              }
            : f
        )
      );

      // Render up to 24 thumbnails client-side
      const maxThumbnails = Math.min(totalPages, 24);
      const thumbs: Record<number, string> = {};

      for (let p = 1; p <= maxThumbnails; p++) {
        try {
          const thumbUrl = await renderPageThumbnail(pdfDoc, p, 300);
          thumbs[p] = thumbUrl;
          if (p % 2 === 0 || p === maxThumbnails) {
            setFileList((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? {
                      ...f,
                      thumbnails: { ...f.thumbnails, ...thumbs },
                    }
                  : f
              )
            );
          }
        } catch (e) {
          console.warn(`Could not render thumbnail for page ${p}`, e);
        }
      }

      setFileList((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                thumbnails: { ...f.thumbnails, ...thumbs },
                isLoadingThumbnails: false,
              }
            : f
        )
      );
    } catch (err: any) {
      if (err && (err.name === 'PasswordException' || err.message === 'PASSWORD_REQUIRED')) {
        setFileList((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, requiresPassword: true, isLoadingThumbnails: false }
              : f
          )
        );
      } else {
        setFileList((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, isLoadingThumbnails: false } : f))
        );
      }
    }
  };

  // Add multiple PDF files
  const handleAddFiles = async (files: FileList | File[]) => {
    setGlobalError('');
    const newItems: PdfToPptBatchFileItem[] = [];
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB

    for (const file of Array.from(files)) {
      const isPdf =
        file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      const isTooLarge = file.size > MAX_SIZE;

      let errorMessage: string | undefined;
      if (!isPdf) {
        errorMessage = 'Formato no compatible. Solo se admiten archivos .pdf.';
      } else if (isTooLarge) {
        errorMessage = `Supera el límite de 50 MB (${formatBytes(file.size)}).`;
      }

      // Check duplicates
      const isDuplicate = fileList.some(
        (item) => item.name === file.name && item.size === file.size
      );
      if (isDuplicate) continue;

      const item: PdfToPptBatchFileItem = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        customName: getPptxFilename(file.name),
        size: file.size,
        status: errorMessage ? 'failed' : 'waiting',
        errorMessage,
        mode: globalMode,
        pageRange: rangeType === 'custom' ? globalPageRange : undefined,
        orientation,
        thumbnails: {},
        selectedPages: [],
        isLoadingThumbnails: !errorMessage,
      };

      newItems.push(item);
    }

    if (newItems.length === 0 && Array.from(files).length > 0) {
      setGlobalError('Los archivos seleccionados ya estaban añadidos.');
      return;
    }

    setFileList((prev) => [...prev, ...newItems]);

    // Kick off client-side thumbnail rendering
    for (const item of newItems) {
      if (item.status === 'waiting') {
        generateThumbnailsForFile(item);
      }
    }
  };

  // Drag & drop handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
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
      e.target.value = '';
    }
  };

  // Toggle slide selection for a file
  const handleToggleSlide = (fileId: string, pageNum: number) => {
    setFileList((prev) =>
      prev.map((item) => {
        if (item.id !== fileId) return item;
        const total = item.pageCount || 1;
        const current = item.selectedPages && item.selectedPages.length > 0
          ? item.selectedPages
          : Array.from({ length: total }, (_, i) => i + 1);

        const isAlreadySelected = current.includes(pageNum);
        const updated = isAlreadySelected
          ? current.filter((p) => p !== pageNum)
          : [...current, pageNum].sort((a, b) => a - b);

        return {
          ...item,
          selectedPages: updated,
          pageRange: updated.length === total ? undefined : updated.join(','),
        };
      })
    );
  };

  // Select all or none
  const handleSelectAllSlides = (fileId: string, selectAll: boolean) => {
    setFileList((prev) =>
      prev.map((item) => {
        if (item.id !== fileId) return item;
        const total = item.pageCount || 1;
        const allPages = Array.from({ length: total }, (_, i) => i + 1);
        const updated = selectAll ? allPages : [];
        return {
          ...item,
          selectedPages: updated,
          pageRange: selectAll ? undefined : '',
        };
      })
    );
  };

  // Invert selection
  const handleInvertSlideSelection = (fileId: string) => {
    setFileList((prev) =>
      prev.map((item) => {
        if (item.id !== fileId) return item;
        const total = item.pageCount || 1;
        const current = item.selectedPages || Array.from({ length: total }, (_, i) => i + 1);
        const inverted = Array.from({ length: total }, (_, i) => i + 1).filter(
          (p) => !current.includes(p)
        );
        return {
          ...item,
          selectedPages: inverted,
          pageRange: inverted.length === total ? undefined : inverted.join(','),
        };
      })
    );
  };

  // Clear single item
  const handleRemoveItem = (id: string) => {
    if (abortControllersRef.current[id]) {
      abortControllersRef.current[id].abort();
      delete abortControllersRef.current[id];
    }
    setFileList((prev) => prev.filter((item) => item.id !== id));
    if (activeFileIndex >= fileList.length - 1) {
      setActiveFileIndex(Math.max(0, fileList.length - 2));
    }
  };

  // Clear all items
  const handleClearAll = () => {
    Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
    abortControllersRef.current = {};
    setFileList([]);
    setActiveFileIndex(0);
    setGlobalError('');
  };

  // Start in-place rename
  const handleStartRename = (item: PdfToPptBatchFileItem) => {
    setEditingId(item.id);
    setEditingName(item.customName.replace(/\.pptx$/i, ''));
  };

  // Save rename
  const handleSaveRename = (id: string) => {
    const sanitized = sanitizePptxFilename(editingName);
    setFileList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, customName: sanitized } : item))
    );
    setEditingId(null);
    setEditingName('');
  };

  // Convert a single file item
  const convertSingleFile = async (
    item: PdfToPptBatchFileItem,
    passwordOverride?: string
  ): Promise<boolean> => {
    const controller = new AbortController();
    abortControllersRef.current[item.id] = controller;

    setFileList((prev) =>
      prev.map((f) =>
        f.id === item.id
          ? {
              ...f,
              status: 'processing',
              progress: 15,
              currentStage: 'Validando documento PDF...',
              errorMessage: undefined,
            }
          : f
      )
    );

    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('mode', item.mode || globalMode);
    formData.append('customName', item.customName);

    const pwd = passwordOverride || item.password;
    if (pwd) {
      formData.append('password', pwd);
    }

    // Determine slide page range
    if (item.selectedPages && item.selectedPages.length > 0 && item.pageCount && item.selectedPages.length < item.pageCount) {
      formData.append('pageRange', item.selectedPages.join(','));
    } else if (item.pageRange) {
      formData.append('pageRange', item.pageRange);
    }

    if (item.orientation || orientation) {
      formData.append('orientation', item.orientation || orientation);
    }

    try {
      const progressTimer1 = setTimeout(() => {
        setFileList((prev) =>
          prev.map((f) =>
            f.id === item.id && f.status === 'processing'
              ? { ...f, progress: 40, currentStage: 'Analizando diapositivas y estructura...' }
              : f
          )
        );
      }, 400);

      const progressTimer2 = setTimeout(() => {
        setFileList((prev) =>
          prev.map((f) =>
            f.id === item.id && f.status === 'processing'
              ? { ...f, progress: 70, currentStage: 'Extrayendo textos, tablas y gráficos...' }
              : f
          )
        );
      }, 1100);

      const progressTimer3 = setTimeout(() => {
        setFileList((prev) =>
          prev.map((f) =>
            f.id === item.id && f.status === 'processing'
              ? { ...f, progress: 90, currentStage: 'Generando presentación PowerPoint (.pptx)...' }
              : f
          )
        );
      }, 2000);

      const response = await fetch('/api/pdf-to-ppt/convert', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      clearTimeout(progressTimer3);

      const data = await response.json();

      if (response.status === 423 && data.requiresPassword) {
        setFileList((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: 'waiting',
                  requiresPassword: true,
                  errorMessage: 'El PDF requiere contraseña para abrirse.',
                }
              : f
          )
        );
        setPasswordTargetItem(item);
        return false;
      }

      if (response.status === 401) {
        setFileList((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: 'waiting',
                  requiresPassword: true,
                  errorMessage: 'Contraseña incorrecta. Inténtalo de nuevo.',
                }
              : f
          )
        );
        setPasswordTargetItem(item);
        return false;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Fallo en la conversión del archivo.');
      }

      const result: PdfToPptConversionResult = {
        id: data.id,
        originalName: data.originalName,
        convertedName: data.convertedName,
        originalSize: data.originalSize,
        pptxSize: data.pptxSize,
        downloadUrl: data.downloadUrl,
        conversionTimeMs: data.conversionTimeMs,
        slideCount: data.slideCount,
        createdAt: data.createdAt,
        mode: data.mode,
      };

      setFileList((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: 'completed',
                progress: 100,
                currentStage: 'Completado',
                result,
              }
            : f
        )
      );

      triggerConfetti();
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setFileList((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: 'waiting', progress: 0, currentStage: undefined }
              : f
          )
        );
        return false;
      }

      setFileList((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: 'failed',
                progress: 0,
                errorMessage: err.message || 'Error desconocido durante la conversión.',
              }
            : f
        )
      );
      return false;
    } finally {
      delete abortControllersRef.current[item.id];
    }
  };

  // Convert all waiting or failed items
  const handleConvertAll = async () => {
    const toConvert = fileList.filter(
      (item) => item.status === 'waiting' || item.status === 'failed'
    );
    if (toConvert.length === 0) return;

    setIsConvertingBatch(true);
    for (const item of toConvert) {
      await convertSingleFile(item);
    }
    setIsConvertingBatch(false);
  };

  // Retry an individual file
  const handleRetryItem = (item: PdfToPptBatchFileItem) => {
    convertSingleFile(item);
  };

  // Cancel in-progress conversion
  const handleCancelItem = (id: string) => {
    if (abortControllersRef.current[id]) {
      abortControllersRef.current[id].abort();
      delete abortControllersRef.current[id];
    }
  };

  // Download all converted as a ZIP
  const handleDownloadAllZip = async () => {
    const completedItems = fileList.filter(
      (item) => item.status === 'completed' && item.result
    );
    if (completedItems.length === 0) return;

    setIsGeneratingZip(true);
    try {
      const itemsPayload = completedItems.map((item) => ({
        downloadUrl: item.result!.downloadUrl,
        filename: item.result!.convertedName,
      }));

      const res = await fetch('/api/pdf-to-ppt/batch-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsPayload }),
      });

      if (!res.ok) {
        throw new Error('No se pudo generar el archivo ZIP.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentaciones-powerpoint-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setGlobalError(err.message || 'Error al descargar el archivo ZIP.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const completedCount = fileList.filter((f) => f.status === 'completed').length;
  const waitingCount = fileList.filter((f) => f.status === 'waiting').length;
  const totalSlides = activeItem?.pageCount || 0;
  const selectedSlideCount =
    activeItem?.selectedPages && activeItem.selectedPages.length > 0
      ? activeItem.selectedPages.length
      : totalSlides;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main SaaS Workspace Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
        
        {/* Floating Quick Action Dock */}
        <div className="border-b border-slate-200/80 bg-slate-50/70 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Modo:
            </span>
            <div className="inline-flex rounded-lg bg-slate-200/60 p-0.5 border border-slate-200/90">
              <button
                type="button"
                onClick={() => setGlobalMode('editable')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  globalMode === 'editable'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Editable</span>
              </button>
              <button
                type="button"
                onClick={() => setGlobalMode('fidelity')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  globalMode === 'fidelity'
                    ? 'bg-white text-purple-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-purple-600" />
                <span>Alta Fidelidad</span>
              </button>
            </div>
          </div>

          {/* Orientation & Quick Toggles */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg bg-slate-200/60 p-0.5 border border-slate-200/90 text-xs">
              <button
                type="button"
                onClick={() => setOrientation('auto')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  orientation === 'auto' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  orientation === 'landscape' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                16:9
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  orientation === 'portrait' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                4:3 / A4
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg border text-slate-600 transition-colors ${
                showSettings ? 'bg-slate-100 border-slate-300 text-slate-900' : 'border-slate-200 hover:bg-slate-100'
              }`}
              title="Configuración avanzada"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Advanced Options Drawer */}
        {showSettings && (
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 animate-in slide-in-from-top-1 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Rango numérico de diapositivas</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ej: 1-5, 8, 12-15 (vacío para todas)"
                    value={globalPageRange}
                    onChange={(e) => setGlobalPageRange(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {globalPageRange && (
                    <button
                      type="button"
                      onClick={() => setGlobalPageRange('')}
                      className="px-2 py-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Puedes ingresar números separados por comas o guiones.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Diferencia entre modos</span>
                </label>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  <strong>Editable:</strong> Cuadros de texto, tablas e imágenes separadas para modificar contenido libremente.<br />
                  <strong>Alta Fidelidad:</strong> Preserva milimétricamente el diseño, fuentes complejas y diagramas exactos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. EMPTY STATE: CLEAN SAAS DRAG & DROP ZONE             */}
        {/* ======================================================== */}
        {fileList.length === 0 && (
          <div className="p-6 sm:p-10">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept=".pdf,application/pdf"
              className="hidden"
            />

            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 scale-[0.995]'
                  : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 bg-slate-50/20'
              }`}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                <Presentation className="w-7 h-7 stroke-[1.75]" />
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Arrastra tu archivo PDF aquí
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                o haz clic para seleccionar tu documento desde este dispositivo
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-2xs transition-all inline-flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Seleccionar archivo PDF</span>
                </button>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200/70 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Documentos PDF</span>
                </span>
                <span>•</span>
                <span>Hasta 50 MB por archivo</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">100% Gratis y Confidencial</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {globalError && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGlobalError('')}
              className="p-1 hover:bg-rose-100 rounded text-rose-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. FILE LOADED: INTERACTIVE SLIDE WORKSPACE              */}
        {/* ======================================================== */}
        {fileList.length > 0 && activeItem && (
          <div className="p-4 sm:p-6 space-y-5">
            {/* Active Document Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <Presentation className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  {editingId === activeItem.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(activeItem.id)}
                        className="px-2 py-0.5 text-xs font-semibold rounded border border-blue-400 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(activeItem.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {activeItem.result ? activeItem.result.convertedName : activeItem.name}
                      </h3>
                      {!activeItem.result && activeItem.status !== 'processing' && (
                        <button
                          type="button"
                          onClick={() => handleStartRename(activeItem)}
                          className="text-slate-400 hover:text-blue-600 p-0.5"
                          title="Cambiar nombre de salida"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{formatBytes(activeItem.size)}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">
                      {totalSlides > 0 ? `${totalSlides} diapositivas` : 'Cargando diapositivas...'}
                    </span>
                    {activeItem.result && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">
                          PPTX: {formatBytes(activeItem.result.pptxSize)}
                        </span>
                        <span>•</span>
                        <span>{formatTime(activeItem.result.conversionTimeMs)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  multiple
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200/70 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir otro</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Eliminar archivos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Multiple files selector tabs if more than 1 file */}
            {fileList.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
                {fileList.map((fileItem, idx) => (
                  <button
                    key={fileItem.id}
                    type="button"
                    onClick={() => setActiveFileIndex(idx)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors ${
                      activeFileIndex === idx
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate max-w-[140px]">{fileItem.name}</span>
                    {fileItem.status === 'completed' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. INTERACTIVE SLIDE THUMBNAIL CANVAS WORKSPACE         */}
            {/* ======================================================== */}
            {!activeItem.result && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Vista previa de diapositivas
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600">
                      {selectedSlideCount} de {totalSlides || '...'} seleccionadas
                    </span>
                  </div>

                  {totalSlides > 1 && (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleSelectAllSlides(activeItem.id, true)}
                        className="text-slate-500 hover:text-blue-600 font-medium text-[11px]"
                      >
                        Todas
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllSlides(activeItem.id, false)}
                        className="text-slate-500 hover:text-blue-600 font-medium text-[11px]"
                      >
                        Ninguna
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => handleInvertSlideSelection(activeItem.id)}
                        className="text-slate-500 hover:text-blue-600 font-medium text-[11px]"
                      >
                        Invertir
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Horizontal Swipe Carousel */}
                <div className="flex sm:hidden overflow-x-auto pb-3 gap-3 snap-x snap-mandatory scrollbar-none -mx-4 px-4">
                  {Array.from({ length: totalSlides || 4 }, (_, i) => i + 1).map((pageNum) => {
                    const isSelected =
                      !activeItem.selectedPages ||
                      activeItem.selectedPages.length === 0 ||
                      activeItem.selectedPages.includes(pageNum);
                    const thumbUrl = activeItem.thumbnails?.[pageNum];

                    return (
                      <div
                        key={pageNum}
                        onClick={() => totalSlides > 0 && handleToggleSlide(activeItem.id, pageNum)}
                        className={`snap-center shrink-0 w-44 rounded-xl border p-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20'
                            : 'border-slate-200 bg-slate-50/50 opacity-50'
                        }`}
                      >
                        <div className="relative aspect-4/3 rounded-lg bg-slate-100 overflow-hidden border border-slate-200/80 flex items-center justify-center">
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={`Diapositiva ${pageNum}`}
                              className="w-full h-full object-contain bg-white"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                              <Loader2 className="w-5 h-5 animate-spin mb-1 text-slate-400" />
                              <span className="text-[10px]">Cargando...</span>
                            </div>
                          )}

                          <div className="absolute top-1.5 right-1.5">
                            {isSelected ? (
                              <div className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded border border-slate-300 bg-white/90" />
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">Slide {pageNum}</span>
                          <span className="text-slate-400 font-mono text-[10px]">16:9</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Grid */}
                <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {Array.from({ length: totalSlides || 4 }, (_, i) => i + 1).map((pageNum) => {
                    const isSelected =
                      !activeItem.selectedPages ||
                      activeItem.selectedPages.length === 0 ||
                      activeItem.selectedPages.includes(pageNum);
                    const thumbUrl = activeItem.thumbnails?.[pageNum];

                    return (
                      <div
                        key={pageNum}
                        onClick={() => totalSlides > 0 && handleToggleSlide(activeItem.id, pageNum)}
                        className={`group relative rounded-xl border p-2.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-white shadow-2xs ring-1 ring-blue-500/20 hover:border-blue-600'
                            : 'border-slate-200 bg-slate-50/50 opacity-40 hover:opacity-75'
                        }`}
                      >
                        <div className="relative aspect-4/3 rounded-lg bg-white overflow-hidden border border-slate-200/90 flex items-center justify-center shadow-2xs">
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={`Diapositiva ${pageNum}`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 p-3 text-center">
                              <Loader2 className="w-5 h-5 animate-spin mb-1 text-slate-400" />
                              <span className="text-[10px]">Cargando vista previa...</span>
                            </div>
                          )}

                          {/* Checkbox badge */}
                          <div className="absolute top-2 right-2">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded border border-slate-300 bg-white/90" />
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">Diapositiva {pageNum}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {orientation === 'portrait' ? 'A4' : '16:9'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In-Progress Conversion Indicator */}
            {activeItem.status === 'processing' && (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{activeItem.currentStage || 'Procesando presentación...'}</span>
                  </span>
                  <span className="font-mono font-bold text-blue-600">{activeItem.progress || 25}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${activeItem.progress || 25}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {activeItem.status === 'failed' && activeItem.errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{activeItem.errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRetryItem(activeItem)}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-100 hover:bg-rose-200 text-rose-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reintentar</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* 4. SUCCESS / DOWNLOAD STATE                             */}
            {/* ======================================================== */}
            {activeItem.status === 'completed' && activeItem.result && (
              <div className="p-6 rounded-xl bg-emerald-50/50 border border-emerald-200/90 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      ¡Presentación PowerPoint Lista para Descargar!
                    </h3>
                    <p className="text-xs text-slate-600">
                      Se han convertido {activeItem.result.slideCount} diapositivas con éxito en formato PPTX auténtico.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={activeItem.result.downloadUrl}
                    download={activeItem.result.convertedName}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 stroke-[2.2]" />
                    <span>Descargar PowerPoint (.pptx)</span>
                  </a>

                  {completedCount > 1 && (
                    <button
                      type="button"
                      onClick={handleDownloadAllZip}
                      disabled={isGeneratingZip}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isGeneratingZip ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                      <span>Descargar todo (.ZIP)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Convertir otro documento
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Action Toolbar (When waiting to convert) */}
            {activeItem.status !== 'completed' && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  <span>Modo: </span>
                  <strong className="text-slate-800">
                    {globalMode === 'editable' ? 'Editable (Texto y tablas)' : 'Alta Fidelidad (1:1)'}
                  </strong>
                  <span> • </span>
                  <span>Proporción: </span>
                  <strong className="text-slate-800 uppercase">{orientation}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConvertAll}
                    disabled={isConvertingBatch || selectedSlideCount === 0}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isConvertingBatch ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Convirtiendo a PPT...</span>
                      </>
                    ) : (
                      <>
                        <span>Convertir a PPT ({selectedSlideCount} diapositivas)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Mobile Bar */}
      {fileList.length > 0 && activeItem && activeItem.status !== 'completed' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
              {activeItem.name}
            </div>
            <div className="text-[11px] text-slate-500">
              {selectedSlideCount} diapositivas • {globalMode === 'editable' ? 'Editable' : 'Fidelidad'}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConvertAll}
            disabled={isConvertingBatch || selectedSlideCount === 0}
            className="px-5 py-2.5 bg-blue-600 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            {isConvertingBatch ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Convirtiendo...</span>
              </>
            ) : (
              <>
                <span>Convertir</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Password Modal */}
      {passwordTargetItem && (
        <PasswordModal
          isOpen={true}
          fileName={passwordTargetItem.name}
          onClose={() => setPasswordTargetItem(null)}
          onSubmit={(pwd) => {
            const target = passwordTargetItem;
            setPasswordTargetItem(null);
            convertSingleFile(target, pwd);
          }}
        />
      )}
    </div>
  );
}

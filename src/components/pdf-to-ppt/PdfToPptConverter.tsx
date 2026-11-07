'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">PDF Protegido</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{fileName}</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Este documento PDF está protegido con contraseña. Ingresa la clave para desbloquear el contenido y convertirlo a PowerPoint:
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

  // Global tool settings applied by default
  const [globalMode, setGlobalMode] = useState<PdfToPptMode>('editable');
  const [globalPageRange, setGlobalPageRange] = useState<string>('');
  const [rangeType, setRangeType] = useState<'all' | 'custom'>('all');
  const [orientation, setOrientation] = useState<'auto' | 'landscape' | 'portrait'>('auto');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Password Modal target
  const [passwordTargetItem, setPasswordTargetItem] = useState<PdfToPptBatchFileItem | null>(null);

  // In-place rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllersRef = useRef<Record<string, AbortController>>({});

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

  // Inspect page count for uploaded PDF
  const inspectPdfPages = async (file: File): Promise<number | undefined> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/pdf-to-ppt/pages', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        return data.pageCount;
      }
    } catch {}
    return undefined;
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
      };

      newItems.push(item);
    }

    if (newItems.length === 0 && Array.from(files).length > 0) {
      setGlobalError('Los archivos seleccionados ya estaban añadidos.');
      return;
    }

    setFileList((prev) => [...prev, ...newItems]);

    // Asynchronously retrieve page count for waiting files
    for (const item of newItems) {
      if (item.status === 'waiting') {
        inspectPdfPages(item.file).then((pCount) => {
          if (pCount) {
            setFileList((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, pageCount: pCount } : f))
            );
          }
        });
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
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveItem = (id: string) => {
    if (abortControllersRef.current[id]) {
      abortControllersRef.current[id].abort();
      delete abortControllersRef.current[id];
    }
    setFileList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCancelItem = (id: string) => {
    if (abortControllersRef.current[id]) {
      abortControllersRef.current[id].abort();
      delete abortControllersRef.current[id];
    }
    setFileList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'waiting',
              progress: 0,
              currentStage: undefined,
              errorMessage: 'Conversión cancelada por el usuario.',
            }
          : item
      )
    );
  };

  const handleClearAll = () => {
    Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
    abortControllersRef.current = {};
    setFileList([]);
    setGlobalError('');
  };

  // Single file conversion worker
  const convertSingleFile = async (
    item: PdfToPptBatchFileItem,
    passwordOverride?: string
  ): Promise<boolean> => {
    const controller = new AbortController();
    abortControllersRef.current[item.id] = controller;

    // Update status to processing
    setFileList((prev) =>
      prev.map((f) =>
        f.id === item.id
          ? {
              ...f,
              status: 'processing',
              progress: 15,
              currentStage: 'Subiendo documento...',
              errorMessage: undefined,
            }
          : f
      )
    );

    const formData = new FormData();
    formData.append('file', item.file);
    if (item.customName) {
      formData.append('customFilename', sanitizePptxFilename(item.customName));
    }
    const pwd = passwordOverride || item.password;
    if (pwd) {
      formData.append('password', pwd);
    }
    formData.append('mode', item.mode || globalMode);
    if (item.pageRange) {
      formData.append('pageRange', item.pageRange);
    }
    if (item.orientation) {
      formData.append('orientation', item.orientation);
    }

    try {
      // Progress simulation stages
      const progressTimer1 = setTimeout(() => {
        setFileList((prev) =>
          prev.map((f) =>
            f.id === item.id && f.status === 'processing'
              ? { ...f, progress: 35, currentStage: 'Analizando páginas y estructura...' }
              : f
          )
        );
      }, 500);

      const progressTimer2 = setTimeout(() => {
        setFileList((prev) =>
          prev.map((f) =>
            f.id === item.id && f.status === 'processing'
              ? { ...f, progress: 65, currentStage: 'Extrayendo textos, tablas e imágenes...' }
              : f
          )
        );
      }, 1200);

      const progressTimer3 = setTimeout(() => {
        setFileList((prev) =>
          prev.map((f) =>
            f.id === item.id && f.status === 'processing'
              ? { ...f, progress: 85, currentStage: 'Generando diapositivas PPTX...' }
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
        // Document requires password
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
        // Password invalid
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

      // Success
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
                slideCount: data.slideCount,
                errorMessage: undefined,
              }
            : f
        )
      );

      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') return false;

      setFileList((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: 'failed',
                progress: 0,
                currentStage: undefined,
                errorMessage: err.message || 'Error inesperado durante la conversión.',
              }
            : f
        )
      );
      return false;
    } finally {
      delete abortControllersRef.current[item.id];
    }
  };

  // Convert all waiting files
  const handleConvertAll = async () => {
    const itemsToProcess = fileList.filter(
      (item) => item.status === 'waiting' || item.status === 'failed'
    );
    if (itemsToProcess.length === 0) return;

    setIsConvertingBatch(true);
    let successCount = 0;

    for (const item of itemsToProcess) {
      const ok = await convertSingleFile(item);
      if (ok) successCount++;
    }

    setIsConvertingBatch(false);
    if (successCount > 0) {
      triggerConfetti();
    }
  };

  // Retry a failed file
  const handleRetryItem = (item: PdfToPptBatchFileItem) => {
    convertSingleFile(item);
  };

  // Batch ZIP download
  const handleDownloadAllZip = async () => {
    const completedItems = fileList.filter(
      (item) => item.status === 'completed' && item.result?.id
    );
    if (completedItems.length === 0) return;

    setIsGeneratingZip(true);
    try {
      const payload = {
        items: completedItems.map((item) => ({
          fileId: item.result!.id,
          customName: item.customName,
        })),
      };

      const res = await fetch('/api/pdf-to-ppt/batch-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('No se pudo generar el archivo ZIP.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'presentaciones_powerpoint.zip';
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

  // Start in-place rename
  const handleStartRename = (item: PdfToPptBatchFileItem) => {
    setEditingId(item.id);
    setEditingName(item.customName.replace(/\.pptx$/i, ''));
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      const sanitized = sanitizePptxFilename(editingName.trim());
      setFileList((prev) =>
        prev.map((f) => (f.id === id ? { ...f, customName: sanitized } : f))
      );
    }
    setEditingId(null);
  };

  const completedCount = fileList.filter((f) => f.status === 'completed').length;
  const waitingCount = fileList.filter((f) => f.status === 'waiting').length;
  const hasProcessing = fileList.some((f) => f.status === 'processing');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      {/* Upload & Workspace Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
        {/* Top Workspace Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 tracking-tight block">
                Conversor PDF a PowerPoint
              </span>
              <span className="text-[11px] text-slate-500">
                Formato PPTX OpenXML • Microsoft PowerPoint / Google Slides
              </span>
            </div>
          </div>

          {/* Quick Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              showSettings
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Opciones de Conversión</span>
            <span className="px-1.5 py-0.2 bg-slate-200/60 rounded text-[10px] uppercase font-mono">
              {globalMode === 'editable' ? 'Editable' : 'Fidelidad'}
            </span>
          </button>
        </div>

        {/* Expandable Settings Drawer */}
        {showSettings && (
          <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200/80 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
              {/* Option 1: Mode */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Modo de Reconstrucción</span>
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-blue-400 transition-colors">
                    <input
                      type="radio"
                      name="globalMode"
                      value="editable"
                      checked={globalMode === 'editable'}
                      onChange={() => setGlobalMode('editable')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block">Modo Editable</span>
                      <span className="text-[11px] text-slate-500 block leading-tight">
                        Cajas de texto, tablas e imágenes separadas editables en PowerPoint.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-blue-400 transition-colors">
                    <input
                      type="radio"
                      name="globalMode"
                      value="fidelity"
                      checked={globalMode === 'fidelity'}
                      onChange={() => setGlobalMode('fidelity')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block">Alta Fidelidad</span>
                      <span className="text-[11px] text-slate-500 block leading-tight">
                        Preserva 1:1 el diseño visual exacto y maquetación compleja.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Option 2: Page Selection */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Selección de Diapositivas</span>
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="rangeType"
                      value="all"
                      checked={rangeType === 'all'}
                      onChange={() => {
                        setRangeType('all');
                        setGlobalPageRange('');
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">Todas las páginas</span>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="rangeType"
                      value="custom"
                      checked={rangeType === 'custom'}
                      onChange={() => setRangeType('custom')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="w-full">
                      <span className="font-semibold text-slate-800 block">Rango personalizado</span>
                      {rangeType === 'custom' && (
                        <input
                          type="text"
                          placeholder="Ej: 1-5, 8, 12-15"
                          value={globalPageRange}
                          onChange={(e) => setGlobalPageRange(e.target.value)}
                          className="mt-1.5 w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Option 3: Slide Orientation */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Proporción de Diapositiva</span>
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="orientation"
                      value="auto"
                      checked={orientation === 'auto'}
                      onChange={() => setOrientation('auto')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">Automático (según PDF)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="orientation"
                      value="landscape"
                      checked={orientation === 'landscape'}
                      onChange={() => setOrientation('landscape')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">Panorámica (16:9 / Horizontal)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="orientation"
                      value="portrait"
                      checked={orientation === 'portrait'}
                      onChange={() => setOrientation('portrait')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">Vertical (A4 / Portada)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        <div className="p-6">
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
                ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
                : 'border-slate-200/90 hover:border-blue-400 hover:bg-slate-50/60 bg-slate-50/20'
            }`}
          >
            <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Arrastra tus documentos PDF aquí
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              o haz clic para explorar tus archivos desde este dispositivo
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-500">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/80">
                Archivos .PDF
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/80">
                Hasta 50 MB por archivo
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/80">
                Conversión por lotes
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="mx-6 mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
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

        {/* File Queue List */}
        {fileList.length > 0 && (
          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Documentos en cola ({fileList.length})
                </span>
                {completedCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    {completedCount} completado{completedCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir más</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-rose-600 transition-colors"
                  title="Limpiar lista"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {fileList.map((item) => {
                const isCompleted = item.status === 'completed';
                const isProcessing = item.status === 'processing';
                const isFailed = item.status === 'failed';
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : isFailed
                        ? 'border-rose-200 bg-rose-50/20'
                        : isProcessing
                        ? 'border-blue-200 bg-blue-50/30'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* File Icon & Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-700'
                              : isFailed
                              ? 'bg-rose-100 text-rose-700'
                              : isProcessing
                              ? 'bg-blue-100 text-blue-700 animate-pulse'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <Presentation className="w-4.5 h-4.5" />
                        </div>

                        <div className="min-w-0">
                          {isEditing ? (
                            <div className="flex items-center gap-2 mb-1">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(item.id)}
                                className="px-2 py-0.5 text-xs font-semibold rounded border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(item.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                                {isCompleted && item.result
                                  ? item.result.convertedName
                                  : item.name}
                              </span>
                              {!isCompleted && !isProcessing && (
                                <button
                                  type="button"
                                  onClick={() => handleStartRename(item)}
                                  className="text-slate-400 hover:text-blue-600 p-0.5"
                                  title="Editar nombre final"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span>{formatBytes(item.size)}</span>
                            {item.pageCount && (
                              <>
                                <span>•</span>
                                <span>{item.pageCount} páginas</span>
                              </>
                            )}
                            {item.result && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-emerald-700">
                                  PPTX: {formatBytes(item.result.pptxSize)}
                                </span>
                                <span>•</span>
                                <span>{item.result.slideCount} diapositivas</span>
                                <span>•</span>
                                <span>{formatTime(item.result.conversionTimeMs)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status / Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isCompleted && item.result && (
                          <a
                            href={item.result.downloadUrl}
                            download={item.result.convertedName}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar PPTX</span>
                          </a>
                        )}

                        {isProcessing && (
                          <button
                            type="button"
                            onClick={() => handleCancelItem(item.id)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                        )}

                        {isFailed && (
                          <button
                            type="button"
                            onClick={() => handleRetryItem(item)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Reintentar</span>
                          </button>
                        )}

                        {!isProcessing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Eliminar de la lista"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress indicator during processing */}
                    {isProcessing && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-blue-700 flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {item.currentStage || 'Procesando diapositivas...'}
                          </span>
                          <span className="font-mono text-slate-500">{item.progress || 10}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${item.progress || 10}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error message detail */}
                    {isFailed && item.errorMessage && (
                      <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.errorMessage}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {waitingCount > 0
                  ? `${waitingCount} archivo${waitingCount > 1 ? 's' : ''} pendiente${waitingCount > 1 ? 's' : ''} de conversión.`
                  : 'Todos los documentos han sido procesados.'}
              </div>

              <div className="flex items-center gap-2">
                {completedCount > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isGeneratingZip}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-900 text-white shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isGeneratingZip ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                    <span>Descargar todos (.ZIP)</span>
                  </button>
                )}

                {waitingCount > 0 && (
                  <button
                    type="button"
                    onClick={handleConvertAll}
                    disabled={isConvertingBatch}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isConvertingBatch ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Convirtiendo a PPT...</span>
                      </>
                    ) : (
                      <>
                        <span>Convertir a PPT</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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

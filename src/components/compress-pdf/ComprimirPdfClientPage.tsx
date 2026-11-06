'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import {
  Upload,
  FileText,
  Minimize2,
  Download,
  Trash2,
  Settings2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  Eye,
  Archive,
  RotateCcw,
  File,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolsModal from '@/components/ToolsModal';
import ContactModal from '@/components/ContactModal';
import RelatedToolsSection from '@/components/RelatedToolsSection';
import { formatBytes } from '@/lib/formatters';
import { CompressMode, CompressOptions, CompressResult, CompressBatchItem } from '@/lib/types';

export default function ComprimirPdfClientPage() {
  // Modal states
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // File queue & active preview
  const [items, setItems] = useState<CompressBatchItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const converterRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  // Compression options
  const [mode, setMode] = useState<CompressMode>('recommended');
  const [targetPreset, setTargetPreset] = useState<string>('none'); // 'none' | '100kb' | '200kb' | '300kb' | '500kb' | '1mb' | '2mb' | '5mb' | 'custom'
  const [customTargetVal, setCustomTargetVal] = useState<string>('1');
  const [customTargetUnit, setCustomTargetUnit] = useState<'KB' | 'MB'>('MB');

  // Advanced options
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [quality, setQuality] = useState<number>(75);
  const [dpi, setDpi] = useState<72 | 96 | 150 | 200 | 300>(150);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(false);
  const [removeThumbnails, setRemoveThumbnails] = useState<boolean>(true);
  const [optimizeStreams, setOptimizeStreams] = useState<boolean>(true);

  // Processing & batch state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Password prompt modal
  const [passwordPromptItem, setPasswordPromptItem] = useState<CompressBatchItem | null>(null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // Comparison viewer controls
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [previewTab, setPreviewTab] = useState<'side-by-side' | 'compressed' | 'original'>('side-by-side');

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Scroll helpers
  const handleScrollToConverter = () => {
    converterRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToFaq = () => {
    faqRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sync mode defaults
  useEffect(() => {
    if (mode === 'basic') {
      setQuality(92);
      setDpi(300);
    } else if (mode === 'extreme') {
      setQuality(45);
      setDpi(96);
    } else {
      setQuality(75);
      setDpi(150);
    }
  }, [mode]);

  // Compute targetSizeKb from preset or custom input
  const getComputedTargetSizeKb = (): number | undefined => {
    if (targetPreset === 'none') return undefined;
    if (targetPreset === '100kb') return 100;
    if (targetPreset === '200kb') return 200;
    if (targetPreset === '300kb') return 300;
    if (targetPreset === '500kb') return 500;
    if (targetPreset === '1mb') return 1024;
    if (targetPreset === '2mb') return 2048;
    if (targetPreset === '5mb') return 5120;
    if (targetPreset === 'custom') {
      const num = parseFloat(customTargetVal);
      if (isNaN(num) || num <= 0) return undefined;
      return customTargetUnit === 'MB' ? Math.round(num * 1024) : Math.round(num);
    }
    return undefined;
  };

  // File addition & validation
  const handleAddFiles = (selectedFiles: FileList | File[]) => {
    setErrorMessage('');
    const validPdfs: File[] = [];

    Array.from(selectedFiles).forEach((f) => {
      if (f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf') {
        if (f.size > 100 * 1024 * 1024) {
          setErrorMessage(`El archivo "${f.name}" excede el límite máximo de 100 MB.`);
        } else {
          validPdfs.push(f);
        }
      } else {
        setErrorMessage(`"${f.name}" no es un documento PDF válido.`);
      }
    });

    if (validPdfs.length === 0) return;

    const newItems: CompressBatchItem[] = validPdfs.map((f, idx) => ({
      id: `item_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      file: f,
      name: f.name,
      size: f.size,
      status: 'waiting',
      progress: 0,
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((it) => it.id !== id);
      if (activeItemIndex >= filtered.length) {
        setActiveItemIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  const handleClearAll = () => {
    setItems([]);
    setActiveItemIndex(0);
    setErrorMessage('');
    setOverallProgress(0);
  };

  // Process a single file through /api/compress
  const processSingleFile = async (
    item: CompressBatchItem,
    passwordOverride?: string
  ): Promise<CompressResult> => {
    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('mode', mode);

    const targetKb = getComputedTargetSizeKb();
    if (targetKb) {
      formData.append('targetSizeKb', targetKb.toString());
    }

    formData.append('quality', quality.toString());
    formData.append('dpi', dpi.toString());
    formData.append('grayscale', grayscale ? 'true' : 'false');
    formData.append('removeMetadata', removeMetadata ? 'true' : 'false');
    formData.append('removeThumbnails', removeThumbnails ? 'true' : 'false');
    formData.append('optimizeStreams', optimizeStreams ? 'true' : 'false');

    const pass = passwordOverride || item.password;
    if (pass) {
      formData.append('password', pass);
    }

    const res = await fetch('/api/compress', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      if (data.isEncrypted || res.status === 401) {
        const err = new Error(data.error || 'PASSWORD_REQUIRED');
        (err as any).isEncrypted = true;
        throw err;
      }
      throw new Error(data.error || 'Error al comprimir el archivo PDF.');
    }

    return data as CompressResult;
  };

  // Run compression on all queued files
  const handleStartCompression = async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage('');
    setOverallProgress(0);

    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      const current = updated[i];
      if (current.status === 'completed' && current.result) {
        continue;
      }

      current.status = 'processing';
      current.progress = 25;
      setItems([...updated]);

      try {
        current.progress = 60;
        setItems([...updated]);

        const result = await processSingleFile(current);
        current.status = 'completed';
        current.progress = 100;
        current.result = result;
        current.pageCount = result.pageCount;
        current.hasDigitalSignature = result.hasDigitalSignature;
        current.isEncrypted = result.isEncrypted;
      } catch (err: any) {
        if (err.isEncrypted) {
          current.status = 'waiting';
          current.isEncrypted = true;
          current.errorMessage = 'Requiere contraseña para desbloquear.';
          setPasswordPromptItem(current);
          setIsProcessing(false);
          return;
        } else {
          current.status = 'failed';
          current.errorMessage = err.message || 'Error durante la compresión.';
        }
      }

      const completedCount = i + 1;
      setOverallProgress(Math.round((completedCount / updated.length) * 100));
      setItems([...updated]);
    }

    setIsProcessing(false);
  };

  // Unlock password-protected PDF
  const handleUnlockPassword = async () => {
    if (!passwordPromptItem || !passwordInput.trim()) return;

    setPasswordError('');
    try {
      const updatedItem = { ...passwordPromptItem, password: passwordInput.trim() };
      const res = await processSingleFile(updatedItem, passwordInput.trim());

      setItems((prev) =>
        prev.map((it) =>
          it.id === passwordPromptItem.id
            ? {
                ...it,
                password: passwordInput.trim(),
                status: 'completed',
                progress: 100,
                result: res,
                pageCount: res.pageCount,
                isEncrypted: true,
                errorMessage: undefined,
              }
            : it
        )
      );

      setPasswordPromptItem(null);
      setPasswordInput('');

      // Continue with remaining files if any
      setTimeout(() => {
        handleStartCompression();
      }, 100);
    } catch (err: any) {
      setPasswordError(
        err.message === 'INVALID_PASSWORD'
          ? 'Contraseña incorrecta. Por favor, verifica e intenta nuevamente.'
          : err.message || 'Error al descifrar el documento.'
      );
    }
  };

  // Download all completed items as a single ZIP file
  const handleDownloadAllZip = async () => {
    const completedItems = items.filter((it) => it.status === 'completed' && it.result);
    if (completedItems.length === 0) return;

    try {
      const zip = new JSZip();

      for (const it of completedItems) {
        if (!it.result) continue;
        const res = await fetch(it.result.downloadUrl);
        const blob = await res.blob();
        const fname = it.result.compressedName || `${it.name.replace(/\.pdf$/i, '')}-comprimido.pdf`;
        zip.file(fname, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'archivos_pdf_comprimidos.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMessage('No se pudo generar el archivo ZIP descargable.');
    }
  };

  const activeItem = items[activeItemIndex] || null;
  const activeResult = activeItem?.result || null;
  const hasCompletedItems = items.some((it) => it.status === 'completed' && it.result);
  const anyDigitalSignatures = items.some((it) => it.result?.hasDigitalSignature || it.hasDigitalSignature);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Global Header */}
      <Header
        activeTool="comprimir-pdf"
        onOpenTools={() => setIsToolsModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
        onScrollToConverter={handleScrollToConverter}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          ref={converterRef}
          className="pt-8 sm:pt-12 pb-6 px-4 sm:px-6 max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-3">
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Herramienta Oficial de Reducción de Tamaño PDF</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprimir PDF Gratis Online
          </h1>

          <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Reduce el tamaño de tus archivos PDF al máximo sin perder calidad visual. Optimiza documentos para correos, portales oficiales y trámites gubernamentales en segundos.
          </p>
        </section>

        {/* Studio Workspace Container */}
        <section className="px-4 sm:px-6 max-w-4xl mx-auto pb-12">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Top Area: Drag & Drop Upload Zone */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/50">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
                    : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    if (e.target.files) handleAddFiles(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Arrastra y suelta tus archivos PDF aquí
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  o haz clic para explorar en tu dispositivo (hasta 100 MB por archivo)
                </p>

                <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Procesamiento privado
                  </span>
                  <span>•</span>
                  <span>Sin límites de archivos</span>
                  <span>•</span>
                  <span>100% Gratuito</span>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {anyDigitalSignatures && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Aviso importante:</strong> Se detectó una firma digital criptográfica en uno o más documentos. Modificar y recomprimir un PDF firmado puede invalidar su sello digital original.
                  </span>
                </div>
              )}
            </div>

            {/* Queue & Settings Panel (When files are present) */}
            {items.length > 0 && (
              <div className="p-5 sm:p-6 space-y-6">
                {/* File Queue Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Archivos cargados ({items.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                      >
                        + Añadir más PDFs
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Limpiar</span>
                      </button>
                    </div>
                  </div>

                  {/* File List Cards */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        onClick={() => setActiveItemIndex(idx)}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          activeItemIndex === idx
                            ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {formatBytes(item.size)}
                              {item.pageCount ? ` • ${item.pageCount} pág.` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {item.status === 'processing' && (
                            <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Comprimiendo...</span>
                            </div>
                          )}

                          {item.status === 'completed' && item.result && (
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                -{item.result.reductionPercent}%
                              </span>
                              <span className="block text-[10px] text-slate-500 mt-0.5">
                                {formatBytes(item.result.compressedSize)}
                              </span>
                            </div>
                          )}

                          {item.status === 'failed' && (
                            <span className="text-rose-600 text-[11px] font-medium flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Error
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            aria-label="Eliminar archivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compression Mode Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Modo de compresión:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Basic */}
                    <div
                      onClick={() => setMode('basic')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        mode === 'basic'
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">Compresión básica</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Sin pérdida
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Preserva la calidad fotográfica al máximo. Ideal para portafolios y planos donde la nitidez es crítica.
                      </p>
                      <span className="mt-2 block text-[10px] text-slate-400 font-mono">
                        Reducción est.: 20% a 40%
                      </span>
                    </div>

                    {/* Recommended */}
                    <div
                      onClick={() => setMode('recommended')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative ${
                        mode === 'recommended'
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">Recomendada</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                          Estándar
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Equilibrio perfecto entre ligereza y nitidez. Adecuado para contratos, facturas y correos.
                      </p>
                      <span className="mt-2 block text-[10px] text-slate-400 font-mono">
                        Reducción est.: 50% a 70%
                      </span>
                    </div>

                    {/* Extreme */}
                    <div
                      onClick={() => setMode('extreme')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        mode === 'extreme'
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">Extrema (Al máximo)</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Máximo ahorro
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Fuerte compresión de imágenes para plataformas gubernamentales con límites menores a 1MB o 2MB.
                      </p>
                      <span className="mt-2 block text-[10px] text-slate-400 font-mono">
                        Reducción est.: 75% a 90%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target File Size Section */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tamaño objetivo de destino (Opcional):
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Ajuste automático para trámites
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'none', label: 'Sin límite' },
                      { id: '100kb', label: '100 KB' },
                      { id: '200kb', label: '200 KB' },
                      { id: '300kb', label: '300 KB' },
                      { id: '500kb', label: '500 KB' },
                      { id: '1mb', label: '1 MB' },
                      { id: '2mb', label: '2 MB' },
                      { id: '5mb', label: '5 MB' },
                      { id: 'custom', label: 'Personalizado' },
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setTargetPreset(chip.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          targetPreset === chip.id
                            ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {targetPreset === 'custom' && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 max-w-sm">
                      <span className="text-xs text-slate-600">Reducir a menos de:</span>
                      <input
                        type="number"
                        min="10"
                        step="1"
                        value={customTargetVal}
                        onChange={(e) => setCustomTargetVal(e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <select
                        value={customTargetUnit}
                        onChange={(e) => setCustomTargetUnit(e.target.value as any)}
                        className="px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      >
                        <option value="MB">MB</option>
                        <option value="KB">KB</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Advanced Settings (Collapsible) */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                  >
                    <Settings2 className="w-4 h-4 text-slate-500" />
                    <span>Configuración avanzada</span>
                    {isAdvancedOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isAdvancedOpen && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
                      {/* Quality Slider */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700">
                            Calidad de imágenes JPEG:
                          </span>
                          <span className="font-mono font-bold text-blue-600">{quality}%</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="95"
                          step="5"
                          value={quality}
                          onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                          <span>40% (Muy ligero)</span>
                          <span>75% (Equilibrado)</span>
                          <span>95% (Máxima nitidez)</span>
                        </div>
                      </div>

                      {/* DPI Selector */}
                      <div>
                        <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Resolución máxima de imágenes (DPI):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                          {[
                            { val: 72, label: '72 DPI (Web)' },
                            { val: 96, label: '96 DPI (Pantalla)' },
                            { val: 150, label: '150 DPI (Recomendado)' },
                            { val: 200, label: '200 DPI (Oficina)' },
                            { val: 300, label: '300 DPI (Impresión)' },
                          ].map((d) => (
                            <button
                              key={d.val}
                              type="button"
                              onClick={() => setDpi(d.val as any)}
                              className={`py-1.5 px-2 rounded-md text-[11px] font-medium border text-center transition-colors ${
                                dpi === d.val
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Checkbox Options */}
                      <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={grayscale}
                            onChange={(e) => setGrayscale(e.target.checked)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-800">
                              Convertir a escala de grises
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              Ahorra hasta un 25% extra en documentos impresos.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={removeMetadata}
                            onChange={(e) => setRemoveMetadata(e.target.checked)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-800">
                              Eliminar metadatos
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              Borra información del autor, software y fecha.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={removeThumbnails}
                            onChange={(e) => setRemoveThumbnails(e.target.checked)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-800">
                              Optimizar miniaturas
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              Elimina imágenes en caché embebidas en páginas.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={optimizeStreams}
                            onChange={(e) => setOptimizeStreams(e.target.checked)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-800">
                              Comprimir flujos y vectores
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              Reempaqueta con codificación Flate sin pérdida.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {hasCompletedItems ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Compresión finalizada. Revisa los resultados a continuación.
                      </span>
                    ) : (
                      <span>Todo listo para iniciar la compresión optimizada.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {hasCompletedItems && items.length > 1 && (
                      <button
                        type="button"
                        onClick={handleDownloadAllZip}
                        className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Archive className="w-3.5 h-3.5 text-slate-600" />
                        <span>Descargar todos en ZIP</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleStartCompression}
                      disabled={isProcessing}
                      className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Comprimiendo ({overallProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Minimize2 className="w-4 h-4" />
                          <span>
                            {hasCompletedItems
                              ? 'Recomprimir con estos ajustes'
                              : items.length > 1
                              ? `Comprimir ${items.length} archivos PDF`
                              : 'Comprimir PDF ahora'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results & Visual Comparison Section */}
            {activeResult && (
              <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50/60 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Resultados de Compresión: {activeItem?.name}</span>
                    </h3>

                    {activeResult.targetSizeAchieved !== null && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                          activeResult.targetSizeAchieved
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {activeResult.targetSizeAchieved
                          ? `✓ Objetivo de ${activeResult.targetSizeKb} KB alcanzado`
                          : `Límite técnico: peso mínimo ${formatBytes(activeResult.compressedSize)}`}
                      </span>
                    )}
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Tamaño Original
                      </span>
                      <strong className="text-sm font-bold text-slate-700 mt-0.5 block">
                        {formatBytes(activeResult.originalSize)}
                      </strong>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-blue-200 bg-blue-50/30">
                      <span className="block text-[10px] uppercase font-bold text-blue-500">
                        Comprimido
                      </span>
                      <strong className="text-sm font-bold text-blue-700 mt-0.5 block">
                        {formatBytes(activeResult.compressedSize)}
                      </strong>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-emerald-200 bg-emerald-50/30">
                      <span className="block text-[10px] uppercase font-bold text-emerald-600">
                        Ahorro Logrado
                      </span>
                      <strong className="text-sm font-bold text-emerald-700 mt-0.5 block">
                        -{activeResult.reductionPercent}%
                      </strong>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Páginas Intactas
                      </span>
                      <strong className="text-sm font-bold text-slate-700 mt-0.5 block">
                        {activeResult.pageCount || 1}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 text-center">
                    {activeResult.message}
                  </p>
                </div>

                {/* Visual Before / After Comparison Studio */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-800">
                        Inspección visual antes y después:
                      </span>
                    </div>

                    {/* View mode toggle & Zoom */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setPreviewTab('side-by-side')}
                          className={`px-2 py-1 text-[11px] font-medium ${
                            previewTab === 'side-by-side'
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Lado a lado
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewTab('compressed')}
                          className={`px-2 py-1 text-[11px] font-medium ${
                            previewTab === 'compressed'
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Solo comprimido
                        </button>
                      </div>

                      <div className="flex items-center gap-1 border border-slate-200 rounded-md px-1 py-0.5 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setPreviewZoom((z) => Math.max(50, z - 25))}
                          className="p-1 text-slate-500 hover:text-slate-800"
                          aria-label="Alejar"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-[11px] px-1 text-slate-700">
                          {previewZoom}%
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom((z) => Math.min(200, z + 25))}
                          className="p-1 text-slate-500 hover:text-slate-800"
                          aria-label="Acercar"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preview Frames */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Frame */}
                    {(previewTab === 'side-by-side' || previewTab === 'original') && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span>Documento Original</span>
                          <span className="text-[11px] text-slate-400">
                            {formatBytes(activeResult.originalSize)}
                          </span>
                        </div>
                        <div className="h-72 sm:h-96 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden relative flex items-center justify-center">
                          {activeResult.originalPreviewUrl ? (
                            <iframe
                              src={activeResult.originalPreviewUrl}
                              title="Vista previa original"
                              className="w-full h-full border-0"
                              style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
                            />
                          ) : (
                            <div className="text-center p-4 text-xs text-slate-400">
                              Vista previa del original lista para comparar.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Compressed Frame */}
                    {(previewTab === 'side-by-side' || previewTab === 'compressed') && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Documento Comprimido (Optimizado)
                          </span>
                          <span className="text-[11px] font-bold text-blue-600">
                            {formatBytes(activeResult.compressedSize)}
                          </span>
                        </div>
                        <div className="h-72 sm:h-96 rounded-lg border border-blue-200 bg-slate-100 overflow-hidden relative flex items-center justify-center">
                          {activeResult.previewUrl ? (
                            <iframe
                              src={activeResult.previewUrl}
                              title="Vista previa comprimida"
                              className="w-full h-full border-0"
                              style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
                            />
                          ) : (
                            <div className="text-center p-4 text-xs text-slate-400">
                              Vista previa no disponible.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Download CTA Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-500">
                    Descarga tu archivo optimizado listo para enviar o subir.
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={activeResult.downloadUrl}
                      download={activeResult.compressedName || 'documento-comprimido.pdf'}
                      className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar PDF Comprimido</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Step-by-Step Instructions */}
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80">
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Cómo comprimir un archivo PDF gratis paso a paso
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Sigue esta sencilla guía para reducir el peso de tus documentos PDF sin complicaciones técnicas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Sube tu documento',
                desc: 'Arrastra tus archivos PDF o selecciónalos desde tu ordenador, tableta o teléfono celular.',
              },
              {
                step: '02',
                title: 'Elige el nivel',
                desc: 'Selecciona entre compresión básica (calidad intacta), recomendada o extrema para mayor ahorro.',
              },
              {
                step: '03',
                title: 'Inicia la compresión',
                desc: 'Haz clic en "Comprimir PDF" y nuestro motor optimizará flujos, fuentes e imágenes al instante.',
              },
              {
                step: '04',
                title: 'Descarga el resultado',
                desc: 'Compara la reducción de peso obtenida y descarga tu PDF comprimido o un lote completo en ZIP.',
              },
            ].map((st) => (
              <div
                key={st.step}
                className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs relative"
              >
                <span className="font-mono text-2xl font-black text-blue-600/30 block mb-2">
                  {st.step}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                  {st.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Modes Explanation */}
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80 bg-white/70">
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Niveles de compresión: Calidad versus reducción de tamaño
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Conoce en detalle cómo opera cada perfil de compresión para seleccionar el adecuado para tu documento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Compresión básica (Sin perder calidad)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prioriza la fidelidad visual absoluta. Aplica re-empaquetado Flate/Deflate sin pérdida en los flujos de contenido, elimina metadatos residuales y descarta objetos no referenciados. Las imágenes conservan sus 300 DPI y nunca se rasterizan las fuentes ni los vectores.
              </p>
              <ul className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                <li>• Preservación 100% de vectores y tipografías</li>
                <li>• No afecta la legibilidad de textos pequeños</li>
                <li>• Reducción de hasta un 40% del peso</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/20 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Compresión recomendada (Estándar)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El perfil preferido para el 90% de los documentos. Realiza un submuestreo inteligente de imágenes a 150 DPI y ajusta la compresión JPEG al 75%. Es la opción idónea para contratos, balances contables y tesis que deben enviarse como adjuntos por correo electrónico.
              </p>
              <ul className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                <li>• Equilibrio visual óptimo para pantalla e impresión</li>
                <li>• Reduce imágenes redundantes y miniaturas</li>
                <li>• Reducción habitual de 50% a 70%</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Compresión extrema (Al máximo)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diseñado para situaciones donde la prioridad número uno es cumplir un límite estricto de megabytes. Aplica cuantización agresiva y resolución a 96 DPI. Puede presentar una disminución visible en la nitidez fotográfica, pero garantiza la legibilidad textual.
              </p>
              <ul className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                <li>• Diseñado para portales de trámites del gobierno</li>
                <li>• Reducción drástica de 75% a 90%</li>
                <li>• Compatible con límites de 1MB, 2MB y 300KB</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Target File Size Guide for Official Procedures */}
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80">
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Comprimir PDF a 1MB, 2MB o menos: Guía para trámites oficiales
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Instrucciones y recomendaciones prácticas para superar los topes de carga en ventanillas digitales y portales educativos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  2M
                </span>
                <span>Comprimir PDF a 2MB (Buzón Tributario, SAT y Empleo)</span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Plataformas tributarias y bolsas de trabajo internacionales exigen documentos menores a 2 MB (2,048 KB). Con la compresión recomendada, un PDF escaneado de 10 MB a 15 MB se ajusta fácilmente a este rango sin degradar firmas ni sellos legibles.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                  1M
                </span>
                <span>Comprimir PDF a 1MB (Universidades y Becas)</span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Para postulaciones académicas y sistemas escolares que admiten un tope de 1,024 KB, utiliza el modo extremo o selecciona el preset de 1 MB. El motor ajustará el submuestreo de las páginas escaneadas preservando la nitidez de las calificaciones.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                  300
                </span>
                <span>Comprimir PDF a 300 KB o 500 KB (Credenciales y Visas)</span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Ventanillas consulares solicitan pasaportes e identificaciones a menos de 300 KB o 500 KB. Activar la opción de escala de grises y una resolución de 96 DPI permite reducir el archivo drásticamente conservando el texto tipográfico legible.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                  25M
                </span>
                <span>Comprimir para Correo Electrónico (Gmail, Outlook)</span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Los clientes de correo rechazan adjuntos superiores a 25 MB. Comprimir presentaciones o reportes corporativos de 80 MB a 100 MB permite compartirlos directamente sin depender de enlaces externos de almacenamiento en la nube.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Explanation: How PDF Compression Works */}
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80 bg-white/70">
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              ¿Cómo funciona la compresión de archivos PDF?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Un recorrido técnico accesible sobre las técnicas aplicadas para aligerar documentos digitales.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Un archivo PDF es un formato de documento portátil que encapsula no solo texto, sino tipografías incrustadas, secuencias vectoriales, diccionarios de metadatos y matrices binarias de imágenes. En muchos casos, los archivos PDF generados por programas de oficina o escáneres multifuncionales contienen gran cantidad de datos redundantes o ineficientemente codificados.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-bold text-slate-900 mb-1 text-xs sm:text-sm">
                  1. Submuestreo y Cuantización de Imágenes
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600">
                  Las imágenes escaneadas a 300 o 600 DPI para impresión física contienen millones de píxeles invisibles en pantallas estándar. El motor recalibra la resolución a 150 o 96 DPI mediante interpolación bicúbica y re-comprime con algoritmos DCT/JPEG optimizados.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-bold text-slate-900 mb-1 text-xs sm:text-sm">
                  2. Subsetting y Deduplicación de Objetos
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600">
                  Muchos documentos incrustan múltiples copias de la misma fuente o logotipo en cada página. Nuestra herramienta detecta objetos idénticos y los unifica en una única referencia compartida en la tabla de referencias cruzadas (XREF).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-bold text-slate-900 mb-1 text-xs sm:text-sm">
                  3. Eliminación de Metadatos y Miniaturas Ocultas
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600">
                  Los programas de diseño suelen adjuntar historiales de edición, miniaturas de página renderizadas y capas de software que ya no son necesarias. El depurador estructural descarta estos bloques sin alterar la lectura visual.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-bold text-slate-900 mb-1 text-xs sm:text-sm">
                  4. Compresión Flate de Secuencias de Texto
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600">
                  Todos los operadores tipográficos, descripciones de trazados vectoriales e instrucciones de maquetación se compactan mediante el algoritmo estándar Deflate/Flate, garantizando reducción de peso sin perder un solo carácter de texto editable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Privacy Highlights */}
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80">
          <div className="p-6 sm:p-8 rounded-2xl bg-blue-900 text-white shadow-md relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-800 text-blue-200 border border-blue-700/60 inline-block">
                Privacidad y Confidencialidad
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Compresión Segura de Documentos PDF
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Tus archivos contienen información sensible: facturas, registros legales, identificaciones y balances financieros. Implementamos políticas de estricta protección de datos:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Cifrado SSL de extremo a extremo durante la transmisión.</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Eliminación automática de archivos temporales de la memoria.</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Sin creación de cuentas, registros ni recopilación de correos.</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Sin uso de tus documentos para entrenamiento de inteligencia artificial.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80">
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Preguntas frecuentes sobre cómo comprimir archivos PDF
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Respuestas directas y claras a las consultas más habituales de los usuarios.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '¿Cómo comprimir un archivo PDF gratis sin perder calidad?',
                a: 'Para comprimir un PDF sin perder nitidez visual, utiliza el modo de "Compresión básica". Este nivel optimiza las estructuras internas y las tablas de objetos aplicando compresión Flate sin alterar la resolución de las imágenes ni convertir las fuentes en mapa de bits. Las tipografías y gráficos vectoriales permanecen 100% nítidos.',
              },
              {
                q: '¿Cómo comprimir un archivo PDF en el celular (iPhone o Android)?',
                a: 'No necesitas instalar aplicaciones pesadas ni de pago. Abre Safari o Google Chrome en tu teléfono celular, ingresa a esta página y pulsa en el botón de selección de archivos. Selecciona el PDF guardado en la memoria de tu teléfono o en la nube (iCloud / Google Drive), elige el modo de compresión y pulsa Descargar. El PDF comprimido se guardará directamente en tu carpeta de descargas.',
              },
              {
                q: '¿Puedo comprimir un PDF a 1MB o 2MB para trámites oficiales?',
                a: 'Sí. Selecciona la opción de "Tamaño objetivo" y marca el preset de 1 MB o 2 MB (o el valor personalizado requerido). Nuestro motor de compresión realizará pasadas iterativas ajustando de forma balanceada la resolución de las imágenes incrustadas hasta lograr que el documento pese menos del límite reglamentario sin eliminar páginas ni texto esencial.',
              },
              {
                q: '¿Es seguro comprimir documentos con información confidencial o bancaria?',
                a: 'Totalmente seguro. El procesamiento de los documentos se ejecuta bajo canales cifrados HTTPS y los archivos temporales se purgan automáticamente de la memoria una vez completada la sesión. No almacenamos copias permanentes, no compartimos tu información con terceros ni vendemos datos a anunciantes.',
              },
              {
                q: '¿Cuál es la diferencia entre compresión con pérdida y compresión sin pérdida?',
                a: 'La compresión sin pérdida optimiza la codificación interna, elimina metadatos duplicados y compacta secuencias de texto sin modificar un solo píxel de las imágenes. La compresión con pérdida recalibra inteligentemente la resolución y cuantización de las imágenes fotográficas incrustadas para alcanzar reducciones drásticas del 70% al 90% del tamaño del archivo.',
              },
              {
                q: '¿Puedo comprimir varios archivos PDF al mismo tiempo (por lotes)?',
                a: 'Sí, nuestra herramienta soporta la compresión múltiple o por lotes. Puedes arrastrar varios documentos PDF al área de carga a la vez. Cada archivo se procesará con los ajustes que definas y podrás descargarlos individualmente o empaquetados en un único archivo ZIP descargable con un solo clic.',
              },
              {
                q: '¿Qué hago si mi PDF está protegido con contraseña?',
                a: 'Si tu documento PDF cuenta con cifrado de apertura, el sistema lo detectará automáticamente y te solicitará ingresar la contraseña legítima para poder descifrar los flujos internos y aplicar la optimización. En ningún momento se vulnera la seguridad criptográfica ni se exponen las claves en texto plano.',
              },
              {
                q: '¿Por qué algunos archivos PDF casi no se reducen de tamaño?',
                a: 'Si un documento PDF está compuesto primordialmente por texto vectorial puro o ya fue optimizado previamente con herramientas avanzadas, los flujos internos ya se encuentran en su mínima expresión matemática. En estos casos, nuestro sistema te notificará que el archivo ya cuenta con un tamaño óptimo.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 hover:text-blue-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Related Tools Directory */}
        <RelatedToolsSection
          currentTool="comprimir-pdf"
          onOpenTools={() => setIsToolsModalOpen(true)}
        />
      </main>

      {/* Global Footer */}
      <Footer
        onOpenTools={() => setIsToolsModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
        onScrollToConverter={handleScrollToConverter}
        onScrollToFaq={handleScrollToFaq}
      />

      {/* Tools Modal */}
      <ToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        activeTool="comprimir-pdf"
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Password Prompt Modal (For Encrypted PDFs) */}
      {passwordPromptItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">PDF Protegido</h4>
                <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {passwordPromptItem.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Este archivo PDF está cifrado con una contraseña de apertura. Ingrésala para poder descomprimir y procesar el documento.
            </p>

            {passwordError && (
              <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contraseña:
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUnlockPassword();
                }}
                placeholder="Ingresa la contraseña del PDF..."
                autoFocus
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPasswordPromptItem(null);
                  setPasswordInput('');
                  setPasswordError('');
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUnlockPassword}
                disabled={!passwordInput.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Desbloquear y procesar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

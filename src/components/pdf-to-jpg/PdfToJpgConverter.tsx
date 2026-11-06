'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  RefreshCw,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Archive,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  List,
  FolderDown,
  ArrowRight,
} from 'lucide-react';
import {
  PdfJpgSettings,
  DEFAULT_PDF_JPG_SETTINGS,
  DPI_OPTIONS,
  QUALITY_OPTIONS,
  ConvertedJpgImage,
  PdfDocumentSummary,
  loadPdfDocument,
  renderPageThumbnail,
  convertPdfToJpg,
  createZipArchive,
  triggerDownload,
  resolvePagesToConvert,
  JpgDpi,
} from '@/lib/pdfToJpgConverter';
import { formatBytes, sanitizeZipFilename } from '@/lib/formatters';
import PdfToJpgPreviewModal from './PdfToJpgPreviewModal';

export default function PdfToJpgConverter() {
  // File and document state
  const [file, setFile] = useState<File | null>(null);
  const [pdfSummary, setPdfSummary] = useState<PdfDocumentSummary | null>(null);
  const [pdfDocInstance, setPdfDocInstance] = useState<any | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Conversion settings
  const [settings, setSettings] = useState<PdfJpgSettings>(DEFAULT_PDF_JPG_SETTINGS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Lazy thumbnail cache
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState<Record<number, boolean>>({});

  // Conversion progress & results
  const [isConverting, setIsConverting] = useState(false);
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [progressPageNum, setProgressPageNum] = useState(0);
  const [convertedImages, setConvertedImages] = useState<ConvertedJpgImage[]>([]);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Results display mode & full preview modal
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on teardown
  useEffect(() => {
    return () => {
      convertedImages.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [convertedImages]);

  // Load and analyze PDF
  const handlePdfUpload = useCallback(async (selectedFile: File) => {
    setErrorMessage(null);
    setConvertedImages([]);
    setThumbnails({});

    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setErrorMessage('Por favor, selecciona un archivo en formato PDF válido.');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setErrorMessage('El archivo excede el límite máximo de 100 MB.');
      return;
    }

    setIsLoadingPdf(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const { pdfDoc, summary } = await loadPdfDocument(buffer);
      summary.filename = selectedFile.name;

      setFile(selectedFile);
      setPdfSummary(summary);
      setPdfDocInstance(pdfDoc);

      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '').trim() || 'documento';
      setSettings((prev) => ({
        ...prev,
        filenamePrefix: baseName,
        zipFilename: `${baseName}-jpg.zip`,
        selectedPages: Array.from({ length: summary.totalPages }, (_, i) => i + 1),
      }));

      // Render first 8 thumbnails asynchronously
      const initialThumbCount = Math.min(8, summary.totalPages);
      for (let p = 1; p <= initialThumbCount; p++) {
        renderThumbnailForPage(pdfDoc, p);
      }
    } catch (err: any) {
      if (err.message === 'PASSWORD_REQUIRED') {
        setErrorMessage(
          'Este archivo PDF está protegido con contraseña. Esta versión no permite abrir documentos cifrados sin descifrado previo.'
        );
      } else {
        setErrorMessage(err.message || 'Error al procesar el archivo PDF.');
      }
    } finally {
      setIsLoadingPdf(false);
    }
  }, []);

  const renderThumbnailForPage = async (pdfDoc: any, pageNumber: number) => {
    if (thumbnails[pageNumber] || loadingThumbnails[pageNumber]) return;
    setLoadingThumbnails((prev) => ({ ...prev, [pageNumber]: true }));
    try {
      const url = await renderPageThumbnail(pdfDoc, pageNumber, 240);
      setThumbnails((prev) => ({ ...prev, [pageNumber]: url }));
    } catch {
      // Fallback
    } finally {
      setLoadingThumbnails((prev) => ({ ...prev, [pageNumber]: false }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfUpload(e.target.files[0]);
    }
  };

  const handleReset = () => {
    convertedImages.forEach((img) => URL.revokeObjectURL(img.url));
    setFile(null);
    setPdfSummary(null);
    setPdfDocInstance(null);
    setConvertedImages([]);
    setThumbnails({});
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Toggle page in selectedPages
  const togglePageSelection = (pageNum: number) => {
    setSettings((prev) => {
      const current = prev.selectedPages || [];
      const exists = current.includes(pageNum);
      const updated = exists ? current.filter((p) => p !== pageNum) : [...current, pageNum];
      return {
        ...prev,
        pageSelectionMode: 'selected',
        selectedPages: updated,
      };
    });
  };

  const selectAllPages = (selectAll: boolean) => {
    if (!pdfSummary) return;
    setSettings((prev) => ({
      ...prev,
      pageSelectionMode: selectAll ? 'all' : 'selected',
      selectedPages: selectAll ? Array.from({ length: pdfSummary.totalPages }, (_, i) => i + 1) : [],
    }));
  };

  // Run conversion
  const handleStartConversion = async () => {
    if (!pdfDocInstance || !pdfSummary || !file) return;

    setIsConverting(true);
    setErrorMessage(null);
    setProgressCurrent(0);
    setProgressTotal(resolvePagesToConvert(settings, pdfSummary.totalPages).length);

    try {
      const images = await convertPdfToJpg(
        pdfDocInstance,
        file.name,
        settings,
        (current, total, pageNum) => {
          setProgressCurrent(current);
          setProgressTotal(total);
          setProgressPageNum(pageNum);
        }
      );
      setConvertedImages(images);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error durante la conversión a imágenes JPG.');
    } finally {
      setIsConverting(false);
    }
  };

  // ZIP Downloads
  const handleDownloadAllZip = async () => {
    if (convertedImages.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);
    try {
      const zipName = sanitizeZipFilename(
        settings.zipFilename.trim() || `${settings.filenamePrefix || 'documento'}-jpg.zip`
      );
      const zipBlob = await createZipArchive(convertedImages, zipName, (percent) => {
        setZipProgress(percent);
      });
      triggerDownload(zipBlob, zipName);
    } catch {
      setErrorMessage('Error al generar el archivo ZIP de imágenes.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSelectedZip = async () => {
    const selected = convertedImages.filter((img) => img.selected);
    if (selected.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);
    try {
      const zipName = sanitizeZipFilename(
        `${settings.filenamePrefix || 'documento'}-seleccion-jpg.zip`
      );
      const zipBlob = await createZipArchive(selected, zipName, (percent) => {
        setZipProgress(percent);
      });
      triggerDownload(zipBlob, zipName);
    } catch {
      setErrorMessage('Error al empaquetar imágenes seleccionadas.');
    } finally {
      setIsZipping(false);
    }
  };

  const toggleImageSelection = (id: string) => {
    setConvertedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, selected: !img.selected } : img))
    );
  };

  const selectAllConvertedImages = (select: boolean) => {
    setConvertedImages((prev) => prev.map((img) => ({ ...img, selected: select })));
  };

  const openPreviewAtIndex = (index: number) => {
    setPreviewIndex(index);
    setPreviewModalOpen(true);
  };

  const activePagesToConvert = pdfSummary
    ? resolvePagesToConvert(settings, pdfSummary.totalPages)
    : [];

  const totalConvertedSize = convertedImages.reduce((acc, curr) => acc + curr.fileSize, 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4" id="conversor">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,application/pdf"
        className="hidden"
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-md border border-rose-200 bg-rose-50 text-rose-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-semibold shrink-0"
          >
            Descartar
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STATE 1: Clean Minimalist Rectangular Upload Box              */}
      {/* ------------------------------------------------------------- */}
      {!file && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border rounded-lg p-8 sm:p-10 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-blue-600 bg-blue-50/50'
              : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/40 shadow-2xs'
          }`}
        >
          <div className="w-10 h-10 mx-auto mb-3 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200/60">
            {isLoadingPdf ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <UploadCloud className="w-5 h-5 text-slate-600" />
            )}
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
            {isLoadingPdf ? 'Analizando documento PDF...' : 'Arrastra y suelta tu archivo PDF aquí'}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            o haz clic para seleccionar desde tu computadora o dispositivo móvil
          </p>

          <div className="mt-4">
            <button
              type="button"
              disabled={isLoadingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-2xs"
            >
              <FileText className="w-4 h-4" />
              <span>Seleccionar archivo PDF</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-400">
            <span>Formato admitido: PDF (.pdf)</span>
            <span>•</span>
            <span>Hasta 100 MB</span>
            <span>•</span>
            <span>Procesamiento local 100% privado</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STATE 2: Balanced Two-Column SaaS Document Workspace          */}
      {/* ------------------------------------------------------------- */}
      {file && pdfSummary && convertedImages.length === 0 && (
        <div className="space-y-4 animate-in fade-in">
          {/* Top Document Summary Bar */}
          <div className="p-3 sm:p-3.5 bg-white border border-slate-200/90 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-sm sm:max-w-md">
                  {pdfSummary.filename}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatBytes(pdfSummary.fileSize)} • {pdfSummary.totalPages}{' '}
                  {pdfSummary.totalPages === 1 ? 'página' : 'páginas'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isConverting}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Cambiar</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isConverting}
                className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>

          {/* Two-Column Grid: Left (Pages) vs Right (Settings) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT / MAIN WORKSPACE: Page Thumbnails & Selection (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-lg p-4 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                    Páginas del documento ({pdfSummary.totalPages})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Haz clic en una miniatura o casilla para incluir o excluir páginas
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => selectAllPages(true)}
                    className="hover:text-blue-600 font-medium"
                  >
                    Seleccionar todas
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => selectAllPages(false)}
                    className="hover:text-blue-600 font-medium"
                  >
                    Deseleccionar
                  </button>
                </div>
              </div>

              {/* Thumbnails Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[460px] overflow-y-auto p-1 bg-slate-50/50 rounded border border-slate-100">
                {pdfSummary.pages.map((p) => {
                  const isSelected = activePagesToConvert.includes(p.pageNumber);
                  const thumb = thumbnails[p.pageNumber];

                  return (
                    <div
                      key={p.pageNumber}
                      onClick={() => togglePageSelection(p.pageNumber)}
                      onMouseEnter={() => {
                        if (pdfDocInstance && !thumb) {
                          renderThumbnailForPage(pdfDocInstance, p.pageNumber);
                        }
                      }}
                      className={`relative rounded border p-1.5 bg-white cursor-pointer select-none transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 ring-1 ring-blue-600/30'
                          : 'border-slate-200 opacity-60 hover:opacity-85'
                      }`}
                    >
                      {/* Top Bar inside thumbnail */}
                      <div className="flex items-center justify-between mb-1 px-0.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[10px] font-semibold text-slate-700">
                          Pág. {p.pageNumber}
                        </span>
                      </div>

                      {/* Actual Canvas Preview or Placeholder */}
                      <div className="w-full h-32 bg-slate-100 rounded flex items-center justify-center overflow-hidden border border-slate-100">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={`Página ${p.pageNumber}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <FileText className="w-5 h-5 text-slate-300 mx-auto" />
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {p.widthPt} × {p.heightPt} pt
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom dimension tag */}
                      <div className="mt-1 text-[9px] text-slate-400 text-center font-mono">
                        {p.widthPt} × {p.heightPt} pt
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selection Summary */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  <strong>{activePagesToConvert.length}</strong> de {pdfSummary.totalPages} páginas
                  seleccionadas
                </span>
                <span className="text-[11px] text-slate-400">
                  Formato de salida: <strong>JPG / JPEG</strong>
                </span>
              </div>
            </div>

            {/* RIGHT WORKSPACE: Unified Settings Sidebar (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-lg p-4 space-y-4 shadow-2xs lg:sticky lg:top-20">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Configuración de conversión
                </h3>
              </div>

              {/* 1. Format */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Formato de imagen
                </label>
                <div className="px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 flex items-center justify-between">
                  <span>JPG (Joint Photographic Experts)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    Estándar
                  </span>
                </div>
              </div>

              {/* 2. Resolution / DPI */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Resolución (DPI)
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {settings.dpi} DPI
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {DPI_OPTIONS.map((opt) => (
                    <button
                      key={opt.dpi}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, dpi: opt.dpi }))}
                      className={`py-1.5 text-xs rounded border transition-colors text-center font-medium ${
                        settings.dpi === opt.dpi
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {opt.dpi}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  {settings.dpi === 150
                    ? '150 DPI: Recomendado (alta nitidez y peso equilibrado)'
                    : settings.dpi === 300
                    ? '300 DPI: Máxima resolución para impresión'
                    : settings.dpi <= 96
                    ? '72–96 DPI: Archivos ligeros para web y correo'
                    : '200 DPI: Calidad superior para pantallas Retina'}
                </p>
              </div>

              {/* 3. JPEG Quality */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Compresión JPEG
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {Math.round(settings.quality * 100)}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, quality: q.value }))}
                      className={`py-1.5 text-xs rounded border transition-colors text-center font-medium ${
                        settings.quality === q.value
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {Math.round(q.value * 100)}%
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  {settings.quality === 0.8
                    ? '80%: Calidad alta con compresión eficiente'
                    : settings.quality === 0.95
                    ? '95%: Máxima fidelidad fotográfica'
                    : 'Menor tamaño de archivo'}
                </p>
              </div>

              {/* 4. Page Selection Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Modo de selección
                </label>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'first', label: 'Solo 1ª pág.' },
                    { id: 'last', label: 'Solo última' },
                    { id: 'range', label: 'Rango' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, pageSelectionMode: m.id as any }))
                      }
                      className={`py-1 text-xs rounded border transition-colors text-center font-medium ${
                        settings.pageSelectionMode === m.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {settings.pageSelectionMode === 'range' && (
                  <div className="mt-1.5 p-2 bg-slate-50 rounded border border-slate-200 space-y-1 animate-in fade-in">
                    <input
                      type="text"
                      value={settings.pageRange}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, pageRange: e.target.value }))
                      }
                      placeholder={`Ej: 1-3, 5 (1-${pdfSummary.totalPages})`}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* 5. Collapsible Advanced Settings */}
              <div className="border-t border-slate-100 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 font-medium py-1"
                >
                  <span className="flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                    Opciones avanzadas
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                  />
                </button>

                {showAdvanced && (
                  <div className="mt-2 p-2.5 bg-slate-50/70 rounded border border-slate-200 space-y-2 text-xs animate-in fade-in">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Orientación
                      </label>
                      <select
                        value={settings.orientation}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, orientation: e.target.value as any }))
                        }
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="original">Original (conservar)</option>
                        <option value="portrait">Vertical forzado</option>
                        <option value="landscape">Horizontal forzado</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Fondo de transparencias
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))
                          }
                          className="w-6 h-6 rounded border border-slate-300 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-600 font-mono">
                          {settings.backgroundColor} (Blanco)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                        Prefijo de archivo
                      </label>
                      <input
                        type="text"
                        value={settings.filenamePrefix}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, filenamePrefix: e.target.value }))
                        }
                        placeholder="documento"
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Primary Action CTA */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={handleStartConversion}
                  disabled={isConverting || activePagesToConvert.length === 0}
                  className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-4 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition-colors shadow-2xs disabled:opacity-50"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        Pág. {progressPageNum} ({progressCurrent}/{progressTotal})...
                      </span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Convertir PDF a JPG</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  {activePagesToConvert.length}{' '}
                  {activePagesToConvert.length === 1 ? 'página' : 'páginas'} seleccionadas •{' '}
                  {settings.dpi} DPI
                </p>

                {/* Inline Progress Bar */}
                {isConverting && (
                  <div className="space-y-1 pt-1 animate-in fade-in">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300 ease-out"
                        style={{
                          width: `${
                            progressTotal > 0 ? (progressCurrent / progressTotal) * 100 : 5
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block text-right">
                      {progressTotal > 0
                        ? Math.round((progressCurrent / progressTotal) * 100)
                        : 0}
                      % completado
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STATE 3: Clean SaaS Conversion Results Workspace              */}
      {/* ------------------------------------------------------------- */}
      {convertedImages.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 space-y-4 shadow-2xs animate-in fade-in">
          {/* Top Results Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Conversión completada con éxito
                </h4>
                <p className="text-[11px] text-slate-500">
                  {convertedImages.length}{' '}
                  {convertedImages.length === 1 ? 'imagen generada' : 'imágenes generadas'} •{' '}
                  {formatBytes(totalConvertedSize)} total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition-colors shadow-2xs disabled:opacity-50"
              >
                {isZipping ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Empaquetando ({zipProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5" />
                    <span>Descargar todas en ZIP</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadSelectedZip}
                disabled={isZipping || convertedImages.filter((i) => i.selected).length === 0}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors disabled:opacity-40"
              >
                <FolderDown className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Seleccionadas ({convertedImages.filter((i) => i.selected).length})
                </span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Convertir otro PDF
              </button>
            </div>
          </div>

          {/* Sub-bar: Select/Deselect all + View mode */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => selectAllConvertedImages(true)}
                className="hover:text-blue-600 font-medium"
              >
                Seleccionar todas
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => selectAllConvertedImages(false)}
                className="hover:text-blue-600 font-medium"
              >
                Deseleccionar
              </button>
            </div>

            <div className="flex items-center border border-slate-200 rounded p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Vista cuadrícula"
                className={`p-1 rounded ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-400'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="Vista lista"
                className={`p-1 rounded ${
                  viewMode === 'list' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-400'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Converted JPGs Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
              {convertedImages.map((img, idx) => (
                <div
                  key={img.id}
                  className={`rounded-lg border p-2.5 bg-white transition-all shadow-2xs flex flex-col justify-between ${
                    img.selected
                      ? 'border-blue-600 ring-1 ring-blue-600/30'
                      : 'border-slate-200 opacity-80'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={img.selected}
                        onChange={() => toggleImageSelection(img.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Pág. {img.pageNumber}
                      </span>
                    </label>

                    <span className="text-[10px] font-mono text-slate-400">
                      {formatBytes(img.fileSize)}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div
                    onClick={() => openPreviewAtIndex(idx)}
                    className="relative w-full h-40 bg-slate-100 rounded overflow-hidden cursor-pointer group border border-slate-100 flex items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-150"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="px-2 py-0.5 rounded bg-white text-slate-900 text-[11px] font-medium shadow-sm flex items-center gap-1">
                        <Eye className="w-3 h-3 text-blue-600" />
                        Ampliar
                      </span>
                    </div>
                  </div>

                  {/* Footer Bar */}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                    <span className="font-mono truncate max-w-[100px]">
                      {img.width} × {img.height} px
                    </span>

                    <button
                      type="button"
                      onClick={() => triggerDownload(img.blob, img.filename)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 rounded transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Converted JPGs List View */
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden">
              {convertedImages.map((img, idx) => (
                <div
                  key={img.id}
                  className="p-2.5 bg-white hover:bg-slate-50/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={img.selected}
                      onChange={() => toggleImageSelection(img.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <div
                      onClick={() => openPreviewAtIndex(idx)}
                      className="w-9 h-9 rounded bg-slate-100 overflow-hidden cursor-pointer shrink-0 border border-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        Página {img.pageNumber} • {img.filename}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {img.width} × {img.height} px • {formatBytes(img.fileSize)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openPreviewAtIndex(idx)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      title="Vista previa"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerDownload(img.blob, img.filename)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 rounded transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full Preview Modal */}
      <PdfToJpgPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        images={convertedImages}
        currentIndex={previewIndex}
        onNavigate={setPreviewIndex}
      />
    </div>
  );
}

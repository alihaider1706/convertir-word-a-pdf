export type ConversionStatus = 'idle' | 'selected' | 'converting' | 'success' | 'error';

export type FileConversionState = 'waiting' | 'processing' | 'completed' | 'failed';

export interface PageSettings {
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

export interface FileDetails {
  file: File;
  name: string;
  size: number;
  format: 'DOCX' | 'DOC';
  lastModified: number;
}

export interface BatchFileItem {
  id: string;
  file: File;
  name: string;
  customName: string;
  size: number;
  format: 'DOCX' | 'DOC';
  status: FileConversionState;
  progress?: number;
  errorMessage?: string;
  result?: ConversionResult;
}

export interface ConversionResult {
  id: string;
  originalName: string;
  convertedName: string;
  originalSize: number;
  pdfSize: number;
  downloadUrl: string;
  previewUrl: string;
  conversionTimeMs: number;
  pageCount?: number;
  createdAt: string;
}

export type CompressMode = 'basic' | 'recommended' | 'extreme';

export interface CompressOptions {
  mode: CompressMode;
  quality?: number; // 40-95
  dpi?: 72 | 96 | 150 | 200 | 300;
  downsample?: boolean;
  grayscale?: boolean;
  removeMetadata?: boolean;
  removeThumbnails?: boolean;
  optimizeStreams?: boolean;
  targetSizeKb?: number;
  password?: string;
}

export interface CompressResult {
  success: boolean;
  fileId: string;
  originalName?: string;
  compressedName?: string;
  originalSize: number;
  compressedSize: number;
  reductionBytes: number;
  reductionPercent: number;
  downloadUrl: string;
  previewUrl?: string;
  originalPreviewUrl?: string;
  pageCount?: number;
  targetSizeAchieved?: boolean | null;
  targetSizeKb?: number | null;
  isEncrypted?: boolean;
  hasDigitalSignature?: boolean;
  mode?: string;
  message?: string;
  error?: string;
}

export interface CompressBatchItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  status: FileConversionState;
  progress?: number;
  errorMessage?: string;
  result?: CompressResult;
  isEncrypted?: boolean;
  hasDigitalSignature?: boolean;
  password?: string;
}

export interface ProtectResult {
  success: boolean;
  fileId: string;
  protectedId: string;
  downloadUrl: string;
}

export interface PageOperationRequest {
  fileId: string;
  pageOrder?: number[]; // 0-indexed page indices
  rotations?: Record<number, number>; // page index -> degrees to rotate (90, 180, 270)
  deletedPages?: number[]; // 0-indexed page indices to delete
}

export interface PageOperationResult {
  success: boolean;
  id: string;
  downloadUrl: string;
  previewUrl: string;
  pageCount: number;
  newSize: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

// PDF to Word specific types
export interface PdfToWordConversionResult {
  id: string;
  originalName: string;
  convertedName: string;
  originalSize: number;
  docxSize: number;
  downloadUrl: string;
  previewUrl: string;
  conversionTimeMs: number;
  pageCount: number;
  createdAt: string;
  usedOcr?: boolean;
  isEncrypted?: boolean;
}

export interface PdfBatchFileItem {
  id: string;
  file: File;
  name: string;
  customName: string;
  size: number;
  status: FileConversionState;
  progress?: number;
  errorMessage?: string;
  result?: PdfToWordConversionResult;
  pageCount?: number;
  password?: string;
  requiresPassword?: boolean;
  pageSettings?: {
    rotations?: Record<number, number>;
    deletedPages?: number[];
    pageOrder?: number[];
  };
}

// PDF to PowerPoint specific types
export type PdfToPptMode = 'editable' | 'fidelity';

export interface PdfToPptConversionResult {
  id: string;
  originalName: string;
  convertedName: string;
  originalSize: number;
  pptxSize: number;
  downloadUrl: string;
  conversionTimeMs: number;
  slideCount: number;
  createdAt: string;
  mode: PdfToPptMode;
  isEncrypted?: boolean;
}

export interface PdfToPptBatchFileItem {
  id: string;
  file: File;
  name: string;
  customName: string;
  size: number;
  status: FileConversionState;
  progress?: number;
  currentStage?: string;
  errorMessage?: string;
  result?: PdfToPptConversionResult;
  pageCount?: number;
  password?: string;
  requiresPassword?: boolean;
  mode?: PdfToPptMode;
  pageRange?: string;
  orientation?: 'auto' | 'landscape' | 'portrait';
  thumbnails?: Record<number, string>;
  selectedPages?: number[];
  isLoadingThumbnails?: boolean;
}


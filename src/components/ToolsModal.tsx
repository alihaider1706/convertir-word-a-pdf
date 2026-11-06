'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  FileText,
  FileCheck,
  Minimize2,
  Combine,
  Split,
  Shield,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Search,
  Check,
  Lock,
} from 'lucide-react';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWordToPdf?: () => void;
  activeTool?: 'word-to-pdf' | 'pdf-to-word' | 'jpg-to-pdf' | 'pdf-to-jpg' | 'comprimir-pdf';
}

type ToolCategory = 'all' | 'to-pdf' | 'from-pdf' | 'security';

export default function ToolsModal({
  isOpen,
  onClose,
  onSelectWordToPdf,
  activeTool = 'word-to-pdf',
}: ToolsModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isWordActive = activeTool === 'word-to-pdf';
  const isPdfActive = activeTool === 'pdf-to-word';
  const isJpgActive = activeTool === 'jpg-to-pdf';
  const isPdfToJpgActive = activeTool === 'pdf-to-jpg';
  const isCompressPdfActive = activeTool === 'comprimir-pdf';

  const allTools = [
    {
      id: 'word-to-pdf',
      name: 'Word a PDF',
      description: 'Convierte archivos DOC y DOCX a PDF preservando tipografía y tablas.',
      icon: FileText,
      category: 'to-pdf',
      isCurrent: isWordActive,
      badge: isWordActive ? 'En uso' : 'Disponible',
      onClick: () => {
        onClose();
        if (isWordActive && onSelectWordToPdf) {
          onSelectWordToPdf();
        } else {
          router.push('/');
        }
      },
    },
    {
      id: 'pdf-to-word',
      name: 'PDF a Word',
      description: 'Transforma documentos PDF a archivos Word DOCX editables con OCR.',
      icon: FileCheck,
      category: 'from-pdf',
      isCurrent: isPdfActive,
      badge: isPdfActive ? 'En uso' : 'Disponible',
      onClick: () => {
        onClose();
        if (!isPdfActive) {
          router.push('/pdf-a-word');
        }
      },
    },
    {
      id: 'jpg-to-pdf',
      name: 'JPG a PDF',
      description: 'Une múltiples imágenes JPG, PNG y WebP en un PDF ordenado con recorte.',
      icon: ImageIcon,
      category: 'to-pdf',
      isCurrent: isJpgActive,
      badge: isJpgActive ? 'En uso' : 'Disponible',
      onClick: () => {
        onClose();
        if (!isJpgActive) {
          router.push('/convertir-jpg-a-pdf/');
        }
      },
    },
    {
      id: 'pdf-to-jpg',
      name: 'PDF a JPG',
      description: 'Convierte páginas completas de PDF en imágenes JPG de 72 a 300 DPI.',
      icon: ImageIcon,
      category: 'from-pdf',
      isCurrent: isPdfToJpgActive,
      badge: isPdfToJpgActive ? 'En uso' : 'Disponible',
      onClick: () => {
        onClose();
        if (!isPdfToJpgActive) {
          router.push('/convertir-pdf-a-jpg/');
        }
      },
    },
    {
      id: 'compress-pdf',
      name: 'Comprimir PDF',
      description: 'Reduce el tamaño de archivos PDF a 1MB, 2MB o al máximo sin perder calidad.',
      icon: Minimize2,
      category: 'security',
      isCurrent: isCompressPdfActive,
      badge: isCompressPdfActive ? 'En uso' : 'Disponible',
      onClick: () => {
        onClose();
        if (!isCompressPdfActive) {
          router.push('/comprimir-pdf/');
        }
      },
    },
    {
      id: 'protect-pdf',
      name: 'Proteger PDF',
      description: 'Aplica contraseñas seguras con cifrado AES-256 a cualquier PDF.',
      icon: Lock,
      category: 'security',
      isCurrent: false,
      badge: 'Disponible',
    },
    {
      id: 'merge-pdf',
      name: 'Unir PDF',
      description: 'Combina múltiples documentos PDF en un solo archivo organizado.',
      icon: Combine,
      category: 'security',
      isCurrent: false,
      badge: 'Disponible',
    },
    {
      id: 'split-pdf',
      name: 'Dividir PDF',
      description: 'Separa páginas específicas o extrae rangos de un documento.',
      icon: Split,
      category: 'security',
      isCurrent: false,
      badge: 'Disponible',
    },
    {
      id: 'excel-to-pdf',
      name: 'Excel a PDF',
      description: 'Convierte hojas de cálculo XLSX a tablas PDF perfectamente ajustadas.',
      icon: FileSpreadsheet,
      category: 'to-pdf',
      isCurrent: false,
      badge: 'Disponible',
    },
    {
      id: 'powerpoint-to-pdf',
      name: 'PowerPoint a PDF',
      description: 'Convierte diapositivas PPTX a documentos PDF de alta fidelidad.',
      icon: Presentation,
      category: 'to-pdf',
      isCurrent: false,
      badge: 'Disponible',
    },
  ];

  const filteredTools = allTools.filter((tool) => {
    const matchesCategory =
      activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tools-modal-title"
      >
        {/* Top Search Bar & Close */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar herramienta (ej. Word, JPG, comprimir, proteger)..."
              autoFocus
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors shrink-0"
            aria-label="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'Todas las herramientas' },
            { id: 'to-pdf', label: 'Convertir a PDF' },
            { id: 'from-pdf', label: 'Convertir desde PDF' },
            { id: 'security', label: 'Utilidades y Seguridad' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === tab.id
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tool Cards Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const isClickable = Boolean(tool.onClick);

            return (
              <div
                key={tool.id}
                onClick={tool.onClick}
                className={`p-3 rounded-lg border text-left transition-all flex items-start gap-3 ${
                  tool.isCurrent
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20'
                    : isClickable
                    ? 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 cursor-pointer shadow-2xs'
                    : 'border-slate-100 bg-slate-50/40 opacity-70'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                    tool.isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {tool.name}
                    </h4>
                    {tool.isCurrent ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                        En uso
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                    {tool.description}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredTools.length === 0 && (
            <div className="col-span-2 py-8 text-center text-xs text-slate-400">
              No se encontraron herramientas con los términos ingresados.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Procesamiento seguro y privado</span>
          <span className="font-mono text-[11px] text-slate-400">Esc para cerrar</span>
        </div>
      </div>
    </div>
  );
}

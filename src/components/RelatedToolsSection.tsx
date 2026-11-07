'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Minimize2,
} from 'lucide-react';

interface RelatedToolsSectionProps {
  onOpenTools: () => void;
  currentTool?: 'word-to-pdf' | 'pdf-to-word' | 'jpg-to-pdf' | 'pdf-to-jpg' | 'comprimir-pdf' | 'pdf-to-ppt';
}

export default function RelatedToolsSection({
  onOpenTools,
  currentTool = 'word-to-pdf',
}: RelatedToolsSectionProps) {
  const isWordActive = currentTool === 'word-to-pdf';
  const isPdfActive = currentTool === 'pdf-to-word';
  const isJpgActive = currentTool === 'jpg-to-pdf';
  const isPdfToJpgActive = currentTool === 'pdf-to-jpg';
  const isCompressPdfActive = currentTool === 'comprimir-pdf';
  const isPdfToPptActive = currentTool === 'pdf-to-ppt';

  const tools = [
    {
      name: isPdfToPptActive ? 'PDF a Word' : 'PDF a PPT',
      icon: Presentation,
      ext: isPdfToPptActive ? 'PDF → DOCX' : 'PDF → PPTX',
      href: isPdfToPptActive ? '/pdf-a-word' : '/convertir-pdf-a-ppt/',
    },
    {
      name: isWordActive ? 'PDF a Word' : 'Word a PDF',
      icon: FileText,
      ext: isWordActive ? 'PDF → DOCX' : 'DOCX → PDF',
      href: isWordActive ? '/pdf-a-word' : '/',
    },
    {
      name: isCompressPdfActive ? 'PDF a Word' : 'Comprimir PDF',
      icon: Minimize2,
      ext: isCompressPdfActive ? 'PDF → DOCX' : 'PDF → Optimizado',
      href: isCompressPdfActive ? '/pdf-a-word' : '/comprimir-pdf/',
    },
    {
      name: isJpgActive ? 'PDF a Word' : 'JPG a PDF',
      icon: isJpgActive ? FileText : ImageIcon,
      ext: isJpgActive ? 'PDF → DOCX' : 'JPG → PDF',
      href: isJpgActive ? '/pdf-a-word' : '/convertir-jpg-a-pdf/',
    },
    {
      name: isPdfToJpgActive ? 'JPG a PDF' : 'PDF a JPG',
      icon: ImageIcon,
      ext: isPdfToJpgActive ? 'JPG → PDF' : 'PDF → JPG',
      href: isPdfToJpgActive ? '/convertir-jpg-a-pdf/' : '/convertir-pdf-a-jpg/',
    },
    {
      name: 'Excel a PDF',
      icon: FileSpreadsheet,
      ext: 'XLSX → PDF',
    },
    {
      name: 'PowerPoint a PDF',
      icon: Presentation,
      ext: 'PPTX → PDF',
    },
    {
      name: 'PNG a PDF',
      icon: ImageIcon,
      ext: 'PNG → PDF',
      href: '/convertir-jpg-a-pdf/',
    },
    {
      name: 'PDF a Excel',
      icon: FileSpreadsheet,
      ext: 'PDF → XLSX',
    },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/80">
      <div className="mb-6 text-left">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
          Otras herramientas documentales
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Utilidades de conversión, compresión y exportación disponibles en la plataforma.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          if (tool.href) {
            return (
              <Link
                key={idx}
                href={tool.href}
                className="p-3.5 rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60 transition-colors group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-7 h-7 rounded bg-slate-50 border border-slate-200/60 text-slate-600 flex items-center justify-center group-hover:text-blue-600 transition-colors">
                    <Icon className="w-3.5 h-3.5 stroke-[1.75]" />
                  </div>
                  <span className="text-[10px] text-blue-600 font-mono font-medium">
                    {tool.ext}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h3>
              </Link>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={onOpenTools}
              className="text-left p-3.5 rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="w-7 h-7 rounded bg-slate-50 border border-slate-200/60 text-slate-600 flex items-center justify-center group-hover:text-slate-900 transition-colors">
                  <Icon className="w-3.5 h-3.5 stroke-[1.75]" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {tool.ext}
                </span>
              </div>
              <h3 className="text-xs font-semibold text-slate-900 group-hover:text-slate-900 transition-colors">
                {tool.name}
              </h3>
            </button>
          );
        })}
      </div>
    </section>
  );
}

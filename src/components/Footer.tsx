'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenTools: () => void;
  onOpenContact: () => void;
  onScrollToConverter: () => void;
  onScrollToFaq: () => void;
}

export default function Footer({
  onOpenTools,
  onOpenContact,
  onScrollToConverter,
  onScrollToFaq,
}: FooterProps) {
  return (
    <footer className="bg-white border-t border-slate-200/90 mt-auto pt-10 pb-8 text-slate-600">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 pb-8 border-b border-slate-100 text-xs">
          {/* Col 1 & 2: Brand & Security Pledge */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                DS
              </div>
              <span className="font-bold text-slate-900 text-sm tracking-tight">
                Plataforma Documental
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-sm">
              Suite profesional en línea para la conversión, compresión y protección de documentos PDF, Word e imágenes, preservando la fidelidad tipográfica y garantizando privacidad absoluta.
            </p>
            <div className="space-y-1 pt-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Procesamiento local y cifrado SSL de extremo a extremo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Sin retención de documentos ni almacenamiento permanente</span>
              </div>
            </div>
          </div>

          {/* Col 3: Convertir a PDF */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              Convertir a PDF
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors block">
                  Word a PDF (.docx)
                </Link>
              </li>
              <li>
                <Link
                  href="/convertir-jpg-a-pdf/"
                  className="hover:text-blue-600 transition-colors block"
                >
                  JPG a PDF (.jpg, .png)
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTools}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Excel a PDF
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTools}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  PowerPoint a PDF
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Convertir desde PDF */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              Convertir desde PDF
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/pdf-a-word" className="hover:text-blue-600 transition-colors block">
                  PDF a Word (.docx)
                </Link>
              </li>
              <li>
                <Link
                  href="/convertir-pdf-a-jpg/"
                  className="hover:text-blue-600 transition-colors block"
                >
                  PDF a JPG (72–300 DPI)
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTools}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  PDF a Excel
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTools}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Extraer texto (OCR)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Utilidades y Soporte */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              Utilidades & Soporte
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href="/comprimir-pdf/"
                  className="hover:text-blue-600 transition-colors block"
                >
                  Comprimir PDF
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTools}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Proteger con contraseña
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTools}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Organizar páginas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="hover:text-blue-600 transition-colors text-left font-medium text-slate-800"
                >
                  Contacto & Soporte
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 Plataforma Documental. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onScrollToFaq}
              className="hover:text-slate-700 transition-colors"
            >
              Preguntas Frecuentes
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenContact}
              className="hover:text-slate-700 transition-colors"
            >
              Privacidad y Seguridad
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

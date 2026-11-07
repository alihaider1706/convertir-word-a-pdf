'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ExternalLink } from 'lucide-react';
import { PhoneIcon } from '@/components/legal/LegalIcons';

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 pb-8 border-b border-slate-100 text-xs">
          {/* Col 1: Brand & Contact Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-2xs">
                <img
                  src="/icon.svg"
                  alt="Convertir Word a PDF"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-slate-900 text-sm tracking-tight">
                Convertir Word a PDF
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Suite profesional para la conversión, compresión y optimización de documentos con máxima privacidad.
            </p>

            {/* Direct Contact Details */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
              <a
                href="mailto:easygrade6@gmail.com"
                className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors font-medium break-all"
              >
                <Mail className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                <span>easygrade6@gmail.com</span>
              </a>
              <a
                href="tel:+923187338727"
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 transition-colors font-medium"
              >
                <PhoneIcon className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>+92 318 7338727</span>
              </a>
            </div>
          </div>

          {/* Col 2: Convertir a PDF */}
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

          {/* Col 3: Convertir desde PDF */}
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
                <Link
                  href="/convertir-pdf-a-ppt/"
                  className="hover:text-blue-600 transition-colors block"
                >
                  PDF a PowerPoint (.pptx)
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
            </ul>
          </div>

          {/* Col 4: Utilidades */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              Utilidades
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
                <Link
                  href="/contacto"
                  className="hover:text-blue-600 transition-colors block font-medium text-slate-800"
                >
                  Página de Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Confianza */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              Marco Legal & Privacidad
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href="/politica-de-privacidad"
                  className="hover:text-blue-600 transition-colors block"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos-y-condiciones"
                  className="hover:text-blue-600 transition-colors block"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/aviso-legal"
                  className="hover:text-blue-600 transition-colors block"
                >
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-cookies"
                  className="hover:text-blue-600 transition-colors block"
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="hover:text-blue-600 transition-colors block"
                >
                  Atención al Cliente
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 Convertir Word a PDF. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <Link href="/politica-de-privacidad" className="hover:text-slate-700 transition-colors">
              Privacidad
            </Link>
            <span>•</span>
            <Link href="/terminos-y-condiciones" className="hover:text-slate-700 transition-colors">
              Términos
            </Link>
            <span>•</span>
            <Link href="/aviso-legal" className="hover:text-slate-700 transition-colors">
              Aviso Legal
            </Link>
            <span>•</span>
            <Link href="/politica-de-cookies" className="hover:text-slate-700 transition-colors">
              Cookies
            </Link>
            <span>•</span>
            <Link href="/contacto" className="hover:text-slate-700 transition-colors">
              Contacto (+92 318 7338727)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

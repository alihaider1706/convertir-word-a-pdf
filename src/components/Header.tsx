'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronDown,
  LayoutGrid,
  FileText,
  FileCheck,
  Image as ImageIcon,
  Minimize2,
  Lock,
  ArrowRight,
  Presentation,
} from 'lucide-react';

interface HeaderProps {
  onOpenTools: () => void;
  onOpenContact: () => void;
  onScrollToConverter: () => void;
  activeTool?: 'word-to-pdf' | 'pdf-to-word' | 'jpg-to-pdf' | 'pdf-to-jpg' | 'comprimir-pdf' | 'pdf-to-ppt';
}

export default function Header({
  onOpenTools,
  onOpenContact,
  onScrollToConverter,
  activeTool = 'word-to-pdf',
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isWordActive = activeTool === 'word-to-pdf';
  const isPdfActive = activeTool === 'pdf-to-word';
  const isJpgActive = activeTool === 'jpg-to-pdf';
  const isPdfToJpgActive = activeTool === 'pdf-to-jpg';
  const isCompressPdfActive = activeTool === 'comprimir-pdf';
  const isPdfToPptActive = activeTool === 'pdf-to-ppt';

  // Fixed Brand Identity across all pages (Never changes per tool)
  const brandTitle = 'Convertir Word a PDF';
  const brandHref = '/';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand Identity (Unified Homepage Brand) */}
          <div className="flex items-center gap-3">
            <Link
              href={brandHref}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
              title="Convertir Word a PDF - Inicio"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <img
                  src="/icon.svg"
                  alt="Logo Convertir Word a PDF"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-slate-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors">
                {brandTitle}
              </span>
            </Link>
          </div>

          {/* Center: Utility Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Tools Dropdown Trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  toolsDropdownOpen
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                aria-expanded={toolsDropdownOpen}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                <span>Herramientas</span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                    toolsDropdownOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {/* Inline Interactive Dropdown Menu */}
              {toolsDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 rounded-lg bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Convertir a PDF
                  </div>
                  <Link
                    href="/"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Word a PDF</span>
                  </Link>
                  <Link
                    href="/convertir-jpg-a-pdf/"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>JPG a PDF</span>
                  </Link>

                  <div className="my-1.5 border-t border-slate-100" />
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Convertir desde PDF
                  </div>
                  <Link
                    href="/pdf-a-word"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>PDF a Word</span>
                  </Link>
                  <Link
                    href="/convertir-pdf-a-jpg/"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    <span>PDF a JPG</span>
                  </Link>
                  <Link
                    href="/convertir-pdf-a-ppt/"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <Presentation className="w-4 h-4 text-amber-600" />
                    <span>PDF a PowerPoint</span>
                  </Link>

                  <div className="my-1.5 border-t border-slate-100" />
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Optimizar y Proteger
                  </div>
                  <Link
                    href="/comprimir-pdf/"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <Minimize2 className="w-4 h-4 text-emerald-600" />
                    <span>Comprimir PDF</span>
                  </Link>

                  <div className="my-1.5 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setToolsDropdownOpen(false);
                      onOpenTools();
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    <span>Ver catálogo completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Word to PDF Link */}
            {isWordActive ? (
              <button
                onClick={onScrollToConverter}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50/70 border border-blue-200/50 rounded-md transition-colors"
              >
                Word a PDF
              </button>
            ) : (
              <Link
                href="/"
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                Word a PDF
              </Link>
            )}

            {/* PDF to Word Link */}
            {isPdfActive ? (
              <button
                onClick={onScrollToConverter}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50/70 border border-blue-200/50 rounded-md transition-colors"
              >
                PDF a Word
              </button>
            ) : (
              <Link
                href="/pdf-a-word"
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                PDF a Word
              </Link>
            )}

            {/* JPG to PDF Link */}
            {isJpgActive ? (
              <button
                onClick={onScrollToConverter}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50/70 border border-blue-200/50 rounded-md transition-colors"
              >
                JPG a PDF
              </button>
            ) : (
              <Link
                href="/convertir-jpg-a-pdf/"
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                JPG a PDF
              </Link>
            )}

            {/* PDF to JPG Link */}
            {isPdfToJpgActive ? (
              <button
                onClick={onScrollToConverter}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50/70 border border-blue-200/50 rounded-md transition-colors"
              >
                PDF a JPG
              </button>
            ) : (
              <Link
                href="/convertir-pdf-a-jpg/"
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                PDF a JPG
              </Link>
            )}

            {/* PDF to PPT Link */}
            {isPdfToPptActive ? (
              <button
                onClick={onScrollToConverter}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50/70 border border-blue-200/50 rounded-md transition-colors"
              >
                PDF a PPT
              </button>
            ) : (
              <Link
                href="/convertir-pdf-a-ppt/"
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                PDF a PPT
              </Link>
            )}

            {/* Comprimir PDF Link */}
            {isCompressPdfActive ? (
              <button
                onClick={onScrollToConverter}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50/70 border border-blue-200/50 rounded-md transition-colors"
              >
                Comprimir PDF
              </button>
            ) : (
              <Link
                href="/comprimir-pdf/"
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                Comprimir PDF
              </Link>
            )}
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenContact}
              className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Contacto
            </button>
            <button
              onClick={onScrollToConverter}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition-colors shadow-2xs"
            >
              Subir archivo
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white px-4 py-3 space-y-1 shadow-md animate-in fade-in">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block w-full text-left px-3 py-1.5 text-xs font-medium rounded-md ${
              isWordActive ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Convertir Word a PDF
          </Link>
          <Link
            href="/pdf-a-word"
            onClick={() => setMobileMenuOpen(false)}
            className={`block w-full text-left px-3 py-1.5 text-xs font-medium rounded-md ${
              isPdfActive ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Convertir PDF a Word
          </Link>
          <Link
            href="/convertir-jpg-a-pdf/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block w-full text-left px-3 py-1.5 text-xs font-medium rounded-md ${
              isJpgActive ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Convertir JPG a PDF
          </Link>
          <Link
            href="/convertir-pdf-a-jpg/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block w-full text-left px-3 py-1.5 text-xs font-medium rounded-md ${
              isPdfToJpgActive ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Convertir PDF a JPG
          </Link>
          <Link
            href="/convertir-pdf-a-ppt/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block w-full text-left px-3 py-1.5 text-xs font-medium rounded-md ${
              isPdfToPptActive ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Convertir PDF a PPT
          </Link>
          <Link
            href="/comprimir-pdf/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block w-full text-left px-3 py-1.5 text-xs font-medium rounded-md ${
              isCompressPdfActive ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Comprimir PDF
          </Link>
          <button
            onClick={() => {
              onOpenTools();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-md flex items-center justify-between"
          >
            <span>Todas las herramientas</span>
            <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => {
              onOpenContact();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Contacto y Soporte
          </button>
        </div>
      )}
    </header>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
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
  Sparkles,
  LogOut,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  onOpenTools?: () => void;
  onOpenContact?: () => void;
  onScrollToConverter?: () => void;
  activeTool?: 'word-to-pdf' | 'pdf-to-word' | 'jpg-to-pdf' | 'pdf-to-jpg' | 'comprimir-pdf' | 'pdf-to-ppt';
}

export default function Header({
  onOpenTools = () => {},
  onOpenContact = () => {},
  onScrollToConverter = () => {
    if (typeof window !== 'undefined') window.location.href = '/#converter-tool';
  },
  activeTool = 'word-to-pdf',
}: HeaderProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPro =
    (session?.user as any)?.planType === 'PRO_MONTHLY' ||
    (session?.user as any)?.planType === 'PRO_YEARLY';

  const isWordActive = activeTool === 'word-to-pdf';
  const isPdfActive = activeTool === 'pdf-to-word';
  const isJpgActive = activeTool === 'jpg-to-pdf';
  const isPdfToJpgActive = activeTool === 'pdf-to-jpg';
  const isCompressPdfActive = activeTool === 'comprimir-pdf';
  const isPdfToPptActive = activeTool === 'pdf-to-ppt';

  // Fixed Brand Identity
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
          {/* Left: Brand Identity */}
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
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>JPG a PDF</span>
                  </Link>

                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-1">
                    Convertir desde PDF
                  </div>
                  <Link
                    href="/pdf-a-word"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    <span>PDF a Word</span>
                  </Link>
                  <Link
                    href="/convertir-pdf-a-jpg/"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>PDF a JPG</span>
                  </Link>
                  <Link
                    href="/convertir-pdf-a-ppt/"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <Presentation className="w-4 h-4 text-orange-600" />
                    <span>PDF a PPT</span>
                  </Link>

                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-1">
                    Optimizar
                  </div>
                  <Link
                    href="/comprimir-pdf/"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <Minimize2 className="w-4 h-4 text-rose-600" />
                    <span>Comprimir PDF</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/"
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                isWordActive
                  ? 'font-semibold text-blue-600 bg-blue-50/70 border border-blue-200/50'
                  : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Word a PDF
            </Link>

            <Link
              href="/comprimir-pdf/"
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                isCompressPdfActive
                  ? 'font-semibold text-blue-600 bg-blue-50/70 border border-blue-200/50'
                  : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Comprimir PDF
            </Link>

            <Link
              href="/precios"
              className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Precios</span>
            </Link>
          </nav>

          {/* Right: SaaS Actions */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Mi Panel</span>
                  {isPro ? (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[9px] font-black uppercase">
                      PRO
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[9px] font-bold">
                      FREE
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  title="Cerrar sesión"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/auth/login"
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/precios"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition-colors shadow-2xs inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-blue-200" />
                  <span>Obtener Pro</span>
                </Link>
              </div>
            )}
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
            href="/precios"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-md"
          >
            ⚡ Planes & Precios (Pro)
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

          {session ? (
            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-md"
              >
                Mi Panel de Usuario
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md"
              >
                Crear Cuenta Gratuita
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolsModal from '@/components/ToolsModal';
import ContactModal from '@/components/ContactModal';
import { Shield, Mail, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import { PhoneIcon } from '@/components/legal/LegalIcons';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  toc?: { id: string; label: string }[];
  children: React.ReactNode;
}

export default function LegalLayout({
  title,
  subtitle,
  lastUpdated = 'Noviembre 2026',
  toc,
  children,
}: LegalLayoutProps) {
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <Header
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
      />

      <main className="flex-1 pb-16">
        {/* Top Hero Banner */}
        <section className="bg-white border-b border-slate-200/80 pt-10 pb-8 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-4 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Volver a la herramienta principal</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 inline-flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Marco Legal & Confianza</span>
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Última actualización: {lastUpdated}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </div>
        </section>

        {/* Content Body */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Table of Contents / Quick contact sidebar (if present) */}
            {toc && toc.length > 0 && (
              <aside className="lg:col-span-4 lg:sticky lg:top-20 space-y-5 order-2 lg:order-1">
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 pb-2 border-b border-slate-100">
                    En esta página
                  </h3>
                  <nav className="space-y-1.5">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block text-xs text-slate-600 hover:text-blue-600 hover:translate-x-0.5 transition-all py-0.5"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Direct Contact Card */}
                <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-xl border border-blue-100 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>¿Dudas o Consultas?</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Estamos disponibles para atender cualquier consulta técnica, legal o de privacidad.
                  </p>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <a
                      href="mailto:easygrade6@gmail.com"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium break-all"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                      <span>easygrade6@gmail.com</span>
                    </a>
                    <a
                      href="tel:+923187338727"
                      className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium"
                    >
                      <PhoneIcon className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span>+92 318 7338727</span>
                    </a>
                  </div>
                </div>
              </aside>
            )}

            {/* Main Reading Column */}
            <article
              className={`space-y-6 text-slate-700 text-sm leading-relaxed ${
                toc && toc.length > 0 ? 'lg:col-span-8 order-1 lg:order-2' : 'lg:col-span-12'
              }`}
            >
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                {children}
              </div>
            </article>
          </div>
        </div>
      </main>

      <Footer
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToConverter={() => {}}
        onScrollToFaq={() => {}}
      />

      <ToolsModal
        isOpen={toolsModalOpen}
        onClose={() => setToolsModalOpen(false)}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </div>
  );
}

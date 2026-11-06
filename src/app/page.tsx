'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import ConverterCard from '@/components/ConverterCard';
import HowItWorks from '@/components/HowItWorks';
import FeaturesSection from '@/components/FeaturesSection';
import RelatedToolsSection from '@/components/RelatedToolsSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import ToolsModal from '@/components/ToolsModal';
import ContactModal from '@/components/ContactModal';
import PreviewModal from '@/components/PreviewModal';
import PageManagerModal from '@/components/PageManagerModal';
import CompressPdfModal from '@/components/CompressPdfModal';
import ProtectPdfModal from '@/components/ProtectPdfModal';
import { ConversionResult } from '@/lib/types';

export default function HomePage() {
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Advanced feature modals
  const [previewResult, setPreviewResult] = useState<ConversionResult | null>(null);
  const [pageManageResult, setPageManageResult] = useState<ConversionResult | null>(null);
  const [compressResult, setCompressResult] = useState<ConversionResult | null>(null);
  const [protectResult, setProtectResult] = useState<ConversionResult | null>(null);

  const scrollToConverter = () => {
    const el = document.getElementById('converter-tool');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToFaq = () => {
    const el = document.getElementById('faq-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Compact, professional header */}
      <Header
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToConverter={scrollToConverter}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Main Converter Section with Multi-file, Batch, Page Settings, Filename Editing */}
        <ConverterCard
          onPreview={(res) => setPreviewResult(res)}
          onManagePages={(res) => setPageManageResult(res)}
          onCompress={(res) => setCompressResult(res)}
          onProtect={(res) => setProtectResult(res)}
        />

        {/* 3-Step How It Works Section */}
        <HowItWorks />

        {/* Balanced 2-Column Features Section */}
        <FeaturesSection />

        {/* Related Document Tools Grid */}
        <RelatedToolsSection onOpenTools={() => setToolsModalOpen(true)} />

        {/* Minimal Accordion FAQ Section */}
        <FAQSection />
      </main>

      {/* Compact, Professional Multi-Column Footer */}
      <Footer
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToConverter={scrollToConverter}
        onScrollToFaq={scrollToFaq}
      />

      {/* Navigation Modals */}
      <ToolsModal
        isOpen={toolsModalOpen}
        onClose={() => setToolsModalOpen(false)}
        onSelectWordToPdf={scrollToConverter}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      {/* Advanced Feature Modals */}
      <PreviewModal
        isOpen={!!previewResult}
        result={previewResult}
        onClose={() => setPreviewResult(null)}
      />

      <PageManagerModal
        isOpen={!!pageManageResult}
        result={pageManageResult}
        onClose={() => setPageManageResult(null)}
      />

      <CompressPdfModal
        isOpen={!!compressResult}
        result={compressResult}
        onClose={() => setCompressResult(null)}
      />

      <ProtectPdfModal
        isOpen={!!protectResult}
        result={protectResult}
        onClose={() => setProtectResult(null)}
      />
    </div>
  );
}

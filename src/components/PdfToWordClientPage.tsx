'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolsModal from '@/components/ToolsModal';
import ContactModal from '@/components/ContactModal';
import RelatedToolsSection from '@/components/RelatedToolsSection';
import PdfToWordHero from '@/components/PdfToWordHero';
import PdfToWordConverterCard from '@/components/PdfToWordConverterCard';
import PdfToWordHowItWorks from '@/components/PdfToWordHowItWorks';
import PdfToWordFeaturesSection from '@/components/PdfToWordFeaturesSection';
import PdfToWordFaqSection from '@/components/PdfToWordFaqSection';

export default function PdfToWordClientPage() {
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const scrollToConverter = () => {
    const el = document.getElementById('pdf-to-word-tool');
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
      {/* Header with activeTool="pdf-to-word" */}
      <Header
        activeTool="pdf-to-word"
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToConverter={scrollToConverter}
      />

      <main className="flex-1">
        {/* SEO Hero */}
        <PdfToWordHero />

        {/* Main PDF to Word Converter Card (with Batch, Custom Filename, Preview, Page Organizer, Password Decryption, OCR) */}
        <PdfToWordConverterCard />

        {/* 3-Step How It Works Guide */}
        <PdfToWordHowItWorks />

        {/* 6-Grid Feature Highlights */}
        <PdfToWordFeaturesSection />

        {/* Related Tools Grid */}
        <RelatedToolsSection
          currentTool="pdf-to-word"
          onOpenTools={() => setToolsModalOpen(true)}
        />

        {/* SEO Accordion FAQ with Schema */}
        <PdfToWordFaqSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToConverter={scrollToConverter}
        onScrollToFaq={scrollToFaq}
      />

      {/* Navigation Modals */}
      <ToolsModal
        isOpen={toolsModalOpen}
        activeTool="pdf-to-word"
        onClose={() => setToolsModalOpen(false)}
        onSelectWordToPdf={() => {}}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </div>
  );
}

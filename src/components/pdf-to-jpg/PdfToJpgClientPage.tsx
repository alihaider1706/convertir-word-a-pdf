'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolsModal from '@/components/ToolsModal';
import ContactModal from '@/components/ContactModal';
import RelatedToolsSection from '@/components/RelatedToolsSection';
import PdfToJpgHero from './PdfToJpgHero';
import PdfToJpgConverter from './PdfToJpgConverter';
import PdfToJpgHowItWorks from './PdfToJpgHowItWorks';
import PdfToJpgFeatures from './PdfToJpgFeatures';
import PdfToJpgFaq from './PdfToJpgFaq';

export default function PdfToJpgClientPage() {
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const scrollToConverter = () => {
    const el = document.getElementById('conversor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {/* Header with activeTool="pdf-to-jpg" */}
      <Header
        activeTool="pdf-to-jpg"
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToConverter={scrollToConverter}
      />

      <main className="flex-1">
        {/* SEO Hero Section (H1) */}
        <PdfToJpgHero />

        {/* Main PDF to JPG Workspace */}
        <PdfToJpgConverter />

        {/* How It Works (H2: Cómo convertir PDF a JPG online) */}
        <PdfToJpgHowItWorks />

        {/* Features Matrix with required H2 headings */}
        <PdfToJpgFeatures />

        {/* Related Document Tools Grid */}
        <RelatedToolsSection
          currentTool="pdf-to-jpg"
          onOpenTools={() => setToolsModalOpen(true)}
        />

        {/* 12-Question FAQ Accordion with Schema */}
        <PdfToJpgFaq />
      </main>

      {/* Footer */}
      <Footer
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToConverter={scrollToConverter}
        onScrollToFaq={scrollToFaq}
      />

      {/* Tools Modal */}
      <ToolsModal
        isOpen={toolsModalOpen}
        activeTool="pdf-to-jpg"
        onClose={() => setToolsModalOpen(false)}
        onSelectWordToPdf={() => {}}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </div>
  );
}

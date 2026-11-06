'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolsModal from '@/components/ToolsModal';
import ContactModal from '@/components/ContactModal';
import RelatedToolsSection from '@/components/RelatedToolsSection';
import JpgToPdfHero from './JpgToPdfHero';
import JpgToPdfConverter from './JpgToPdfConverter';
import JpgToPdfHowItWorks from './JpgToPdfHowItWorks';
import JpgToPdfFeatures from './JpgToPdfFeatures';
import JpgToPdfFaq from './JpgToPdfFaq';

export default function JpgToPdfClientPage() {
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const scrollToConverter = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFaq = () => {
    const el = document.getElementById('faq');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Header with activeTool="jpg-to-pdf" */}
      <Header
        activeTool="jpg-to-pdf"
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToConverter={scrollToConverter}
      />

      <main className="flex-1">
        {/* SEO Hero Section */}
        <JpgToPdfHero />

        {/* Main JPG to PDF Converter Card */}
        <JpgToPdfConverter />

        {/* 3-Step How It Works Guide */}
        <JpgToPdfHowItWorks />

        {/* Comprehensive Features Matrix with required H2 headings */}
        <JpgToPdfFeatures />

        {/* Related Document Tools Grid */}
        <RelatedToolsSection
          currentTool="jpg-to-pdf"
          onOpenTools={() => setToolsModalOpen(true)}
        />

        {/* 10-Question FAQ Accordion with Schema */}
        <JpgToPdfFaq />
      </main>

      {/* Footer */}
      <Footer
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToConverter={scrollToConverter}
        onScrollToFaq={scrollToFaq}
      />

      {/* Modals */}
      <ToolsModal
        isOpen={toolsModalOpen}
        activeTool="jpg-to-pdf"
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

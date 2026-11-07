'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolsModal from '@/components/ToolsModal';
import ContactModal from '@/components/ContactModal';
import RelatedToolsSection from '@/components/RelatedToolsSection';
import SecurityBanner from '@/components/SecurityBanner';
import PdfToPptHero from './PdfToPptHero';
import PdfToPptConverter from './PdfToPptConverter';
import PdfToPptHowItWorks from './PdfToPptHowItWorks';
import PdfToPptContentSection from './PdfToPptContentSection';
import PdfToPptFeatures from './PdfToPptFeatures';
import PdfToPptFaq from './PdfToPptFaq';

export default function PdfToPptClientPage() {
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const scrollToConverter = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFaq = () => {
    const el = document.getElementById('faq-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Header */}
      <Header
        activeTool="pdf-to-ppt"
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToConverter={scrollToConverter}
      />

      <main className="flex-1">
        {/* H1 SEO Hero */}
        <PdfToPptHero />

        {/* Main Interactive Converter Workspace */}
        <PdfToPptConverter />

        {/* Step-by-Step Guide (H2: Cómo convertir PDF a PPT online gratis) */}
        <PdfToPptHowItWorks />

        {/* In-depth Content (H2: Convierte PDF a PowerPoint editable, H2: Cómo funciona, H2: Ventajas) */}
        <PdfToPptContentSection />

        {/* Features Grid (H2: Características de nuestro convertidor de PDF a PPT) */}
        <PdfToPptFeatures />

        {/* Security and Privacy Pledge */}
        <SecurityBanner />

        {/* Related Document Tools Grid */}
        <RelatedToolsSection
          currentTool="pdf-to-ppt"
          onOpenTools={() => setToolsModalOpen(true)}
        />

        {/* FAQ Accordion (H2: Preguntas frecuentes sobre convertir PDF a PPT) */}
        <PdfToPptFaq />
      </main>

      {/* Footer */}
      <Footer
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToConverter={scrollToConverter}
        onScrollToFaq={scrollToFaq}
      />

      {/* Tools Catalog Modal */}
      <ToolsModal
        isOpen={toolsModalOpen}
        activeTool="pdf-to-ppt"
        onClose={() => setToolsModalOpen(false)}
        onSelectWordToPdf={() => {}}
      />

      {/* Contact & Support Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </div>
  );
}

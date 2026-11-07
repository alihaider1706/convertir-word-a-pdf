'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolsModal from '@/components/ToolsModal';
import { Mail, MessageSquare, Clock, CheckCircle2, Send, ShieldCheck, ArrowRight } from 'lucide-react';
import { PhoneIcon } from '@/components/legal/LegalIcons';

export default function ContactoPage() {
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('soporte-general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    // Simulate swift submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <Header
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => {}}
      />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200/80 pt-12 pb-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 inline-flex items-center gap-1.5 shadow-2xs">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Atención y Asistencia Técnica</span>
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Contacto y Soporte Oficial
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              ¿Tienes alguna duda sobre la conversión de tus documentos, necesitas asistencia técnica o deseas reportar una sugerencia? Estamos a tu completa disposición.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 cols: Direct Contact Channels */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Canales Directos</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Elige el medio de comunicación más cómodo para ti.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Phone / WhatsApp Card */}
                  <a
                    href="https://wa.me/923187338727"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <PhoneIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                        Teléfono / WhatsApp Directo
                      </span>
                      <strong className="text-sm text-slate-900 font-mono block mt-0.5 group-hover:text-emerald-700 transition-colors">
                        +92 318 7338727
                      </strong>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Pulsa para abrir chat directo en WhatsApp o llamar.
                      </span>
                    </div>
                  </a>

                  {/* Email Card */}
                  <a
                    href="mailto:easygrade6@gmail.com"
                    className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
                        Correo Electrónico
                      </span>
                      <strong className="text-sm text-slate-900 font-mono block mt-0.5 group-hover:text-blue-700 transition-colors break-all">
                        easygrade6@gmail.com
                      </strong>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Recepción constante de solicitudes técnicas.
                      </span>
                    </div>
                  </a>
                </div>

                {/* Service Commitments */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Tiempo medio de respuesta: <strong>menos de 24 horas</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Atención confidencial y personalizada</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 7 cols: Interactive Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      ¡Mensaje Recibido con Éxito!
                    </h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Hemos recibido tu mensaje correctamente. Nuestro equipo técnico revisará los detalles y te responderá a <strong className="text-slate-900 font-mono">{email}</strong> lo antes posible.
                    </p>
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                      >
                        Enviar otra consulta
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="text-base font-bold text-slate-900">Formulario de Asistencia</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Rellena los campos para remitir tu consulta a nuestro equipo técnico.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tu Nombre
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nombre o empresa"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Correo Electrónico <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ejemplo@correo.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Motivo de la Consulta
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white cursor-pointer"
                      >
                        <option value="soporte-general">Soporte Técnico / Problema de Conversión</option>
                        <option value="privacidad">Preguntas de Privacidad y Tratamiento de Archivos</option>
                        <option value="sugerencia">Sugerencia de Nueva Herramienta o Formato</option>
                        <option value="empresas">Consultas Comerciales / Uso Empresarial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mensaje o Detalle de la Solicitud <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe detalladamente tu pregunta o el tipo de documento con el que necesitas ayuda..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <span>Enviando mensaje...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar Mensaje a Soporte</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenContact={() => {}}
        onScrollToConverter={() => {}}
        onScrollToFaq={() => {}}
      />

      <ToolsModal
        isOpen={toolsModalOpen}
        onClose={() => setToolsModalOpen(false)}
      />
    </div>
  );
}

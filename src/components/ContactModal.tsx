'use client';

import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-zinc-200/90 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
          <div>
            <h3 id="contact-modal-title" className="text-base font-extrabold text-zinc-900 tracking-tight">
              Contacto y Soporte
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Envíanos tus dudas o sugerencias.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-900">¡Mensaje enviado con éxito!</h4>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto leading-relaxed">
              Gracias por escribirnos. Responderemos a tu consulta a la mayor brevedad posible.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
              >
                Cerrar ventana
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Tu nombre (opcional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Correo electrónico <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Mensaje <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe aquí tu consulta o reporte de error..."
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-colors resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar mensaje</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

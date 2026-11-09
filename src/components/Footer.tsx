import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenTools: () => void;
  onOpenContact: () => void;
  onScrollToConverter: () => void;
  onScrollToFaq: () => void;
}

export default function Footer({
  onOpenTools,
  onOpenContact,
  onScrollToConverter,
  onScrollToFaq,
}: FooterProps) {
  return (
    <footer className="bg-white border-t border-zinc-200/80 mt-auto pt-12 pb-10 text-zinc-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-200/80">
          {/* Col 1: Brand & Description */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                W
              </div>
              <span className="font-bold text-zinc-900 text-sm tracking-tight">
                Convertir Word a PDF
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-sm leading-relaxed">
              Herramienta online para transformar archivos DOC y DOCX a formato PDF con alta fidelidad gráfica, rapidez y máxima seguridad.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conexión cifrada SSL • Purgado automático en 1 hora</span>
            </div>
          </div>

          {/* Col 2: Main Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Herramientas Populares
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={onScrollToConverter}
                  className="hover:text-zinc-900 transition-colors text-left"
                >
                  Convertir Word a PDF
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTools}
                  className="hover:text-zinc-900 transition-colors text-left"
                >
                  PDF a Word
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTools}
                  className="hover:text-zinc-900 transition-colors text-left"
                >
                  Comprimir PDF
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTools}
                  className="hover:text-zinc-900 transition-colors text-left"
                >
                  Unir varios PDF
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Soporte & Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={onScrollToFaq}
                  className="hover:text-zinc-900 transition-colors text-left"
                >
                  Preguntas frecuentes
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-zinc-900 transition-colors text-left"
                >
                  Contacto & Soporte
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-zinc-900 transition-colors text-left"
                >
                  Política de Privacidad
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-zinc-900 transition-colors text-left"
                >
                  Términos de Servicio
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
          <p>© {new Date().getFullYear()} Convertir Word a PDF. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            <span>Inspirado en diseño minimalista & privacidad</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

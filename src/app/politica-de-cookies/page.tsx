import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';
import { generatePageMetadata } from '@/lib/seo-service';
import { Settings, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { CookieIcon, PhoneIcon } from '@/components/legal/LegalIcons';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('/politica-de-cookies', {
    title: 'Política de Cookies | Convertir Word a PDF',
    description:
      'Información transparente sobre el uso de cookies técnicas y de preferencias en Convertir Word a PDF.',
  });
}

export default function PoliticaCookiesPage() {
  const toc = [
    { id: 'que-son', label: '1. ¿Qué son las Cookies?' },
    { id: 'tipos', label: '2. Cookies que Utilizamos' },
    { id: 'finalidad', label: '3. Finalidad del Uso' },
    { id: 'gestion', label: '4. Cómo Desactivar o Eliminar Cookies' },
    { id: 'contacto', label: '5. Dudas sobre Cookies' },
  ];

  return (
    <LegalLayout
      title="Política de Cookies"
      subtitle="Explicación clara y detallada sobre las tecnologías de almacenamiento local y cookies empleadas en nuestra plataforma."
      toc={toc}
      lastUpdated="8 de Noviembre de 2026"
    >
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
        <CookieIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-700 leading-relaxed">
          En <strong>Convertir Word a PDF</strong> minimizamos el uso de cookies. Únicamente empleamos aquellas estrictamente necesarias para el funcionamiento técnico de las conversiones, la seguridad criptográfica y las preferencias de usuario.
        </p>
      </div>

      {/* Section 1 */}
      <section id="que-son" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          1. ¿Qué son las Cookies?
        </h2>
        <p>
          Una cookie es un pequeño archivo de texto que los sitios web almacenan en tu navegador o dispositivo móvil cuando los visitas. Permiten que la página web recuerde tus acciones y preferencias (como el idioma seleccionado, opciones de compresión o estado de sesión) durante un periodo determinado.
        </p>
      </section>

      {/* Section 2 */}
      <section id="tipos" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          2. Tipos de Cookies que Utilizamos
        </h2>
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900">Cookies Técnicas y Estrictamente Necesarias</strong>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                Esenciales
              </span>
            </div>
            <p className="text-slate-600">
              Permiten la navegación a través del sitio web y la utilización de las diferentes opciones o servicios que en él existen (por ejemplo, mantener la cola de conversión de archivos o validar tokens de seguridad).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900">Cookies de Preferencias y Funcionalidad</strong>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px]">
                Funcionales
              </span>
            </div>
            <p className="text-slate-600">
              Permiten recordar información para que el usuario acceda al servicio con determinadas características personalizadas (como el perfil de compresión preferido o la configuración de visualización).
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section id="finalidad" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          3. Finalidad del Uso
        </h2>
        <p>
          <strong>No utilizamos cookies con fines publicitarios invasivos ni vendemos perfiles de navegación a terceros.</strong> Toda información técnica se destina en exclusiva a asegurar que los archivos se transformen con alta fidelidad y rapidez sin interrupciones.
        </p>
      </section>

      {/* Section 4 */}
      <section id="gestion" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          4. Cómo Desactivar o Eliminar Cookies
        </h2>
        <p>
          Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador instalado en tu ordenador o teléfono inteligente:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
          <li><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios.</li>
          <li><strong>Mozilla Firefox:</strong> Opciones → Privacidad y Seguridad → Cookies y datos del sitio.</li>
          <li><strong>Microsoft Edge:</strong> Configuración → Permisos del sitio → Cookies y datos del sitio.</li>
          <li><strong>Apple Safari:</strong> Preferencias → Privacidad → Bloquear todas las cookies.</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section id="contacto" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          5. Dudas sobre Cookies
        </h2>
        <p>
          Para cualquier duda o sugerencia respecto a nuestra política de cookies, puedes dirigirte a:
        </p>
        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Email:</span>
            <a href="mailto:easygrade6@gmail.com" className="text-blue-300 hover:underline font-mono">
              easygrade6@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-emerald-400" />
            <span>Teléfono / WhatsApp:</span>
            <a href="tel:+923187338727" className="text-emerald-300 hover:underline font-mono">
              +92 318 7338727
            </a>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}

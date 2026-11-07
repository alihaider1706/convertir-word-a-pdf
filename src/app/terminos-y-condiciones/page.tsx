import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';
import { generatePageMetadata } from '@/lib/seo-service';
import { CheckCircle2, AlertTriangle, FileText, Mail } from 'lucide-react';
import { ScaleIcon, PhoneIcon } from '@/components/legal/LegalIcons';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('/terminos-y-condiciones', {
    title: 'Términos y Condiciones de Uso | Convertir Word a PDF',
    description:
      'Términos y condiciones legales de uso de las herramientas de conversión y optimización de documentos en Convertir Word a PDF.',
  });
}

export default function TerminosCondicionesPage() {
  const toc = [
    { id: 'aceptacion', label: '1. Aceptación de los Términos' },
    { id: 'servicios', label: '2. Descripción de los Servicios' },
    { id: 'uso-aceptable', label: '3. Política de Uso Aceptable' },
    { id: 'propiedad', label: '4. Propiedad Intelectual de los Archivos' },
    { id: 'garantias', label: '5. Exención de Responsabilidad y Garantías' },
    { id: 'modificaciones', label: '6. Modificaciones del Servicio' },
    { id: 'contacto', label: '7. Dudas y Reclamaciones' },
  ];

  return (
    <LegalLayout
      title="Términos y Condiciones"
      subtitle="Condiciones generales que regulan el acceso, navegación y uso de las herramientas de software de Convertir Word a PDF."
      toc={toc}
      lastUpdated="8 de Noviembre de 2026"
    >
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
        <ScaleIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-700 leading-relaxed">
          Al acceder o utilizar cualquier herramienta en <strong>convertirwordapdf.net</strong>, aceptas cumplir con los presentes Términos y Condiciones. Si no estás de acuerdo con alguna cláusula, debes suspender el uso del servicio de inmediato.
        </p>
      </div>

      {/* Section 1 */}
      <section id="aceptacion" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          1. Aceptación de los Términos
        </h2>
        <p>
          Estos Términos y Condiciones constituyen un acuerdo legal vinculante entre el usuario (en adelante, «el Usuario») y la plataforma digital <strong>Convertir Word a PDF</strong>. El acceso a las funcionalidades del sitio web atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas las disposiciones incluidas en este documento.
        </p>
      </section>

      {/* Section 2 */}
      <section id="servicios" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          2. Descripción de los Servicios
        </h2>
        <p>
          La plataforma ofrece un conjunto de utilidades en la nube para el procesamiento y transformación de archivos documentales, incluyendo de forma enunciativa pero no limitativa:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
          <li>Conversión bidireccional entre Microsoft Word (.doc, .docx) y formato PDF (.pdf).</li>
          <li>Transformación de documentos PDF a presentaciones editables de Microsoft PowerPoint (.pptx).</li>
          <li>Conversión y empaquetado de imágenes (JPG, PNG, WebP) a formato PDF y viceversa.</li>
          <li>Compresión, optimización de peso y reducción de tamaño de archivos PDF.</li>
          <li>Herramientas auxiliares de seguridad (protección criptográfica por contraseña) y gestión de páginas.</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="uso-aceptable" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          3. Política de Uso Aceptable
        </h2>
        <p>
          El Usuario se compromete a hacer un uso lícito y ético de la plataforma. Queda estrictamente prohibido:
        </p>
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Conductas Prohibidas:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Subir archivos que contengan virus, troyanos, ransomware o cualquier software dañino.</li>
            <li>Cargar o procesar materiales que vulneren derechos de autor, patentes o marcas de terceros.</li>
            <li>Realizar peticiones automatizadas de forma abusiva (ataques de denegación de servicio o scraping destructivo).</li>
            <li>Intentar eludir las medidas de seguridad, criptográficas o de acceso de nuestros servidores.</li>
          </ul>
        </div>
      </section>

      {/* Section 4 */}
      <section id="propiedad" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          4. Propiedad Intelectual de los Archivos
        </h2>
        <p>
          <strong>No reclamamos ningún derecho de autor ni propiedad</strong> sobre los textos, imágenes, diagramas o documentos que cargues o proceses a través de la plataforma. La titularidad legal permanece íntegramente en ti o en los respectivos titulares legítimos. El Usuario garantiza que cuenta con las autorizaciones pertinentes para convertir y manipular los documentos que somete al servicio.
        </p>
      </section>

      {/* Section 5 */}
      <section id="garantias" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          5. Exención de Responsabilidad y Garantías
        </h2>
        <p className="text-xs leading-relaxed">
          Las herramientas se proporcionan en la modalidad <strong>«tal cual» (AS IS)</strong> y según disponibilidad técnica. Aunque nos esforzamos por garantizar la más alta fidelidad visual y precisión algorítmica en la reconstrucción de fuentes, tipografías y tablas, no garantizamos que el servicio sea ininterrumpido o libre de errores en documentos extremadamente complejos o dañados. En ningún caso la plataforma será responsable por pérdida de datos no imputable a negligencia grave.
        </p>
      </section>

      {/* Section 6 */}
      <section id="modificaciones" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          6. Modificaciones del Servicio
        </h2>
        <p className="text-xs leading-relaxed">
          Nos reservamos el derecho de actualizar, modificar o discontinuar temporal o permanentemente cualquiera de las funcionalidades sin previo aviso, con el objetivo de incorporar mejoras de seguridad, rendimiento y compatibilidad con nuevos formatos documentales.
        </p>
      </section>

      {/* Section 7 */}
      <section id="contacto" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          7. Dudas y Reclamaciones
        </h2>
        <p>
          Si tienes alguna consulta relativa a estos Términos o deseas formular una aclaración, puedes contactarnos a través de nuestros canales oficiales:
        </p>
        <div className="bg-slate-900 rounded-xl p-4 text-white text-xs space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Email de atención:</span>
            <a href="mailto:easygrade6@gmail.com" className="text-blue-300 hover:underline font-mono">
              easygrade6@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-emerald-400" />
            <span>Línea telefónica / WhatsApp:</span>
            <a href="tel:+923187338727" className="text-emerald-300 hover:underline font-mono">
              +92 318 7338727
            </a>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}

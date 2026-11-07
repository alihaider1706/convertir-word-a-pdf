import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';
import { generatePageMetadata } from '@/lib/seo-service';
import { Mail, Shield, FileCheck } from 'lucide-react';
import { BuildingIcon, PhoneIcon, GlobeIcon } from '@/components/legal/LegalIcons';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('/aviso-legal', {
    title: 'Aviso Legal | Convertir Word a PDF',
    description:
      'Información legal identificativa del titular de la plataforma Convertir Word a PDF y condiciones generales de acceso.',
  });
}

export default function AvisoLegalPage() {
  const toc = [
    { id: 'identificacion', label: '1. Datos Identificativos del Titular' },
    { id: 'objeto', label: '2. Objeto y Ámbito de Aplicación' },
    { id: 'propiedad', label: '3. Propiedad Industrial e Intelectual' },
    { id: 'responsabilidad', label: '4. Régimen de Responsabilidad' },
    { id: 'enlaces', label: '5. Enlaces Externos' },
    { id: 'legislacion', label: '6. Ley Aplicable y Jurisdicción' },
  ];

  return (
    <LegalLayout
      title="Aviso Legal"
      subtitle="Información legal en cumplimiento de las obligaciones de transparencia e identificación de servicios de la sociedad de la información."
      toc={toc}
      lastUpdated="8 de Noviembre de 2026"
    >
      {/* Section 1 */}
      <section id="identificacion" className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <BuildingIcon className="w-4 h-4 text-blue-600" />
          <span>1. Datos Identificativos del Titular</span>
        </h2>
        <p>
          En cumplimiento del deber de información legal, a continuación se exponen los datos identificativos y de contacto de la entidad gestora de la plataforma:
        </p>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-2 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 block">Nombre Comercial:</span>
              <strong className="text-slate-900">Convertir Word a PDF</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Dominio Web Oficial:</span>
              <span className="font-mono text-blue-600">https://convertirwordapdf.net</span>
            </div>
            <div>
              <span className="text-slate-500 block">Correo Electrónico Oficial:</span>
              <a href="mailto:easygrade6@gmail.com" className="font-mono text-blue-600 hover:underline">
                easygrade6@gmail.com
              </a>
            </div>
            <div>
              <span className="text-slate-500 block">Teléfono / WhatsApp de Contacto:</span>
              <a href="tel:+923187338727" className="font-mono text-emerald-600 hover:underline">
                +92 318 7338727
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section id="objeto" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          2. Objeto y Ámbito de Aplicación
        </h2>
        <p>
          El presente Aviso Legal regula el acceso, navegación y uso del portal <strong>convertirwordapdf.net</strong>, así como las responsabilidades derivadas del uso de sus contenidos, software de procesamiento de documentos y servicios conexos.
        </p>
      </section>

      {/* Section 3 */}
      <section id="propiedad" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          3. Propiedad Industrial e Intelectual
        </h2>
        <p>
          Los elementos constitutivos de la plataforma, incluyendo el código fuente, la arquitectura de software, la interfaz de usuario (UI), los logotipos, iconos vectoriales, diseños gráficos y textos explicativos son titularidad exclusiva de <strong>Convertir Word a PDF</strong> o han sido licenciados legalmente para su explotación. Queda prohibida la reproducción, descompilación o redistribución no autorizada con fines comerciales sin consentimiento expreso por escrito.
        </p>
      </section>

      {/* Section 4 */}
      <section id="responsabilidad" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          4. Régimen de Responsabilidad
        </h2>
        <p className="text-xs leading-relaxed">
          El titular del sitio web actúa como proveedor de una herramienta técnica neutral de conversión. El titular no se hace responsable de las opiniones, contenidos o exactitud de los archivos procesados por los usuarios, siendo cada usuario responsable exclusivo de la veracidad y legalidad de los documentos que somete a conversión.
        </p>
      </section>

      {/* Section 5 */}
      <section id="enlaces" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          5. Enlaces Externos
        </h2>
        <p className="text-xs leading-relaxed">
          En caso de que en la página se dispusiesen enlaces o hipervínculos hacia otros sitios de Internet, el titular no ejercerá ningún tipo de control sobre dichos sitios y contenidos, ni asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio web ajeno.
        </p>
      </section>

      {/* Section 6 */}
      <section id="legislacion" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          6. Ley Aplicable y Jurisdicción
        </h2>
        <p className="text-xs leading-relaxed">
          Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web o de las actividades en él desarrolladas, será de aplicación la legislación aplicable a servicios digitales, sometiéndose las partes expresamente a los juzgados y tribunales competentes para la resolución de conflictos.
        </p>
      </section>
    </LegalLayout>
  );
}

import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';
import { generatePageMetadata } from '@/lib/seo-service';
import { ShieldCheck, Lock, Trash2, Mail, EyeOff } from 'lucide-react';
import { PhoneIcon } from '@/components/legal/LegalIcons';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('/politica-de-privacidad', {
    title: 'Política de Privacidad | Convertir Word a PDF',
    description:
      'Conoce nuestra política de privacidad, tratamiento de datos y compromiso de eliminación automática de documentos en Convertir Word a PDF.',
  });
}

export default function PoliticaPrivacidadPage() {
  const toc = [
    { id: 'responsable', label: '1. Responsable del Tratamiento' },
    { id: 'archivos', label: '2. Tratamiento de Documentos y Archivos' },
    { id: 'eliminacion', label: '3. Política de Eliminación Automática' },
    { id: 'cifrado', label: '4. Cifrado y Seguridad Técnica' },
    { id: 'datos-personales', label: '5. Datos Personales Recopilados' },
    { id: 'derechos', label: '6. Derechos del Usuario (RGPD)' },
    { id: 'contacto', label: '7. Canal Directo de Contacto' },
  ];

  return (
    <LegalLayout
      title="Política de Privacidad"
      subtitle="Tu privacidad y la estricta confidencialidad de tus documentos son el pilar fundamental de nuestra plataforma."
      toc={toc}
      lastUpdated="8 de Noviembre de 2026"
    >
      {/* Introduction highlight card */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-950 leading-relaxed">
          En <strong>Convertir Word a PDF</strong>, aplicamos una política de privacidad por diseño (Privacy by Design). No leemos, no inspeccionamos, no almacenamos de forma permanente ni comercializamos con el contenido de los documentos que procesas en nuestras herramientas.
        </p>
      </div>

      {/* Section 1 */}
      <section id="responsable" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          1. Responsable del Tratamiento
        </h2>
        <p>
          De conformidad con el Reglamento General de Protección de Datos (RGPD UE 2016/679) y normativas internacionales de protección de datos, el responsable del tratamiento y administración técnica de esta plataforma es:
        </p>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs space-y-1.5 font-sans">
          <p><strong>Plataforma:</strong> Convertir Word a PDF (convertirwordapdf.net)</p>
          <p><strong>Correo electrónico de contacto:</strong> <a href="mailto:easygrade6@gmail.com" className="text-blue-600 hover:underline">easygrade6@gmail.com</a></p>
          <p><strong>Teléfono / WhatsApp de atención:</strong> <a href="tel:+923187338727" className="text-blue-600 hover:underline">+92 318 7338727</a></p>
          <p><strong>Actividad:</strong> Servicios de conversión, compresión y optimización de documentos digitales en línea.</p>
        </div>
      </section>

      {/* Section 2 */}
      <section id="archivos" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          2. Tratamiento de Documentos y Archivos
        </h2>
        <p>
          Cuando cargas un archivo (DOC, DOCX, PDF, PPTX, JPG, PNG) en nuestros convertidores, el archivo se transmite exclusivamente con el único propósito técnico de ejecutar la conversión solicitada:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
          <li><strong>Procesamiento automatizado:</strong> Ningún ser humano tiene acceso visual ni manual a tus documentos.</li>
          <li><strong>Sin minería de datos:</strong> No aplicamos modelos de entrenamiento de IA sobre tus documentos personales, financieros, académicos o legales.</li>
          <li><strong>Propiedad exclusiva:</strong> Sigues siendo el único titular de todos los derechos de propiedad intelectual sobre los archivos procesados.</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="eliminacion" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          3. Política de Eliminación Automática (1 Hora)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <Lock className="w-5 h-5 text-blue-600 mx-auto" />
            <h4 className="text-xs font-bold text-slate-900">Cifrado Temporal</h4>
            <p className="text-[11px] text-slate-500">Almacenamiento volátil durante la conversión.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <Trash2 className="w-5 h-5 text-rose-600 mx-auto" />
            <h4 className="text-xs font-bold text-slate-900">Purgado a los 60 min</h4>
            <p className="text-[11px] text-slate-500">Eliminación definitiva e irreversible de disco.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <EyeOff className="w-5 h-5 text-emerald-600 mx-auto" />
            <h4 className="text-xs font-bold text-slate-900">Cero Copias</h4>
            <p className="text-[11px] text-slate-500">Sin respaldos ocultos de tus archivos.</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed">
          Una vez completada la conversión y transcurrido un periodo máximo de <strong>1 hora</strong> (para permitirte descargar tu archivo convertido), el sistema ejecuta una rutina automática e irrevocable que borra tanto el archivo original como el archivo resultante de nuestros servidores.
        </p>
      </section>

      {/* Section 4 */}
      <section id="cifrado" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          4. Cifrado y Seguridad Técnica
        </h2>
        <p>
          Implementamos medidas de seguridad de estándar bancario para proteger las comunicaciones entre tu dispositivo y nuestros servidores:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
          <li><strong>Cifrado TLS 1.3 / SSL de 256 bits:</strong> Todos los datos viajan cifrados extremo a extremo en tránsito.</li>
          <li><strong>Servidores Serverless aislados:</strong> Cada conversión se procesa en entornos sandbox independientes sin conexión con procesos de otros usuarios.</li>
          <li><strong>Protección contra ataques:</strong> Firewalls activos contra intrusiones, inyecciones de código y peticiones maliciosas.</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section id="datos-personales" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          5. Datos Personales Recopilados
        </h2>
        <p>
          Para usar las herramientas de conversión <strong>no se requiere registro, creación de cuenta ni tarjeta de crédito</strong>. Los únicos datos técnicos registrados de manera anónima son métricas de tráfico y diagnóstico (dirección IP anonimizada, tipo de navegador y tasa de éxito de conversión) con el fin exclusivo de mantener la estabilidad operativa del servicio.
        </p>
      </section>

      {/* Section 6 */}
      <section id="derechos" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          6. Derechos del Usuario (RGPD / GDPR)
        </h2>
        <p>
          Como usuario, te asisten los derechos de acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición. Aunque la plataforma no almacena perfiles personales vinculados a tus archivos, puedes ejercer cualquier consulta legal remitiendo un correo a nuestro delegado de privacidad.
        </p>
      </section>

      {/* Section 7 */}
      <section id="contacto" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          7. Canal Directo de Contacto
        </h2>
        <p>
          Si tienes preguntas sobre nuestra política de privacidad o deseas solicitar asistencia directa, comunícate con nosotros:
        </p>
        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Email oficial:</span>
            <a href="mailto:easygrade6@gmail.com" className="text-blue-300 hover:underline font-mono">
              easygrade6@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-emerald-400" />
            <span>Atención telefónica / WhatsApp:</span>
            <a href="tel:+923187338727" className="text-emerald-300 hover:underline font-mono">
              +92 318 7338727
            </a>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}

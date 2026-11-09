'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Zap, Shield, ArrowRight, Loader2, HelpCircle } from 'lucide-react';

export default function PreciosPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!session) {
      // Redirect to login with callback
      router.push(`/auth/login?callbackUrl=/precios`);
      return;
    }

    setLoadingPlan(plan);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo iniciar el proceso de pago.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la pasarela de pago.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const isPro = (session?.user as any)?.planType === 'PRO_MONTHLY' || (session?.user as any)?.planType === 'PRO_YEARLY';

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-zinc-900">
      {/* Top Simple Navigation */}
      <nav className="w-full bg-white border-b border-zinc-200/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
            <span>W</span>
            <span className="text-[10px] text-zinc-400 ml-0.5">P</span>
          </div>
          <span className="font-bold text-zinc-900 tracking-tight group-hover:text-zinc-700">
            Word a PDF
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-zinc-100 text-zinc-800 hover:bg-zinc-200 transition-colors"
            >
              Mi Panel
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-zinc-900 text-white hover:bg-black transition-colors"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Precios Simples y Transparentes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Elige el plan ideal para tus documentos
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-600">
            Convierte documentos sin esperas, con mayor capacidad de archivo y acceso prioritario ilimitado.
          </p>

          {/* Billing Cycle Switch */}
          <div className="mt-8 inline-flex items-center p-1 bg-zinc-200/70 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Facturación Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span>Facturación Anual</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                -37% Ahorro
              </span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="max-w-md mx-auto mb-8 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Plan Gratuito</span>
                <span className="text-xs bg-zinc-100 text-zinc-700 font-semibold px-2.5 py-1 rounded-full">Básico</span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-zinc-900">$0</span>
                <span className="text-sm text-zinc-500">/ para siempre</span>
              </div>
              <p className="mt-2 text-xs text-zinc-600">
                Ideal para usuarios ocasionales que solo necesitan convertir 1 o 2 documentos al día.
              </p>

              <div className="mt-8 space-y-3.5 border-t border-zinc-100 pt-6">
                <div className="flex items-center gap-3 text-xs text-zinc-700">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>3 conversiones</strong> por día</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-700">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Tamaño máximo: <strong>15 MB</strong> por archivo</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-700">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Conversión DOC y DOCX a PDF</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 line-through">
                  <span>Descargas por lotes (Batch ZIP)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 line-through">
                  <span>Procesamiento prioritario en cola</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href="/"
                className="w-full block text-center py-3 px-4 rounded-xl border border-zinc-200 text-zinc-800 font-semibold text-xs hover:bg-zinc-50 transition-colors"
              >
                Continuar con el Plan Gratuito
              </Link>
            </div>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="bg-zinc-900 text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl border-2 border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">
              Recomendado
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Plan Pro Ilimitado
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                {billingCycle === 'monthly' ? (
                  <>
                    <span className="text-4xl font-extrabold text-white">$7.99</span>
                    <span className="text-sm text-zinc-400">/ mes</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold text-white">$4.99</span>
                    <span className="text-sm text-zinc-400">/ mes (facturado $59.99/año)</span>
                  </>
                )}
              </div>
              <p className="mt-2 text-xs text-zinc-300">
                Para estudiantes, profesionales y empresas que necesitan procesar documentos sin límites.
              </p>

              <div className="mt-8 space-y-3.5 border-t border-zinc-800 pt-6">
                <div className="flex items-center gap-3 text-xs text-zinc-200">
                  <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Conversiones ILIMITADAS</strong> sin cuota diaria</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-200">
                  <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Tamaño masivo: hasta <strong>150 MB</strong> por archivo</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-200">
                  <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Batch ZIP:</strong> Empaqueta decenas de archivos a la vez</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-200">
                  <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Velocidad Prioritaria:</strong> Servidores dedicados sin colas</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-200">
                  <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Soporte al cliente prioritario 24/7</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              {isPro ? (
                <Link
                  href="/dashboard"
                  className="w-full block text-center py-3.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                >
                  Ya tienes el Plan Pro Activo (Ir al Panel)
                </Link>
              ) : (
                <button
                  onClick={() => handleSubscribe(billingCycle)}
                  disabled={loadingPlan !== null}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {loadingPlan === billingCycle ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Conectando con Stripe...</span>
                    </>
                  ) : (
                    <>
                      <span>{session ? 'Actualizar a Pro con Stripe' : 'Crear Cuenta y Suscribirme'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
              <p className="mt-2 text-center text-[11px] text-zinc-400">
                Pago 100% seguro con Stripe • Cancela en cualquier momento
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto border-t border-zinc-200 pt-12">
          <h2 className="text-xl font-bold text-center text-zinc-900 mb-8 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-zinc-500" />
            <span>Preguntas Frecuentes sobre las Suscripciones</span>
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200/80">
              <h3 className="font-semibold text-xs text-zinc-900">¿Puedo cancelar mi suscripción en cualquier momento?</h3>
              <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
                Sí, totalmente. Desde tu panel de usuario puedes acceder al portal de clientes de Stripe y cancelar tu suscripción con un solo clic. Mantendrás el acceso Pro hasta el final de tu período facturado.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200/80">
              <h3 className="font-semibold text-xs text-zinc-900">¿Qué métodos de pago aceptan?</h3>
              <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
                Aceptamos tarjetas de crédito y débito Visa, MasterCard, American Express, así como Apple Pay y Google Pay a través del procesamiento seguro de Stripe.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200/80">
              <h3 className="font-semibold text-xs text-zinc-900">¿Qué pasa si supero el límite de 3 conversiones en el plan gratuito?</h3>
              <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
                En el plan gratuito el contador se reinicia cada 24 horas. Si necesitas convertir documentos de inmediato sin esperar al día siguiente, puedes pasarte al Plan Pro para tener conversiones ilimitadas al instante.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Zap,
  CreditCard,
  FileText,
  Clock,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [usageData, setUsageData] = useState<{
    usedToday: number;
    maxAllowed: number;
    remaining: number | string;
    isPro: boolean;
    planType: string;
  } | null>(null);

  const [loadingPortal, setLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/user/status')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUsageData({
              usedToday: data.usedToday || 0,
              maxAllowed: data.maxAllowed || 3,
              remaining: data.remaining,
              isPro: data.isPro,
              planType: data.planType,
            });
          }
        })
        .catch((err) => console.error('Error fetching usage:', err));
    }
  }, [session]);

  const handleOpenStripePortal = async () => {
    setLoadingPortal(true);
    setPortalError(null);

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo abrir el portal de Stripe.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setPortalError(err.message || 'Error al conectar con Stripe.');
    } finally {
      setLoadingPortal(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isPro =
    usageData?.isPro ||
    (session?.user as any)?.planType === 'PRO_MONTHLY' ||
    (session?.user as any)?.planType === 'PRO_YEARLY';

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-zinc-900">
      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-zinc-200/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
            <span>W</span>
            <span className="text-[10px] text-zinc-400 ml-0.5">P</span>
          </div>
          <span className="font-bold text-zinc-900 tracking-tight">Word a PDF</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Convertir documento
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                ¡Hola, {session.user?.name || session.user?.email?.split('@')[0]}!
              </h1>
              {isPro ? (
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[11px] font-black tracking-wider uppercase shadow-xs">
                  PRO
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 text-zinc-700 text-[11px] font-bold">
                  GRATIS
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500">{session.user?.email}</p>
          </div>

          <div className="flex items-center gap-3">
            {isPro ? (
              <button
                onClick={handleOpenStripePortal}
                disabled={loadingPortal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 text-zinc-800 hover:bg-zinc-50 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{loadingPortal ? 'Cargando portal...' : 'Facturas y Suscripción'}</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </button>
            ) : (
              <Link
                href="/precios"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Actualizar a Plan Pro</span>
              </Link>
            )}
          </div>
        </div>

        {portalError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {portalError}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid sm:grid-cols-3 gap-5">
          {/* Usage Metric */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Uso Diario</span>
              <Clock className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-zinc-900">
                {isPro ? '∞' : `${usageData?.usedToday ?? 0} / 3`}
              </span>
              <span className="text-xs text-zinc-500">
                {isPro ? 'Conversiones Ilimitadas' : 'usadas hoy'}
              </span>
            </div>
            <div className="mt-4 w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${isPro ? 'bg-emerald-500 w-full' : 'bg-blue-600'}`}
                style={{
                  width: isPro ? '100%' : `${Math.min(100, ((usageData?.usedToday ?? 0) / 3) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Plan Status */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Tu Plan</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900">
                {isPro ? 'Plan Pro Activo' : 'Plan Gratuito'}
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {isPro
                ? 'Acceso completo a archivos de 150MB y Batch ZIP.'
                : 'Límite de 3 conversiones diarias y 15MB.'}
            </p>
          </div>

          {/* Cloud Storage / Speed */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Velocidad</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900">
                {isPro ? 'Prioridad Ultra' : 'Estándar'}
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {isPro ? 'Cola dedicada sin esperas.' : 'Cola compartida gratuita.'}
            </p>
          </div>
        </div>

        {/* Quick Convert Call to Action */}
        <div className="p-8 rounded-3xl bg-zinc-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <h2 className="text-xl font-bold">¿Listo para convertir tus documentos?</h2>
            <p className="text-xs text-zinc-300 mt-1">
              Sube tus archivos DOC o DOCX y descárgalos en PDF al instante con la máxima calidad.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs transition-all shadow-md active:scale-[0.98] whitespace-nowrap"
          >
            <span>Ir al Convertidor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}

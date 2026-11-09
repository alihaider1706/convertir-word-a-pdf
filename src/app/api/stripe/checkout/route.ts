import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Por favor inicia sesión para suscribirte.', requireAuth: true },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan = 'monthly' } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado.' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId =
      plan === 'yearly'
        ? process.env.STRIPE_PRICE_YEARLY
        : process.env.STRIPE_PRICE_MONTHLY;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // If real Stripe price ID is not set yet, provide mock checkout or real session
    if (!priceId || priceId.includes('placeholder')) {
      // In development mode without Stripe setup:
      return NextResponse.json({
        success: true,
        isDevFallback: true,
        message: 'Modo de desarrollo: Configura tus claves de Stripe en .env para pagos reales.',
        url: `${appUrl}/dashboard?payment=success&mockPlan=${plan === 'yearly' ? 'PRO_YEARLY' : 'PRO_MONTHLY'}`,
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        planType: plan === 'yearly' ? 'PRO_YEARLY' : 'PRO_MONTHLY',
      },
      success_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/precios?payment=cancelled`,
    });

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al iniciar el pago con Stripe.' },
      { status: 500 }
    );
  }
}

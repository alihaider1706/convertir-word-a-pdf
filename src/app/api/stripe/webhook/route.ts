import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && !webhookSecret.includes('placeholder')) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Allow testing without webhook signature in dev
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: 'Firma de webhook inválida' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const planType = session.metadata?.planType || 'PRO_MONTHLY';

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
              planType: planType,
            },
          });
          console.log(`[Stripe Webhook] User ${userId} upgraded to ${planType}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        const isCanceled = subscription.status === 'canceled' || subscription.cancel_at_period_end;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          const currentPeriodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripePriceId: subscription.items?.data?.[0]?.price?.id,
              stripeCurrentPeriodEnd: currentPeriodEnd,
              planType: isCanceled ? 'FREE' : user.planType,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              planType: 'FREE',
              stripeSubscriptionId: null,
            },
          });
          console.log(`[Stripe Webhook] User ${user.id} downgraded to FREE`);
        }
        break;
      }

      default:
        // Other events ignored
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing Stripe webhook event:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}

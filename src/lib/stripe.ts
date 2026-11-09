import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as any,
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: 'Gratis',
    maxDailyConversions: 3,
    maxFileSizeMb: 15,
    batchZipAllowed: false,
    priceMonthly: 0,
    priceYearly: 0,
  },
  PRO_MONTHLY: {
    name: 'Pro Mensual',
    maxDailyConversions: Infinity,
    maxFileSizeMb: 100,
    batchZipAllowed: true,
    priceMonthly: 7.99,
  },
  PRO_YEARLY: {
    name: 'Pro Anual',
    maxDailyConversions: Infinity,
    maxFileSizeMb: 150,
    batchZipAllowed: true,
    priceYearly: 59.99, // ~$4.99/month
  },
};

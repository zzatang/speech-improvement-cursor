import Stripe from 'stripe';

// Check if we're in a production environment
const isProduction = process.env.NODE_ENV === 'production';

// Only initialize Stripe if we have an API key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? '';

// Create a dummy implementation for development when keys are missing
const createDummyStripe = () => {
  return {
    webhooks: {
      constructEvent: () => ({ type: 'dummy.event', data: { object: {} } })
    },
    products: { create: async () => ({}) },
    prices: { create: async () => ({}) },
    customers: { create: async () => ({}) },
    checkout: { sessions: { create: async () => ({}) } },
    subscriptions: { retrieve: async () => ({}) }
  } as unknown as Stripe;
};

// Export either a real Stripe instance or a dummy one
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      // https://github.com/stripe/stripe-node#configuration
      // https://stripe.com/docs/api/versioning
      apiVersion: '2025-02-24.acacia',
      // Register this as an official Stripe plugin.
      // https://stripe.com/docs/building-plugins#setappinfo
      appInfo: {
        name: 'Next.js Subscription Starter',
        version: '0.0.0',
        url: 'https://github.com/vercel/nextjs-subscription-payments'
      }
    })
  : createDummyStripe();

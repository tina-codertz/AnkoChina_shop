import { Hono } from 'hono';
import type { Env } from '../types';

const checkout = new Hono<{ Bindings: Env }>();

checkout.post('/calculate-tax', async (c) => {
  const { state, subtotal } = await c.req.json<{ state: string; subtotal: number }>();

  const taxRates: Record<string, number> = {
    CA: 0.0725, NY: 0.08, TX: 0.0625, FL: 0.06,
    WA: 0.065, IL: 0.0625, PA: 0.06, OH: 0.0575,
    NJ: 0.06625, MA: 0.0625,
  };

  const rate = taxRates[state?.toUpperCase()] || 0.05;
  const taxCents = Math.round(subtotal * rate);

  return c.json({ taxCents, rate });
});

checkout.post('/create-payment-intent', async (c) => {
  const { amount, currency } = await c.req.json<{ amount: number; currency?: string }>();

  if (!amount || amount < 50) {
    return c.json({ error: 'Amount must be at least 50 cents' }, 400);
  }

  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe is not configured' }, 500);
  }

  const response = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(c.env.STRIPE_ACCOUNT_ID ? { 'Stripe-Account': c.env.STRIPE_ACCOUNT_ID } : {}),
    },
    body: new URLSearchParams({
      amount: amount.toString(),
      currency: currency || 'usd',
      automatic_payment_methods: 'true',
    }).toString(),
  });

  const data = await response.json() as any;

  if (!response.ok) {
    return c.json({ error: data.error?.message || 'Stripe error' }, 500);
  }

  return c.json({ clientSecret: data.client_secret, paymentIntentId: data.id });
});

export default checkout;

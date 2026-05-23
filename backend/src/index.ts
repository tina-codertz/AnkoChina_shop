import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types';

import auth from './routes/auth';
import products from './routes/products';
import collections from './routes/collections';
import orders from './routes/orders';
import wishlist from './routes/wishlist';
import checkout from './routes/checkout';
import admin from './routes/admin';
import newsletter from './routes/newsletter';

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());

app.use('*', cors({
  origin: (origin, c) => {
    const allowedOrigins = [
      c.env.FRONTEND_URL || 'http://localhost:8080',
      'http://localhost:8080',
      'http://localhost:5173',
      "https://anko-china-shop.vercel.app",
    ];
    if (!origin || allowedOrigins.includes(origin)) return origin || allowedOrigins[0];
    return '';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

app.get('/', (c) => {
  return c.json({
    name: 'Anko Shop API',
    version: '1.0.0',
    status: 'running',
  });
});

app.route('/api/auth', auth);
app.route('/api/products', products);
app.route('/api/collections', collections);
app.route('/api/orders', orders);
app.route('/api/wishlist', wishlist);
app.route('/api/checkout', checkout);
app.route('/api/admin', admin);
app.route('/api/newsletter', newsletter);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;

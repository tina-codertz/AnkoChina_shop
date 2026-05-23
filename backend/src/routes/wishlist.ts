import { Hono } from 'hono';
import type { Env, Product } from '../types';
import { authMiddleware } from '../middleware/auth';
import type { JWTPayload } from '../types';

const wishlist = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

wishlist.use('/*', authMiddleware());

wishlist.get('/', async (c) => {
  const user = c.get('user');

  const { results } = await c.env.DB.prepare(
    `SELECT p.* FROM wishlist w
     JOIN ecom_products p ON p.id = w.product_id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`
  ).bind(user.sub).all<Product>();

  const products = (results || []).map(p => ({
    ...p,
    images: p.images ? JSON.parse(p.images) : [],
    tags: p.tags ? JSON.parse(p.tags) : [],
  }));

  return c.json({ products });
});

wishlist.post('/:productId', async (c) => {
  const user = c.get('user');
  const productId = c.req.param('productId');

  const product = await c.env.DB.prepare(
    'SELECT id FROM ecom_products WHERE id = ?'
  ).bind(productId).first();

  if (!product) return c.json({ error: 'Product not found' }, 404);

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT OR IGNORE INTO wishlist (id, user_id, product_id) VALUES (?, ?, ?)'
  ).bind(id, user.sub, productId).run();

  return c.json({ success: true }, 201);
});

wishlist.delete('/:productId', async (c) => {
  const user = c.get('user');
  const productId = c.req.param('productId');

  await c.env.DB.prepare(
    'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?'
  ).bind(user.sub, productId).run();

  return c.json({ success: true });
});

export default wishlist;

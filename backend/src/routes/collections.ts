import { Hono } from 'hono';
import type { Env, Collection, Product } from '../types';

const collections = new Hono<{ Bindings: Env }>();

collections.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM ecom_collections ORDER BY sort_order ASC, title ASC'
  ).all<Collection>();

  return c.json({ collections: results || [] });
});

collections.get('/:handle', async (c) => {
  const handle = c.req.param('handle');

  const collection = await c.env.DB.prepare(
    'SELECT * FROM ecom_collections WHERE handle = ?'
  ).bind(handle).first<Collection>();

  if (!collection) return c.json({ error: 'Collection not found' }, 404);

  const { results: links } = await c.env.DB.prepare(
    'SELECT product_id FROM ecom_product_collections WHERE collection_id = ? ORDER BY position ASC'
  ).bind(collection.id).all<{ product_id: string }>();

  let products: any[] = [];
  if (links && links.length > 0) {
    const placeholders = links.map(() => '?').join(',');
    const ids = links.map(l => l.product_id);
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM ecom_products WHERE id IN (${placeholders}) AND status = 'active'`
    ).bind(...ids).all<Product>();

    products = (results || []).map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      tags: p.tags ? JSON.parse(p.tags) : [],
    }));
  }

  return c.json({ collection, products });
});

export default collections;

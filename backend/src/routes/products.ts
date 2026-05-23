import { Hono } from 'hono';
import type { Env, Product } from '../types';

const products = new Hono<{ Bindings: Env }>();

function parseJsonFields(product: Product) {
  return {
    ...product,
    images: product.images ? JSON.parse(product.images) : [],
    tags: product.tags ? JSON.parse(product.tags) : [],
  };
}

products.get('/', async (c) => {
  const { status, type, search, sort, limit, offset } = c.req.query();

  let query = 'SELECT * FROM ecom_products WHERE 1=1';
  const params: any[] = [];

  const filterStatus = status || 'active';
  if (filterStatus !== 'all') {
    query += ' AND status = ?';
    params.push(filterStatus);
  }

  if (type) {
    query += ' AND product_type = ?';
    params.push(type);
  }

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ? OR product_type LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  switch (sort) {
    case 'price-asc': query += ' ORDER BY price ASC'; break;
    case 'price-desc': query += ' ORDER BY price DESC'; break;
    case 'name': query += ' ORDER BY name ASC'; break;
    case 'newest': query += ' ORDER BY created_at DESC'; break;
    default: query += ' ORDER BY created_at DESC';
  }

  const lim = Math.min(parseInt(limit || '100', 10), 200);
  const off = parseInt(offset || '0', 10);
  query += ' LIMIT ? OFFSET ?';
  params.push(lim, off);

  const { results } = await c.env.DB.prepare(query).bind(...params).all<Product>();

  return c.json({
    products: (results || []).map(parseJsonFields),
    count: results?.length || 0,
  });
});

products.get('/:handle', async (c) => {
  const handle = c.req.param('handle');

  const product = await c.env.DB.prepare(
    'SELECT * FROM ecom_products WHERE handle = ?'
  ).bind(handle).first<Product>();

  if (!product) return c.json({ error: 'Product not found' }, 404);

  return c.json(parseJsonFields(product));
});

export default products;

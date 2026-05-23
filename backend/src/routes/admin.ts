import { Hono } from 'hono';
import type { Env, Product, Order, AppUser, Collection } from '../types';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import type { JWTPayload } from '../types';

const admin = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

admin.use('/*', authMiddleware());
admin.use('/*', adminMiddleware());

// ─── Dashboard Stats ───
admin.get('/dashboard', async (c) => {
  const totalProducts = await c.env.DB.prepare('SELECT COUNT(*) as count FROM ecom_products').first<{ count: number }>();
  const totalOrders = await c.env.DB.prepare('SELECT COUNT(*) as count FROM ecom_orders').first<{ count: number }>();
  const totalUsers = await c.env.DB.prepare('SELECT COUNT(*) as count FROM app_users').first<{ count: number }>();
  const revenue = await c.env.DB.prepare("SELECT COALESCE(SUM(total), 0) as total FROM ecom_orders WHERE status != 'cancelled'").first<{ total: number }>();

  const { results: recentOrders } = await c.env.DB.prepare(
    'SELECT * FROM ecom_orders ORDER BY created_at DESC LIMIT 10'
  ).all<Order>();

  const { results: lowStock } = await c.env.DB.prepare(
    "SELECT id, name, inventory_qty FROM ecom_products WHERE inventory_qty < 10 AND status = 'active' ORDER BY inventory_qty ASC LIMIT 10"
  ).all();

  return c.json({
    stats: {
      totalProducts: totalProducts?.count || 0,
      totalOrders: totalOrders?.count || 0,
      totalUsers: totalUsers?.count || 0,
      revenue: revenue?.total || 0,
    },
    recentOrders: recentOrders || [],
    lowStock: lowStock || [],
  });
});

// ─── Products CRUD ───
admin.get('/products', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM ecom_products ORDER BY created_at DESC'
  ).all<Product>();

  const products = (results || []).map(p => ({
    ...p,
    images: p.images ? JSON.parse(p.images) : [],
    tags: p.tags ? JSON.parse(p.tags) : [],
  }));

  return c.json({ products });
});

admin.post('/products', async (c) => {
  const body = await c.req.json<{
    name: string; handle?: string; description?: string;
    price: number; sku?: string; inventory_qty?: number;
    status?: string; product_type?: string;
    images?: string[]; tags?: string[];
  }>();

  const id = crypto.randomUUID();
  const handle = body.handle || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  await c.env.DB.prepare(
    `INSERT INTO ecom_products (id, name, handle, description, price, sku, inventory_qty, status, product_type, images, tags, has_variants)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
  ).bind(
    id, body.name, handle, body.description || null,
    body.price, body.sku || null, body.inventory_qty || 0,
    body.status || 'active', body.product_type || null,
    JSON.stringify(body.images || []),
    JSON.stringify(body.tags || [])
  ).run();

  return c.json({ id }, 201);
});

admin.put('/products/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{
    name?: string; handle?: string; description?: string;
    price?: number; sku?: string; inventory_qty?: number;
    status?: string; product_type?: string;
    images?: string[]; tags?: string[];
  }>();

  const sets: string[] = [];
  const values: any[] = [];

  if (body.name !== undefined) { sets.push('name = ?'); values.push(body.name); }
  if (body.handle !== undefined) { sets.push('handle = ?'); values.push(body.handle); }
  if (body.description !== undefined) { sets.push('description = ?'); values.push(body.description); }
  if (body.price !== undefined) { sets.push('price = ?'); values.push(body.price); }
  if (body.sku !== undefined) { sets.push('sku = ?'); values.push(body.sku); }
  if (body.inventory_qty !== undefined) { sets.push('inventory_qty = ?'); values.push(body.inventory_qty); }
  if (body.status !== undefined) { sets.push('status = ?'); values.push(body.status); }
  if (body.product_type !== undefined) { sets.push('product_type = ?'); values.push(body.product_type); }
  if (body.images !== undefined) { sets.push('images = ?'); values.push(JSON.stringify(body.images)); }
  if (body.tags !== undefined) { sets.push('tags = ?'); values.push(JSON.stringify(body.tags)); }

  if (sets.length === 0) return c.json({ error: 'No fields to update' }, 400);

  sets.push('updated_at = datetime("now")');
  values.push(id);

  await c.env.DB.prepare(
    `UPDATE ecom_products SET ${sets.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  return c.json({ success: true });
});

admin.delete('/products/:id', async (c) => {
  const id = c.req.param('id');

  try {
    await c.env.DB.prepare('DELETE FROM wishlist WHERE product_id = ?').bind(id).run();
    await c.env.DB.prepare('DELETE FROM ecom_product_collections WHERE product_id = ?').bind(id).run();

    const hasOrders = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM ecom_order_items WHERE product_id = ?'
    ).bind(id).first<{ count: number }>();

    if (hasOrders && hasOrders.count > 0) {
      await c.env.DB.prepare(
        "UPDATE ecom_products SET status = 'archived', updated_at = datetime('now') WHERE id = ?"
      ).bind(id).run();
      return c.json({ success: true, archived: true });
    }

    await c.env.DB.prepare('DELETE FROM ecom_products WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: 'Imeshindikana kufuta bidhaa: ' + (err.message || 'Unknown error') }, 500);
  }
});

// ─── Collections CRUD ───
admin.get('/collections', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM ecom_collections ORDER BY sort_order ASC'
  ).all<Collection>();

  return c.json({ collections: results || [] });
});

admin.post('/collections', async (c) => {
  const body = await c.req.json<{
    title: string; handle?: string; description?: string; image?: string; sort_order?: number;
  }>();

  const id = crypto.randomUUID();
  const handle = body.handle || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  await c.env.DB.prepare(
    'INSERT INTO ecom_collections (id, title, handle, description, image, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, body.title, handle, body.description || null, body.image || null, body.sort_order || 0).run();

  return c.json({ id }, 201);
});

admin.put('/collections/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{
    title?: string; handle?: string; description?: string; image?: string; sort_order?: number;
  }>();

  const sets: string[] = [];
  const values: any[] = [];

  if (body.title !== undefined) { sets.push('title = ?'); values.push(body.title); }
  if (body.handle !== undefined) { sets.push('handle = ?'); values.push(body.handle); }
  if (body.description !== undefined) { sets.push('description = ?'); values.push(body.description); }
  if (body.image !== undefined) { sets.push('image = ?'); values.push(body.image); }
  if (body.sort_order !== undefined) { sets.push('sort_order = ?'); values.push(body.sort_order); }

  if (sets.length === 0) return c.json({ error: 'No fields to update' }, 400);

  sets.push('updated_at = datetime("now")');
  values.push(id);

  await c.env.DB.prepare(
    `UPDATE ecom_collections SET ${sets.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  return c.json({ success: true });
});

admin.delete('/collections/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM ecom_product_collections WHERE collection_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM ecom_collections WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// ─── Orders Management ───
admin.get('/orders', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM ecom_orders ORDER BY created_at DESC'
  ).all<Order>();

  return c.json({ orders: results || [] });
});

admin.get('/orders/:id', async (c) => {
  const id = c.req.param('id');

  const order = await c.env.DB.prepare('SELECT * FROM ecom_orders WHERE id = ?').bind(id).first<Order>();
  if (!order) return c.json({ error: 'Order not found' }, 404);

  const { results: items } = await c.env.DB.prepare(
    'SELECT * FROM ecom_order_items WHERE order_id = ?'
  ).bind(id).all();

  return c.json({
    ...order,
    shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null,
    items: items || [],
  });
});

admin.patch('/orders/:id', async (c) => {
  const id = c.req.param('id');
  const { status, notes } = await c.req.json<{ status?: string; notes?: string }>();

  const sets: string[] = [];
  const values: any[] = [];

  if (status) { sets.push('status = ?'); values.push(status); }
  if (notes !== undefined) { sets.push('notes = ?'); values.push(notes); }

  if (sets.length === 0) return c.json({ error: 'No fields to update' }, 400);

  sets.push('updated_at = datetime("now")');
  values.push(id);

  await c.env.DB.prepare(
    `UPDATE ecom_orders SET ${sets.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  return c.json({ success: true });
});

// ─── Users Management ───
admin.get('/users', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, email, name, phone, role, created_at FROM app_users ORDER BY created_at DESC'
  ).all();

  return c.json({ users: results || [] });
});

admin.patch('/users/:id', async (c) => {
  const id = c.req.param('id');
  const { role, name } = await c.req.json<{ role?: string; name?: string }>();

  const sets: string[] = [];
  const values: any[] = [];

  if (role) { sets.push('role = ?'); values.push(role); }
  if (name !== undefined) { sets.push('name = ?'); values.push(name); }

  if (sets.length === 0) return c.json({ error: 'No fields to update' }, 400);

  sets.push('updated_at = datetime("now")');
  values.push(id);

  await c.env.DB.prepare(
    `UPDATE app_users SET ${sets.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  return c.json({ success: true });
});

admin.delete('/users/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM app_users WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default admin;

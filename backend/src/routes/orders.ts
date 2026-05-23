import { Hono } from 'hono';
import type { Env, Order, OrderItem } from '../types';
import { authMiddleware } from '../middleware/auth';
import type { JWTPayload } from '../types';

const orders = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

orders.use('/*', authMiddleware());

orders.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    items: Array<{
      product_id: string;
      variant_id?: string;
      product_name: string;
      variant_title?: string;
      sku?: string;
      quantity: number;
      unit_price: number;
    }>;
    shipping_address: any;
    customer_email: string;
    customer_name: string;
    customer_phone?: string;
    stripe_payment_intent_id: string;
  }>();

  if (!body.items?.length) {
    return c.json({ error: 'Order must have at least one item' }, 400);
  }

  // Calculate totals server-side for integrity
  let subtotal = 0;
  for (const item of body.items) {
    const product = await c.env.DB.prepare(
      'SELECT price, inventory_qty FROM ecom_products WHERE id = ?'
    ).bind(item.product_id).first<{ price: number; inventory_qty: number }>();

    if (!product) {
      return c.json({ error: `Product ${item.product_id} not found` }, 400);
    }
    if (product.inventory_qty < item.quantity) {
      return c.json({ error: `Insufficient stock for ${item.product_name}` }, 400);
    }
    item.unit_price = product.price;
    subtotal += product.price * item.quantity;
  }

  // Simple tax calculation (replace with real tax API)
  const taxRate = 0.08;
  const tax = Math.round(subtotal * taxRate);
  const shipping = 0;
  const total = subtotal + tax + shipping;

  // Upsert customer
  const customerId = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO ecom_customers (id, email, name, phone, address)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET name = excluded.name, phone = excluded.phone, address = excluded.address, updated_at = datetime('now')`
  ).bind(
    customerId,
    body.customer_email,
    body.customer_name,
    body.customer_phone || null,
    JSON.stringify(body.shipping_address)
  ).run();

  const customer = await c.env.DB.prepare(
    'SELECT id FROM ecom_customers WHERE email = ?'
  ).bind(body.customer_email).first<{ id: string }>();

  // Create order
  const orderId = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO ecom_orders (id, customer_id, user_id, status, subtotal, tax, shipping, total, shipping_address, stripe_payment_intent_id)
     VALUES (?, ?, ?, 'paid', ?, ?, ?, ?, ?, ?)`
  ).bind(
    orderId,
    customer?.id || null,
    user.sub,
    subtotal,
    tax,
    shipping,
    total,
    JSON.stringify(body.shipping_address),
    body.stripe_payment_intent_id
  ).run();

  // Insert line items + decrement inventory
  for (const item of body.items) {
    const itemId = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO ecom_order_items (id, order_id, product_id, variant_id, product_name, variant_title, sku, quantity, unit_price, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      itemId,
      orderId,
      item.product_id,
      item.variant_id || null,
      item.product_name,
      item.variant_title || null,
      item.sku || null,
      item.quantity,
      item.unit_price,
      item.unit_price * item.quantity
    ).run();

    await c.env.DB.prepare(
      'UPDATE ecom_products SET inventory_qty = inventory_qty - ? WHERE id = ?'
    ).bind(item.quantity, item.product_id).run();
  }

  // Send confirmation email (best-effort)
  try {
    await fetch(`https://famous.ai/api/ecommerce/${c.env.FAMOUS_AI_PROJECT_ID}/send-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        customerEmail: body.customer_email,
        customerName: body.customer_name,
        orderItems: body.items,
        subtotal, shipping, tax, total,
        shippingAddress: body.shipping_address,
      }),
    });
  } catch {}

  return c.json({ id: orderId, status: 'paid', subtotal, tax, shipping, total }, 201);
});

orders.get('/', async (c) => {
  const user = c.get('user');

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM ecom_orders WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.sub).all<Order>();

  return c.json({ orders: results || [] });
});

orders.get('/:id', async (c) => {
  const user = c.get('user');
  const orderId = c.req.param('id');

  const order = await c.env.DB.prepare(
    'SELECT * FROM ecom_orders WHERE id = ? AND user_id = ?'
  ).bind(orderId, user.sub).first<Order>();

  if (!order) return c.json({ error: 'Order not found' }, 404);

  const { results: items } = await c.env.DB.prepare(
    'SELECT * FROM ecom_order_items WHERE order_id = ?'
  ).bind(orderId).all<OrderItem>();

  return c.json({
    ...order,
    shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null,
    items: items || [],
  });
});

export default orders;

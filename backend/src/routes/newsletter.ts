import { Hono } from 'hono';
import type { Env } from '../types';

const newsletter = new Hono<{ Bindings: Env }>();

newsletter.post('/subscribe', async (c) => {
  const { email } = await c.req.json<{ email: string }>();

  if (!email || !email.includes('@')) {
    return c.json({ error: 'Valid email is required' }, 400);
  }

  const cleanEmail = email.toLowerCase().trim();

  // Store in a simple subscribers table (upsert to avoid duplicates)
  await c.env.DB.prepare(
    `INSERT INTO newsletter_subscribers (id, email) VALUES (?, ?)
     ON CONFLICT(email) DO NOTHING`
  ).bind(crypto.randomUUID(), cleanEmail).run();

  return c.json({ success: true });
});

export default newsletter;

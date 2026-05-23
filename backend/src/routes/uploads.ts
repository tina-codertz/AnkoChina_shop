import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import type { JWTPayload } from '../types';

const uploads = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

uploads.post('/', authMiddleware(), adminMiddleware(), async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file provided' }, 400);
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) {
    return c.json({ error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }, 400);
  }

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return c.json({ error: 'Image must be under 2MB' }, 400);
  }

  const id = crypto.randomUUID();
  const buffer = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const dataUrl = `data:${file.type};base64,${base64}`;

  await c.env.DB.prepare(
    'INSERT INTO uploads (id, data, content_type) VALUES (?, ?, ?)'
  ).bind(id, dataUrl, file.type).run();

  const apiBase = new URL(c.req.url).origin;
  return c.json({ url: `${apiBase}/api/uploads/${id}` }, 201);
});

uploads.get('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(
    'SELECT data, content_type FROM uploads WHERE id = ?'
  ).bind(id).first<{ data: string; content_type: string }>();

  if (!row) return c.json({ error: 'Not found' }, 404);

  const base64 = row.data.replace(/^data:[^;]+;base64,/, '');
  const bytes = Uint8Array.from(atob(base64), ch => ch.charCodeAt(0));

  return new Response(bytes, {
    headers: {
      'Content-Type': row.content_type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
});

export default uploads;

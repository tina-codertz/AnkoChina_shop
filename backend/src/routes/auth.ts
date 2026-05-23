import { Hono } from 'hono';
import type { Env, AppUser } from '../types';
import { hashPassword, verifyPassword } from '../lib/password';
import { signJWT, authMiddleware } from '../middleware/auth';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/register', async (c) => {
  const { email, password, name } = await c.req.json<{
    email: string;
    password: string;
    name: string;
  }>();

  if (!email || !password || password.length < 6) {
    return c.json({ error: 'Email and password (min 6 chars) are required' }, 400);
  }

  const cleanEmail = email.toLowerCase().trim();

  const existing = await c.env.DB.prepare(
    'SELECT id FROM app_users WHERE email = ?'
  ).bind(cleanEmail).first();

  if (existing) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    'INSERT INTO app_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, cleanEmail, passwordHash, name || null, 'customer').run();

  const token = await signJWT(
    { sub: id, email: cleanEmail, role: 'customer' },
    c.env.JWT_SECRET
  );

  // CRM subscription (best-effort)
  try {
    await fetch(`https://famous.ai/api/crm/${c.env.FAMOUS_AI_PROJECT_ID}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        name,
        source: 'registration',
        tags: ['customer', 'newsletter'],
      }),
    });
  } catch {}

  return c.json({
    token,
    user: { id, email: cleanEmail, name, role: 'customer', phone: null, address: null },
  }, 201);
});

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  const cleanEmail = email.toLowerCase().trim();

  const user = await c.env.DB.prepare(
    'SELECT * FROM app_users WHERE email = ?'
  ).bind(cleanEmail).first<AppUser>();

  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  // Migrate plain-text password to hashed on successful login
  if (!user.password_hash.startsWith('pbkdf2:')) {
    const hashed = await hashPassword(password);
    await c.env.DB.prepare(
      'UPDATE app_users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?'
    ).bind(hashed, user.id).run();
  }

  const token = await signJWT(
    { sub: user.id, email: user.email, role: user.role },
    c.env.JWT_SECRET
  );

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address ? JSON.parse(user.address) : null,
    },
  });
});

auth.get('/me', authMiddleware(), async (c) => {
  const jwtUser = c.get('user' as never) as { sub: string };

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, phone, role, address, created_at FROM app_users WHERE id = ?'
  ).bind(jwtUser.sub).first<AppUser>();

  if (!user) return c.json({ error: 'User not found' }, 404);

  return c.json({
    ...user,
    address: user.address ? JSON.parse(user.address) : null,
  });
});

auth.patch('/me', authMiddleware(), async (c) => {
  const jwtUser = c.get('user' as never) as { sub: string };
  const updates = await c.req.json<{ name?: string; phone?: string; address?: any }>();

  const sets: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) { sets.push('name = ?'); values.push(updates.name); }
  if (updates.phone !== undefined) { sets.push('phone = ?'); values.push(updates.phone); }
  if (updates.address !== undefined) { sets.push('address = ?'); values.push(JSON.stringify(updates.address)); }

  if (sets.length === 0) return c.json({ error: 'No fields to update' }, 400);

  sets.push('updated_at = datetime("now")');
  values.push(jwtUser.sub);

  await c.env.DB.prepare(
    `UPDATE app_users SET ${sets.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, phone, role, address, created_at FROM app_users WHERE id = ?'
  ).bind(jwtUser.sub).first<AppUser>();

  return c.json({
    ...user,
    address: user?.address ? JSON.parse(user.address) : null,
  });
});

export default auth;

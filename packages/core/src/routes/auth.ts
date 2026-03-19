import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Database } from '../db/index.js';
import { handleLogin, handleSetup, deleteSession, isSetupComplete } from '../middleware/auth.js';
import { LoginSchema, SetupSchema } from '../types.js';

export function createAuthRoutes(db: Database) {
  const router = new Hono();

  // POST /api/auth/setup - set initial password (first run)
  router.post('/setup', zValidator('json', SetupSchema), async (c) => {
    const { password } = c.req.valid('json');
    const { token } = await handleSetup(db, password);
    c.header('Set-Cookie', `duet_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`);
    return c.json({ success: true }, 201);
  });

  // POST /api/auth/login - login with password
  router.post('/login', zValidator('json', LoginSchema), async (c) => {
    const { password } = c.req.valid('json');
    const result = await handleLogin(db, password);
    if (!result) {
      return c.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid password' } }, 401);
    }
    c.header('Set-Cookie', `duet_session=${result.token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`);
    return c.json({ success: true });
  });

  // POST /api/auth/logout - clear session
  router.post('/logout', async (c) => {
    const cookie = c.req.header('Cookie');
    const sessionMatch = cookie?.match(/duet_session=([^;]+)/);
    if (sessionMatch) {
      await deleteSession(db, sessionMatch[1]);
    }
    c.header('Set-Cookie', 'duet_session=; HttpOnly; Path=/; Max-Age=0');
    return c.json({ success: true });
  });

  // GET /api/auth/me - check auth state
  router.get('/me', async (c) => {
    const setupDone = await isSetupComplete(db);
    return c.json({
      authenticated: false,
      setupRequired: !setupDone,
    });
  });

  return router;
}

import { Hono } from 'hono';
import type { Database } from '../db/index.js';
import { createAuthMiddleware, requireHuman, type AuthContext } from '../middleware/auth.js';
import { getAuthUrl, exchangeCode, isCalendarConnected, disconnectCalendar } from '../integrations/google-calendar/auth.js';
import { syncTodosToCalendar } from '../integrations/google-calendar/sync.js';
import { env } from '../env.js';

export function createCalendarRoutes(db: Database) {
  const router = new Hono<{ Variables: AuthContext }>();
  const auth = createAuthMiddleware(db);

  router.get('/auth-url', auth, requireHuman(), (c) => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      return c.json({ error: { code: 'NOT_CONFIGURED', message: 'Google Calendar credentials not configured' } }, 400);
    }
    const url = getAuthUrl();
    return c.json({ url });
  });

  router.get('/callback', async (c) => {
    const code = c.req.query('code');
    const error = c.req.query('error');
    if (error) return c.html(`<html><body><h2>Calendar connection failed</h2><p>${error}</p></body></html>`);
    if (!code) return c.html('<html><body><h2>Missing authorization code</h2></body></html>');

    try {
      // For callback, we need to know which user initiated it.
      // In self-hosted mode there's only one user. In cloud mode, we'd pass userId via state param.
      // For now, find the first user (self-hosted) or use state param (TODO: cloud mode)
      await exchangeCode(db, 'default', code);
      return c.html('<html><body><h2>Google Calendar connected!</h2><p>You can close this window.</p></body></html>');
    } catch (err: any) {
      return c.html(`<html><body><h2>Failed to connect</h2><p>${err.message}</p></body></html>`);
    }
  });

  router.get('/status', auth, requireHuman(), async (c) => {
    const userId = c.get('userId');
    const connected = await isCalendarConnected(db, userId);
    return c.json({ connected });
  });

  router.post('/sync', auth, requireHuman(), async (c) => {
    const userId = c.get('userId');
    const connected = await isCalendarConnected(db, userId);
    if (!connected) {
      return c.json({ error: { code: 'NOT_CONNECTED', message: 'Google Calendar not connected' } }, 400);
    }
    const result = await syncTodosToCalendar(db, userId);
    return c.json(result);
  });

  router.post('/disconnect', auth, requireHuman(), async (c) => {
    const userId = c.get('userId');
    await disconnectCalendar(db, userId);
    return c.json({ success: true });
  });

  return router;
}

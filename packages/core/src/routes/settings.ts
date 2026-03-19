import { Hono } from 'hono';
import type { Database } from '../db/index.js';
import { createAuthMiddleware, requireHuman, type AuthContext } from '../middleware/auth.js';
import * as settingsService from '../services/settings.js';

export function createSettingsRoutes(db: Database) {
  const router = new Hono<{ Variables: AuthContext }>();
  const auth = createAuthMiddleware(db);

  router.get('/:key', auth, requireHuman(), async (c) => {
    const key = c.req.param('key');
    const userId = c.get('userId');
    const value = await settingsService.getSetting(db, userId, key);
    if (value === null) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Setting not found' } }, 404);
    }
    return c.json({ key, value });
  });

  router.put('/:key', auth, requireHuman(), async (c) => {
    const key = c.req.param('key');
    const userId = c.get('userId');
    const body = await c.req.json();
    await settingsService.setSetting(db, userId, key, body.value);
    return c.json({ key, value: body.value });
  });

  return router;
}

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Database } from '../db/index.js';
import { createAuthMiddleware, type AuthContext } from '../middleware/auth.js';
import * as activityService from '../services/activity.js';
import { ActivityFeedQuerySchema } from '../types.js';

export function createActivityRoutes(db: Database) {
  const router = new Hono<{ Variables: AuthContext }>();
  const auth = createAuthMiddleware(db);

  router.get('/', auth, zValidator('query', ActivityFeedQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const userId = c.get('userId');
    const result = await activityService.getActivityFeed(db, userId, query);
    return c.json({ ...result, limit: query.limit, offset: query.offset });
  });

  return router;
}

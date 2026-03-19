import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Database } from '../db/index.js';
import { createAuthMiddleware, requireHuman, type AuthContext } from '../middleware/auth.js';
import * as tagService from '../services/tags.js';
import { CreateTagSchema, UpdateTagSchema } from '../types.js';

export function createTagRoutes(db: Database) {
  const router = new Hono<{ Variables: AuthContext }>();
  const auth = createAuthMiddleware(db);

  router.post('/', auth, requireHuman(), zValidator('json', CreateTagSchema), async (c) => {
    const input = c.req.valid('json');
    const userId = c.get('userId');
    const tag = await tagService.createTag(db, userId, input);
    return c.json(tag, 201);
  });

  router.get('/', auth, async (c) => {
    const userId = c.get('userId');
    const tags = await tagService.listTags(db, userId);
    return c.json({ tags });
  });

  router.patch('/:id', auth, requireHuman(), zValidator('json', UpdateTagSchema), async (c) => {
    const id = c.req.param('id');
    const input = c.req.valid('json');
    const userId = c.get('userId');
    const tag = await tagService.updateTag(db, userId, id, input);
    return c.json(tag);
  });

  router.delete('/:id', auth, requireHuman(), async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');
    await tagService.deleteTag(db, userId, id);
    return c.json({ success: true });
  });

  return router;
}

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Database } from '../db/index.js';
import { createAuthMiddleware, requireHuman, type AuthContext } from '../middleware/auth.js';
import * as agentService from '../services/agents.js';
import { RegisterAgentSchema } from '../types.js';

export function createAgentRoutes(db: Database) {
  const router = new Hono<{ Variables: AuthContext }>();
  const auth = createAuthMiddleware(db);

  router.post('/', auth, requireHuman(), zValidator('json', RegisterAgentSchema), async (c) => {
    const input = c.req.valid('json');
    const userId = c.get('userId');
    const { agent, apiKey } = await agentService.registerAgent(db, userId, input);
    return c.json({
      id: agent.id,
      name: agent.name,
      apiKeyPrefix: agent.apiKeyPrefix,
      permissions: agent.permissions,
      apiKey,
      createdAt: agent.createdAt,
    }, 201);
  });

  router.get('/', auth, requireHuman(), async (c) => {
    const userId = c.get('userId');
    const agents = await agentService.listAgents(db, userId);
    return c.json({ agents });
  });

  router.post('/:id/deactivate', auth, requireHuman(), async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');
    await agentService.deactivateAgent(db, userId, id);
    return c.json({ success: true });
  });

  router.post('/:id/reactivate', auth, requireHuman(), async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');
    await agentService.reactivateAgent(db, userId, id);
    return c.json({ success: true });
  });

  router.delete('/:id', auth, requireHuman(), async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');
    await agentService.deleteAgent(db, userId, id);
    return c.json({ success: true });
  });

  return router;
}

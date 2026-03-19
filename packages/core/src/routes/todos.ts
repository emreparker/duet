import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Database } from '../db/index.js';
import { createAuthMiddleware, requireHuman, requirePermission, type AuthContext } from '../middleware/auth.js';
import * as todoService from '../services/todos.js';
import { CreateTodoSchema, UpdateTodoSchema, ListTodosQuerySchema } from '../types.js';

export function createTodoRoutes(db: Database) {
  const router = new Hono<{ Variables: AuthContext }>();
  const auth = createAuthMiddleware(db);

  router.post('/', auth, requirePermission('write'), zValidator('json', CreateTodoSchema), async (c) => {
    const input = c.req.valid('json');
    const actor = c.get('actor');
    const userId = c.get('userId');
    const todo = await todoService.createTodo(db, userId, input, actor);
    return c.json(todo, 201);
  });

  router.get('/', auth, requirePermission('read'), zValidator('query', ListTodosQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const userId = c.get('userId');
    const result = await todoService.listTodos(db, userId, query);
    return c.json({ ...result, limit: query.limit, offset: query.offset });
  });

  router.get('/:id', auth, requirePermission('read'), async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');
    const todo = await todoService.getTodo(db, userId, id);
    if (!todo) return c.json({ error: { code: 'NOT_FOUND', message: 'Todo not found' } }, 404);
    return c.json(todo);
  });

  router.patch('/:id', auth, requirePermission('write'), zValidator('json', UpdateTodoSchema), async (c) => {
    const id = c.req.param('id');
    const input = c.req.valid('json');
    const actor = c.get('actor');
    const userId = c.get('userId');
    const todo = await todoService.updateTodo(db, userId, id, input, actor);
    return c.json(todo);
  });

  router.delete('/:id', auth, requireHuman(), async (c) => {
    const id = c.req.param('id');
    const actor = c.get('actor');
    const userId = c.get('userId');
    await todoService.deleteTodo(db, userId, id, actor);
    return c.json({ success: true });
  });

  return router;
}

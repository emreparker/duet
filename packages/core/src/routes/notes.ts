import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Database } from '../db/index.js';
import { createAuthMiddleware, requireHuman, requirePermission, type AuthContext } from '../middleware/auth.js';
import * as noteService from '../services/notes.js';
import { CreateNoteSchema, UpdateNoteSchema, ListNotesQuerySchema, SearchNotesQuerySchema } from '../types.js';

export function createNoteRoutes(db: Database) {
  const router = new Hono<{ Variables: AuthContext }>();
  const auth = createAuthMiddleware(db);

  router.post('/', auth, requirePermission('write'), zValidator('json', CreateNoteSchema), async (c) => {
    const input = c.req.valid('json');
    const actor = c.get('actor');
    const userId = c.get('userId');
    const note = await noteService.createNote(db, userId, input, actor);
    return c.json(note, 201);
  });

  router.get('/', auth, requirePermission('read'), zValidator('query', ListNotesQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const userId = c.get('userId');
    const result = await noteService.listNotes(db, userId, query);
    return c.json({ ...result, limit: query.limit, offset: query.offset });
  });

  router.get('/search', auth, requirePermission('read'), zValidator('query', SearchNotesQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const userId = c.get('userId');
    const result = await noteService.searchNotes(db, userId, query);
    return c.json({ ...result, limit: query.limit, offset: query.offset });
  });

  router.get('/:id', auth, requirePermission('read'), async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');
    const note = await noteService.getNote(db, userId, id);
    if (!note) return c.json({ error: { code: 'NOT_FOUND', message: 'Note not found' } }, 404);
    return c.json(note);
  });

  router.patch('/:id', auth, requirePermission('write'), zValidator('json', UpdateNoteSchema), async (c) => {
    const id = c.req.param('id');
    const input = c.req.valid('json');
    const actor = c.get('actor');
    const userId = c.get('userId');
    const note = await noteService.updateNote(db, userId, id, input, actor);
    return c.json(note);
  });

  router.post('/:id/archive', auth, requirePermission('archive'), async (c) => {
    const id = c.req.param('id');
    const actor = c.get('actor');
    const userId = c.get('userId');
    const note = await noteService.archiveNote(db, userId, id, actor);
    return c.json(note);
  });

  router.post('/:id/unarchive', auth, requirePermission('archive'), async (c) => {
    const id = c.req.param('id');
    const actor = c.get('actor');
    const userId = c.get('userId');
    const note = await noteService.unarchiveNote(db, userId, id, actor);
    return c.json(note);
  });

  router.delete('/:id', auth, requireHuman(), async (c) => {
    const id = c.req.param('id');
    const actor = c.get('actor');
    const userId = c.get('userId');
    await noteService.deleteNote(db, userId, id, actor);
    return c.json({ success: true });
  });

  router.get('/:id/versions', auth, requirePermission('read'), async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');
    const versions = await noteService.getNoteVersions(db, userId, id);
    return c.json({ versions });
  });

  router.get('/:id/versions/:versionNumber', auth, requirePermission('read'), async (c) => {
    const id = c.req.param('id');
    const versionNumber = parseInt(c.req.param('versionNumber'), 10);
    const userId = c.get('userId');
    const version = await noteService.getNoteVersion(db, userId, id, versionNumber);
    return c.json(version);
  });

  return router;
}

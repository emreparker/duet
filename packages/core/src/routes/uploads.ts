import { Hono } from 'hono';
import { createAuthMiddleware, type AuthContext } from '../middleware/auth.js';
import type { Database } from '../db/index.js';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'uploads');

export function createUploadRoutes(db: Database) {
  const router = new Hono<{ Variables: AuthContext }>();
  const auth = createAuthMiddleware(db);

  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // POST /api/uploads - upload a file
  router.post('/', auth, async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || typeof file === 'string') {
      return c.json({ error: { code: 'NO_FILE', message: 'No file provided' } }, 400);
    }

    const ext = file.name?.split('.').pop() ?? 'bin';
    const id = nanoid();
    const filename = `${id}.${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    const url = `/api/uploads/${filename}`;
    return c.json({ id, filename, url, size: buffer.length, mimeType: file.type }, 201);
  });

  // GET /api/uploads/:filename - serve a file
  router.get('/:filename', async (c) => {
    const filename = c.req.param('filename');
    const filepath = path.resolve(UPLOADS_DIR, filename);

    // Prevent directory traversal
    if (!filepath.startsWith(path.resolve(UPLOADS_DIR) + path.sep)) {
      return c.json({ error: { code: 'INVALID_PATH', message: 'Invalid filename' } }, 400);
    }

    if (!fs.existsSync(filepath)) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'File not found' } }, 404);
    }

    const buffer = fs.readFileSync(filepath);
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      txt: 'text/plain',
    };

    c.header('Content-Type', mimeTypes[ext ?? ''] ?? 'application/octet-stream');
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
    return c.body(buffer);
  });

  return router;
}

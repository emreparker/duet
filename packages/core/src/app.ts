import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Database } from './db/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRoutes } from './routes/health.js';
import { createAuthRoutes } from './routes/auth.js';
import { createNoteRoutes } from './routes/notes.js';
import { createTodoRoutes } from './routes/todos.js';
import { createTagRoutes } from './routes/tags.js';
import { createAgentRoutes } from './routes/agents.js';
import { createActivityRoutes } from './routes/activity.js';
import { createSettingsRoutes } from './routes/settings.js';
import { createCalendarRoutes } from './routes/calendar.js';
import { createUploadRoutes } from './routes/uploads.js';

export function createApp(db: Database) {
  const app = new Hono();

  // Global middleware
  app.use('/*', cors({
    origin: (origin) => origin || '*',
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }));

  // Error handler
  app.onError(errorHandler);

  // Routes
  app.route('/api/health', healthRoutes);
  app.route('/api/auth', createAuthRoutes(db));
  app.route('/api/notes', createNoteRoutes(db));
  app.route('/api/todos', createTodoRoutes(db));
  app.route('/api/tags', createTagRoutes(db));
  app.route('/api/agents', createAgentRoutes(db));
  app.route('/api/activity', createActivityRoutes(db));
  app.route('/api/settings', createSettingsRoutes(db));
  app.route('/api/calendar', createCalendarRoutes(db));
  app.route('/api/uploads', createUploadRoutes(db));

  return app;
}

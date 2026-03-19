import { serve } from '@hono/node-server';
import type { Server } from 'http';
import { createApp } from './app.js';
import { db } from './db/index.js';
import { env } from './env.js';
import { PgListener } from './realtime/pg-listener.js';
import { DuetWebSocketServer } from './realtime/ws-server.js';

const app = createApp(db);

console.log(`Duet server starting on port ${env.PORT}...`);

const httpServer = serve({
  fetch: app.fetch,
  port: env.PORT,
}, (info) => {
  console.log(`Duet server running at http://localhost:${info.port}`);
});

// Start PG Listener for real-time notifications
const pgListener = new PgListener(env.DATABASE_URL);
pgListener.start().catch((err) => {
  console.error('Failed to start PG Listener:', err);
});

// Start WebSocket server
const wsServer = new DuetWebSocketServer(httpServer as unknown as Server, pgListener, db);
console.log('WebSocket server ready at ws://localhost:' + env.PORT + '/ws');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  wsServer.close();
  await pgListener.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  wsServer.close();
  await pgListener.stop();
  process.exit(0);
});

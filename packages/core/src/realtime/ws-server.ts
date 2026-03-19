import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { PgListener, PgNotification } from './pg-listener.js';
import { agentKeys } from '../db/schema/agents.js';
import { sessions } from '../db/schema/users.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { Database } from '../db/index.js';

interface AuthenticatedSocket extends WebSocket {
  isAlive: boolean;
  actorType: string;
  actorName: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class DuetWebSocketServer {
  private wss: WebSocketServer;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private server: Server,
    private pgListener: PgListener,
    private db: Database,
  ) {
    this.wss = new WebSocketServer({
      server: this.server,
      path: '/ws',
    });

    this.setupConnectionHandler();
    this.setupPgListenerForwarding();
    this.startHeartbeat();
  }

  private setupConnectionHandler() {
    this.wss.on('connection', async (ws: AuthenticatedSocket, req) => {
      const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      const cookie = req.headers.cookie;

      let authenticated = false;

      // Try API key from query param
      if (token && token.startsWith('duet_')) {
        const prefix = token.substring(0, 12);
        const matchingAgents = await this.db.select().from(agentKeys).where(eq(agentKeys.apiKeyPrefix, prefix));
        for (const agent of matchingAgents) {
          if (!agent.isActive) continue;
          const matches = await bcrypt.compare(token, agent.apiKeyHash);
          if (matches) {
            ws.actorType = 'agent';
            ws.actorName = agent.name;
            authenticated = true;
            break;
          }
        }
      }

      // Try session cookie
      if (!authenticated && cookie) {
        const sessionMatch = cookie.match(/duet_session=([^;]+)/);
        if (sessionMatch) {
          const tokenHash = hashToken(sessionMatch[1]);
          const [session] = await this.db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash));
          if (session && session.expiresAt > new Date()) {
            const [user] = await this.db.select().from(users).where(eq(users.id, session.userId));
            if (user) {
              ws.actorType = 'human';
              ws.actorName = user.name;
              authenticated = true;
            }
          }
        }
      }

      if (!authenticated) {
        ws.close(4001, 'Authentication required');
        return;
      }

      ws.isAlive = true;
      ws.on('pong', () => { ws.isAlive = true; });
      ws.on('error', () => {});

      ws.send(JSON.stringify({
        type: 'connected',
        data: { actor: { type: ws.actorType, name: ws.actorName } },
      }));
    });
  }

  private setupPgListenerForwarding() {
    this.pgListener.on('notification', (notification: PgNotification) => {
      const message = JSON.stringify({
        type: `${notification.payload.entityType}.${notification.payload.action}`,
        data: notification.payload,
      });

      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const socket = ws as AuthenticatedSocket;
        if (!socket.isAlive) {
          socket.terminate();
          return;
        }
        socket.isAlive = false;
        socket.ping();
      });
    }, 30000);
  }

  getClientCount(): number {
    return this.wss.clients.size;
  }

  close() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.wss.close();
  }
}

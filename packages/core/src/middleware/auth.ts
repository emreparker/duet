import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import type { Database } from '../db/index.js';
import { users, sessions } from '../db/schema/users.js';
import { agentKeys } from '../db/schema/agents.js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export type AuthContext = {
  actor: {
    type: 'human' | 'agent';
    name: string;
  };
  userId: string;
  agentPermissions?: string;
};

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createAuthMiddleware(db: Database) {
  return createMiddleware<{ Variables: AuthContext }>(async (c, next) => {
    // Try API key auth first (for agents)
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const apiKey = authHeader.substring(7);
      if (!apiKey.startsWith('duet_')) {
        throw new HTTPException(401, { message: 'Invalid API key' });
      }

      const prefix = apiKey.substring(0, 12);
      const matchingAgents = await db
        .select()
        .from(agentKeys)
        .where(eq(agentKeys.apiKeyPrefix, prefix));

      for (const agent of matchingAgents) {
        if (!agent.isActive) continue;
        const matches = await bcrypt.compare(apiKey, agent.apiKeyHash);
        if (matches) {
          await db.update(agentKeys).set({ lastUsedAt: new Date() }).where(eq(agentKeys.id, agent.id));
          c.set('actor', { type: 'agent', name: agent.name });
          c.set('userId', agent.userId);
          c.set('agentPermissions', agent.permissions);
          return next();
        }
      }
      throw new HTTPException(401, { message: 'Invalid API key' });
    }

    // Try session cookie auth (for humans)
    const cookie = c.req.header('Cookie');
    if (cookie) {
      const sessionMatch = cookie.match(/duet_session=([^;]+)/);
      if (sessionMatch) {
        const tokenHash = hashToken(sessionMatch[1]);
        const [session] = await db
          .select()
          .from(sessions)
          .where(eq(sessions.tokenHash, tokenHash));

        if (session && session.expiresAt > new Date()) {
          const [user] = await db.select().from(users).where(eq(users.id, session.userId));
          if (user) {
            c.set('actor', { type: 'human', name: user.name });
            c.set('userId', user.id);
            return next();
          }
        }
      }
    }

    throw new HTTPException(401, { message: 'Authentication required' });
  });
}

export function requireHuman() {
  return createMiddleware<{ Variables: AuthContext }>(async (c, next) => {
    const actor = c.get('actor');
    if (actor.type !== 'human') {
      throw new HTTPException(403, { message: 'This action is only available to humans' });
    }
    return next();
  });
}

export function requirePermission(permission: string) {
  return createMiddleware<{ Variables: AuthContext }>(async (c, next) => {
    const actor = c.get('actor');
    if (actor.type === 'human') return next();

    const perms = c.get('agentPermissions');
    if (!perms || !perms.split(',').map((p: string) => p.trim()).includes(permission)) {
      throw new HTTPException(403, { message: `Agent does not have "${permission}" permission` });
    }
    return next();
  });
}

// ── Session helpers ──

export async function createSession(db: Database, userId: string): Promise<string> {
  const token = nanoid(48);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(sessions).values({
    id: nanoid(),
    userId,
    tokenHash,
    expiresAt,
  });

  return token;
}

export async function deleteSession(db: Database, token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

// ── Auth route helpers ──

export async function handleSetup(db: Database, password: string): Promise<{ token: string; userId: string }> {
  // Check if any user exists (self-hosted mode: first user setup)
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    throw new HTTPException(409, { message: 'Setup already complete. Use login instead.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = nanoid();

  await db.insert(users).values({
    id: userId,
    email: 'local@duet',
    name: 'Human',
    passwordHash,
  });

  const token = await createSession(db, userId);
  return { token, userId };
}

export async function handleLogin(db: Database, password: string): Promise<{ token: string; userId: string } | null> {
  // Find the user (single-user self-hosted)
  const [user] = await db
    .select()
    .from(users)
    .limit(1);

  if (!user || !user.passwordHash) return null;

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) return null;

  const token = await createSession(db, user.id);
  return { token, userId: user.id };
}

export async function isSetupComplete(db: Database): Promise<boolean> {
  const existingUsers = await db.select().from(users).limit(1);
  return existingUsers.length > 0;
}

import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import type { Database } from '../db/index.js';
import { agentKeys } from '../db/schema/agents.js';
import { NotFoundError, ConflictError } from '../errors.js';
import { logActivity } from './activity.js';
import type { RegisterAgentInput } from '../types.js';

const BCRYPT_ROUNDS = 12;
const API_KEY_PREFIX = 'duet_';

export async function registerAgent(
  db: Database,
  userId: string,
  input: RegisterAgentInput
) {
  // Check for duplicate name for this user
  const [existing] = await db.select().from(agentKeys).where(and(eq(agentKeys.userId, userId), eq(agentKeys.name, input.name)));
  if (existing) throw new ConflictError(`Agent "${input.name}" already exists`);

  const rawKey = API_KEY_PREFIX + nanoid(32);
  const keyHash = await bcrypt.hash(rawKey, BCRYPT_ROUNDS);
  const keyPrefix = rawKey.substring(0, 12); // 'duet_' + first 7 chars of nanoid

  const id = nanoid();
  const [agent] = await db.insert(agentKeys).values({
    id,
    userId,
    name: input.name,
    apiKeyHash: keyHash,
    apiKeyPrefix: keyPrefix,
    permissions: input.permissions ?? 'read,write,archive',
  }).returning();

  await logActivity(db, userId, {
    action: 'agent.registered',
    entityType: 'agent_key',
    entityId: id,
    actorType: 'human',
    actorName: 'human',
    metadata: { agentName: input.name },
  });

  // Return the plain API key - only time it's shown
  return { agent, apiKey: rawKey };
}

export async function verifyAgentKey(db: Database, userId: string, apiKey: string) {
  if (!apiKey.startsWith(API_KEY_PREFIX)) return null;

  const prefix = apiKey.substring(0, 12);

  // Find agents with matching prefix for this user
  const agents = await db
    .select()
    .from(agentKeys)
    .where(and(eq(agentKeys.userId, userId), eq(agentKeys.apiKeyPrefix, prefix)));

  for (const agent of agents) {
    if (!agent.isActive) continue;

    const matches = await bcrypt.compare(apiKey, agent.apiKeyHash);
    if (matches) {
      // Update last_used_at
      await db
        .update(agentKeys)
        .set({ lastUsedAt: new Date() })
        .where(and(eq(agentKeys.id, agent.id), eq(agentKeys.userId, userId)));

      return agent;
    }
  }

  return null;
}

export async function listAgents(db: Database, userId: string) {
  const agents = await db
    .select({
      id: agentKeys.id,
      name: agentKeys.name,
      apiKeyPrefix: agentKeys.apiKeyPrefix,
      permissions: agentKeys.permissions,
      isActive: agentKeys.isActive,
      lastUsedAt: agentKeys.lastUsedAt,
      createdAt: agentKeys.createdAt,
    })
    .from(agentKeys)
    .where(eq(agentKeys.userId, userId))
    .orderBy(agentKeys.createdAt);

  return agents;
}

export async function deactivateAgent(db: Database, userId: string, id: string) {
  const [existing] = await db.select().from(agentKeys).where(and(eq(agentKeys.id, id), eq(agentKeys.userId, userId)));
  if (!existing) throw new NotFoundError('Agent', id);

  await db
    .update(agentKeys)
    .set({ isActive: false })
    .where(and(eq(agentKeys.id, id), eq(agentKeys.userId, userId)));

  await logActivity(db, userId, {
    action: 'agent.deactivated',
    entityType: 'agent_key',
    entityId: id,
    actorType: 'human',
    actorName: 'human',
    metadata: { agentName: existing.name },
  });
}

export async function reactivateAgent(db: Database, userId: string, id: string) {
  const [existing] = await db.select().from(agentKeys).where(and(eq(agentKeys.id, id), eq(agentKeys.userId, userId)));
  if (!existing) throw new NotFoundError('Agent', id);

  await db
    .update(agentKeys)
    .set({ isActive: true })
    .where(and(eq(agentKeys.id, id), eq(agentKeys.userId, userId)));
}

export async function deleteAgent(db: Database, userId: string, id: string) {
  const [existing] = await db.select().from(agentKeys).where(and(eq(agentKeys.id, id), eq(agentKeys.userId, userId)));
  if (!existing) throw new NotFoundError('Agent', id);

  await db.delete(agentKeys).where(and(eq(agentKeys.id, id), eq(agentKeys.userId, userId)));
}

export function hasPermission(agent: { permissions: string }, permission: string): boolean {
  const perms = agent.permissions.split(',').map((p) => p.trim());
  return perms.includes(permission);
}

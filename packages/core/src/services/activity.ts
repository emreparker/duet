import { eq, and, desc, sql, count } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Database } from '../db/index.js';
import { activityLog } from '../db/schema/activity.js';
import type { ActivityFeedQuery } from '../types.js';

export async function logActivity(
  db: Database,
  userId: string,
  params: {
    action: string;
    entityType: string;
    entityId: string;
    actorType: 'human' | 'agent';
    actorName: string;
    metadata?: Record<string, unknown>;
  }
) {
  const id = nanoid();
  const [entry] = await db.insert(activityLog).values({
    id,
    userId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    actorType: params.actorType,
    actorName: params.actorName,
    metadata: params.metadata ?? null,
  }).returning();
  return entry;
}

export async function getActivityFeed(
  db: Database,
  userId: string,
  query: ActivityFeedQuery
) {
  const conditions = [];

  conditions.push(eq(activityLog.userId, userId));

  if (query.entityType) {
    conditions.push(eq(activityLog.entityType, query.entityType));
  }
  if (query.entityId) {
    conditions.push(eq(activityLog.entityId, query.entityId));
  }
  if (query.actorType) {
    conditions.push(eq(activityLog.actorType, query.actorType));
  }
  if (query.actorName) {
    conditions.push(eq(activityLog.actorName, query.actorName));
  }
  if (query.action) {
    conditions.push(eq(activityLog.action, query.action));
  }

  const where = and(...conditions);

  const [activities, [{ total }]] = await Promise.all([
    db
      .select()
      .from(activityLog)
      .where(where)
      .orderBy(desc(activityLog.createdAt))
      .limit(query.limit ?? 50)
      .offset(query.offset ?? 0),
    db
      .select({ total: count() })
      .from(activityLog)
      .where(where),
  ]);

  return { activities, total };
}

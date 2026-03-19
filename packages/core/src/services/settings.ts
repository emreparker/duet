import { eq, and } from 'drizzle-orm';
import type { Database } from '../db/index.js';
import { settings } from '../db/schema/settings.js';

export async function getSetting<T>(db: Database, userId: string, key: string): Promise<T | null> {
  const [row] = await db
    .select()
    .from(settings)
    .where(and(eq(settings.userId, userId), eq(settings.key, key)));

  if (!row) return null;
  return row.value as T;
}

export async function setSetting<T>(db: Database, userId: string, key: string, value: T): Promise<void> {
  await db
    .insert(settings)
    .values({ userId, key, value: value as never, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value: value as never, updatedAt: new Date() },
    });
}

export async function deleteSetting(db: Database, userId: string, key: string): Promise<void> {
  await db.delete(settings).where(and(eq(settings.userId, userId), eq(settings.key, key)));
}

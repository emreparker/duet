import { sql } from 'drizzle-orm';
import type { Database } from '../db/index.js';

export async function sendNotify(
  db: Database,
  channel: string,
  payload: Record<string, unknown>
) {
  try {
    const payloadStr = JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString(),
    });
    await db.execute(sql`SELECT pg_notify(${channel}, ${payloadStr})`);
  } catch {
    // Silently fail - real-time is best-effort, should not break mutations
    console.warn(`Failed to send notification on channel ${channel}`);
  }
}

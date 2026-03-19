import type { Database } from '../db/index.js';
import { users } from '../db/schema/users.js';

/**
 * Get the default user ID for single-user self-hosted mode.
 * Since Duet is a single-user app, this returns the first (and only) user's ID.
 * Throws if no user has been set up yet.
 */
export async function getDefaultUserId(db: Database): Promise<string> {
  const [user] = await db.select({ id: users.id }).from(users).limit(1);
  if (!user) {
    throw new Error('No user found. Please run setup first.');
  }
  return user.id;
}

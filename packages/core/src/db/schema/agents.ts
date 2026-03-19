import { pgTable, text, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const agentKeys = pgTable(
  'agent_keys',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    apiKeyHash: text('api_key_hash').notNull(),
    apiKeyPrefix: text('api_key_prefix').notNull(), // first 12 chars for identification
    permissions: text('permissions').notNull().default('read,write,archive'), // comma-separated
    isActive: boolean('is_active').notNull().default(true),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_agent_keys_user_name').on(table.userId, table.name),
    index('idx_agent_keys_user_id').on(table.userId),
    index('idx_agent_keys_prefix').on(table.apiKeyPrefix),
  ]
);

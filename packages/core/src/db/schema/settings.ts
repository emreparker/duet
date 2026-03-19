import { pgTable, text, timestamp, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const settings = pgTable(
  'settings',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    value: jsonb('value').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.key] }),
  ]
);

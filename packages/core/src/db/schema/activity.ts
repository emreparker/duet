import { pgTable, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const activityLog = pgTable(
  'activity_log',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    action: text('action').notNull(), // e.g. 'note.created', 'todo.completed'
    entityType: text('entity_type').notNull(), // 'note' | 'todo' | 'agent_key'
    entityId: text('entity_id').notNull(),
    actorType: text('actor_type').notNull(), // 'human' | 'agent'
    actorName: text('actor_name').notNull(),
    metadata: jsonb('metadata'), // additional context (changed fields, old values, etc.)
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_activity_log_user_id').on(table.userId),
    index('idx_activity_log_entity').on(table.entityType, table.entityId),
    index('idx_activity_log_actor').on(table.actorType, table.actorName),
    index('idx_activity_log_created_at').on(table.createdAt),
  ]
);

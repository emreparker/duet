import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { notes } from './notes.js';
import { users } from './users.js';

export const todos = pgTable(
  'todos',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    status: text('status').notNull().default('pending'), // 'pending' | 'done'
    priority: text('priority').notNull().default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
    noteId: text('note_id').references(() => notes.id, { onDelete: 'set null' }),
    authorType: text('author_type').notNull(), // 'human' | 'agent'
    authorName: text('author_name').notNull(),
    assigneeType: text('assignee_type'), // 'human' | 'agent' | null
    assigneeName: text('assignee_name'),
    dueDate: timestamp('due_date', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    calendarEventId: text('calendar_event_id'), // Google Calendar event ID
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_todos_user_id').on(table.userId),
    index('idx_todos_status').on(table.status),
    index('idx_todos_due_date').on(table.dueDate),
    index('idx_todos_note_id').on(table.noteId),
  ]
);

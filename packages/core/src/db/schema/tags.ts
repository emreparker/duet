import { pgTable, text, timestamp, primaryKey, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { notes } from './notes.js';
import { users } from './users.js';

export const tags = pgTable(
  'tags',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color'), // hex color like '#ff5733'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_tags_user_name').on(table.userId, table.name),
    index('idx_tags_user_id').on(table.userId),
  ]
);

export const noteTags = pgTable(
  'note_tags',
  {
    noteId: text('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.noteId, table.tagId] }),
  ]
);

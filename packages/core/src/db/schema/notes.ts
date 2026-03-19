import { pgTable, text, boolean, timestamp, integer, index, uniqueIndex, customType } from 'drizzle-orm/pg-core';
import { sql, type SQL } from 'drizzle-orm';
import { users } from './users.js';

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

export const notes = pgTable(
  'notes',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull().default(''),
    contentSearch: tsvector('content_search').generatedAlwaysAs(
      (): SQL => sql`to_tsvector('english', coalesce(${notes.title}, '') || ' ' || coalesce(${notes.content}, ''))`
    ),
    authorType: text('author_type').notNull(), // 'human' | 'agent'
    authorName: text('author_name').notNull().default('human'),
    isPinned: boolean('is_pinned').notNull().default(false),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_notes_content_search').using('gin', table.contentSearch),
    index('idx_notes_user_id').on(table.userId),
    index('idx_notes_author_type').on(table.authorType),
    index('idx_notes_is_archived').on(table.isArchived),
    index('idx_notes_created_at').on(table.createdAt),
  ]
);

export const noteVersions = pgTable(
  'note_versions',
  {
    id: text('id').primaryKey(),
    noteId: text('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    authorType: text('author_type').notNull(),
    authorName: text('author_name').notNull(),
    versionNumber: integer('version_number').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_note_versions_note_id').on(table.noteId),
    uniqueIndex('idx_note_versions_unique').on(table.noteId, table.versionNumber),
  ]
);

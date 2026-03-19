import { relations } from 'drizzle-orm';
import { users, sessions } from './users.js';
import { notes, noteVersions } from './notes.js';
import { todos } from './todos.js';
import { tags, noteTags } from './tags.js';
import { agentKeys } from './agents.js';
import { activityLog } from './activity.js';

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
  todos: many(todos),
  tags: many(tags),
  agentKeys: many(agentKeys),
  sessions: many(sessions),
  activityLog: many(activityLog),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const notesRelations = relations(notes, ({ one, many }) => ({
  user: one(users, { fields: [notes.userId], references: [users.id] }),
  versions: many(noteVersions),
  noteTags: many(noteTags),
  todos: many(todos),
}));

export const noteVersionsRelations = relations(noteVersions, ({ one }) => ({
  note: one(notes, { fields: [noteVersions.noteId], references: [notes.id] }),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, { fields: [todos.userId], references: [users.id] }),
  note: one(notes, { fields: [todos.noteId], references: [notes.id] }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
  noteTags: many(noteTags),
}));

export const noteTagsRelations = relations(noteTags, ({ one }) => ({
  note: one(notes, { fields: [noteTags.noteId], references: [notes.id] }),
  tag: one(tags, { fields: [noteTags.tagId], references: [tags.id] }),
}));

export const agentKeysRelations = relations(agentKeys, ({ one }) => ({
  user: one(users, { fields: [agentKeys.userId], references: [users.id] }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, { fields: [activityLog.userId], references: [users.id] }),
}));

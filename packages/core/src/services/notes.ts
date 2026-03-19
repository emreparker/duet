import { eq, and, desc, asc, sql, count, ilike } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Database } from '../db/index.js';
import { notes, noteVersions } from '../db/schema/notes.js';
import { NotFoundError, ForbiddenError } from '../errors.js';
import { logActivity } from './activity.js';
import { attachTagsToNote, getTagsByNoteId } from './tags.js';
import { sendNotify } from '../realtime/notify.js';
import type { CreateNoteInput, UpdateNoteInput, ListNotesQuery, SearchNotesQuery, Actor } from '../types.js';

async function noteWithTags(db: Database, userId: string, noteRow: typeof notes.$inferSelect) {
  const tags = await getTagsByNoteId(db, userId, noteRow.id);
  return { ...noteRow, tags };
}

export async function createNote(
  db: Database,
  userId: string,
  input: CreateNoteInput,
  actor: Actor
) {
  const id = nanoid();
  const versionId = nanoid();

  const [note] = await db.insert(notes).values({
    id,
    userId,
    title: input.title,
    content: input.content ?? '',
    authorType: actor.type,
    authorName: actor.name,
    isPinned: input.isPinned ?? false,
  }).returning();

  // Create initial version
  await db.insert(noteVersions).values({
    id: versionId,
    noteId: id,
    title: input.title,
    content: input.content ?? '',
    authorType: actor.type,
    authorName: actor.name,
    versionNumber: 1,
  });

  // Attach tags if provided
  if (input.tags && input.tags.length > 0) {
    await attachTagsToNote(db, userId, id, input.tags);
  }

  // Log activity
  await logActivity(db, userId, {
    action: 'note.created',
    entityType: 'note',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
    metadata: { title: input.title },
  });

  // Notify real-time listeners
  await sendNotify(db, 'note_changes', {
    action: 'created',
    entityType: 'note',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
  });

  return noteWithTags(db, userId, note);
}

export async function getNote(db: Database, userId: string, id: string) {
  const [note] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
  if (!note) return null;
  return noteWithTags(db, userId, note);
}

export async function listNotes(db: Database, userId: string, query: ListNotesQuery) {
  const conditions = [];

  conditions.push(eq(notes.userId, userId));
  conditions.push(eq(notes.isArchived, query.isArchived ?? false));

  if (query.authorType) {
    conditions.push(eq(notes.authorType, query.authorType));
  }
  if (query.authorName) {
    conditions.push(eq(notes.authorName, query.authorName));
  }
  if (query.isPinned !== undefined) {
    conditions.push(eq(notes.isPinned, query.isPinned));
  }

  const where = and(...conditions);

  // Handle tag filtering with a subquery approach
  let baseQuery = db.select().from(notes).where(where);

  if (query.tagName) {
    // Use raw SQL for tag filtering via join
    const tagCondition = sql`EXISTS (
      SELECT 1 FROM note_tags
      JOIN tags ON tags.id = note_tags.tag_id
      WHERE note_tags.note_id = notes.id AND tags.name = ${query.tagName}
    )`;
    baseQuery = db.select().from(notes).where(and(...conditions, tagCondition));
  }

  const sortColumn = {
    created_at: notes.createdAt,
    updated_at: notes.updatedAt,
    title: notes.title,
  }[query.sortBy ?? 'updated_at'];

  const orderFn = query.sortOrder === 'asc' ? asc : desc;

  const [noteRows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(notes)
      .where(query.tagName
        ? and(...conditions, sql`EXISTS (
            SELECT 1 FROM note_tags
            JOIN tags ON tags.id = note_tags.tag_id
            WHERE note_tags.note_id = notes.id AND tags.name = ${query.tagName}
          )`)
        : where
      )
      .orderBy(orderFn(sortColumn))
      .limit(query.limit ?? 50)
      .offset(query.offset ?? 0),
    db
      .select({ total: count() })
      .from(notes)
      .where(query.tagName
        ? and(...conditions, sql`EXISTS (
            SELECT 1 FROM note_tags
            JOIN tags ON tags.id = note_tags.tag_id
            WHERE note_tags.note_id = notes.id AND tags.name = ${query.tagName}
          )`)
        : where
      ),
  ]);

  const notesWithTags = await Promise.all(
    noteRows.map((n) => noteWithTags(db, userId, n))
  );

  return { notes: notesWithTags, total };
}

export async function updateNote(
  db: Database,
  userId: string,
  id: string,
  input: UpdateNoteInput,
  actor: Actor
) {
  const [existing] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
  if (!existing) throw new NotFoundError('Note', id);
  if (existing.isArchived) throw new ForbiddenError('Cannot update an archived note');

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const changedFields: string[] = [];

  if (input.title !== undefined && input.title !== existing.title) {
    updateData.title = input.title;
    changedFields.push('title');
  }
  if (input.content !== undefined && input.content !== existing.content) {
    updateData.content = input.content;
    changedFields.push('content');
  }
  if (input.isPinned !== undefined && input.isPinned !== existing.isPinned) {
    updateData.isPinned = input.isPinned;
    changedFields.push('isPinned');
  }

  const [updated] = await db
    .update(notes)
    .set(updateData)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();

  // Create new version if content or title changed
  if (changedFields.includes('title') || changedFields.includes('content')) {
    // Get latest version number
    const [latestVersion] = await db
      .select({ versionNumber: noteVersions.versionNumber })
      .from(noteVersions)
      .where(eq(noteVersions.noteId, id))
      .orderBy(desc(noteVersions.versionNumber))
      .limit(1);

    const nextVersion = (latestVersion?.versionNumber ?? 0) + 1;

    await db.insert(noteVersions).values({
      id: nanoid(),
      noteId: id,
      title: updated.title,
      content: updated.content,
      authorType: actor.type,
      authorName: actor.name,
      versionNumber: nextVersion,
    });
  }

  // Update tags if provided
  if (input.tags !== undefined) {
    await attachTagsToNote(db, userId, id, input.tags);
  }

  // Log activity
  if (changedFields.length > 0 || input.tags !== undefined) {
    await logActivity(db, userId, {
      action: 'note.updated',
      entityType: 'note',
      entityId: id,
      actorType: actor.type,
      actorName: actor.name,
      metadata: { title: updated.title, changedFields },
    });

    await sendNotify(db, 'note_changes', {
      action: 'updated',
      entityType: 'note',
      entityId: id,
      actorType: actor.type,
      actorName: actor.name,
    });
  }

  return noteWithTags(db, userId, updated);
}

export async function archiveNote(
  db: Database,
  userId: string,
  id: string,
  actor: Actor
) {
  const [existing] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
  if (!existing) throw new NotFoundError('Note', id);

  const [updated] = await db
    .update(notes)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();

  await logActivity(db, userId, {
    action: 'note.archived',
    entityType: 'note',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
  });

  await sendNotify(db, 'note_changes', {
    action: 'archived',
    entityType: 'note',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
  });

  return noteWithTags(db, userId, updated);
}

export async function unarchiveNote(
  db: Database,
  userId: string,
  id: string,
  actor: Actor
) {
  const [existing] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
  if (!existing) throw new NotFoundError('Note', id);

  const [updated] = await db
    .update(notes)
    .set({ isArchived: false, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();

  await logActivity(db, userId, {
    action: 'note.unarchived',
    entityType: 'note',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
  });

  await sendNotify(db, 'note_changes', {
    action: 'unarchived',
    entityType: 'note',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
  });

  return noteWithTags(db, userId, updated);
}

export async function deleteNote(
  db: Database,
  userId: string,
  id: string,
  actor: Actor
) {
  if (actor.type !== 'human') {
    throw new ForbiddenError('Only humans can delete notes');
  }

  const [existing] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
  if (!existing) throw new NotFoundError('Note', id);

  // Cascade deletes handle note_versions and note_tags
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));

  await logActivity(db, userId, {
    action: 'note.deleted',
    entityType: 'note',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
    metadata: { title: existing.title },
  });

  await sendNotify(db, 'note_changes', {
    action: 'deleted',
    entityType: 'note',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
  });
}

export async function searchNotes(db: Database, userId: string, query: SearchNotesQuery) {
  // Convert search query to tsquery format
  const searchTerms = query.q
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.replace(/[^\w]/g, ''))
    .filter(Boolean)
    .join(' & ');

  if (!searchTerms) {
    return { notes: [], total: 0 };
  }

  const tsquery = sql`to_tsquery('english', ${searchTerms})`;
  const searchCondition = sql`${notes.contentSearch} @@ ${tsquery}`;
  const notArchivedCondition = eq(notes.isArchived, false);
  const userCondition = eq(notes.userId, userId);
  const where = and(userCondition, searchCondition, notArchivedCondition);

  const [noteRows, [{ total }]] = await Promise.all([
    db
      .select({
        note: notes,
        rank: sql<number>`ts_rank(${notes.contentSearch}, ${tsquery})`.as('rank'),
      })
      .from(notes)
      .where(where)
      .orderBy(sql`rank DESC`)
      .limit(query.limit ?? 20)
      .offset(query.offset ?? 0),
    db
      .select({ total: count() })
      .from(notes)
      .where(where),
  ]);

  const notesWithTags = await Promise.all(
    noteRows.map((r) => noteWithTags(db, userId, r.note))
  );

  return { notes: notesWithTags, total };
}

export async function getNoteVersions(db: Database, userId: string, noteId: string) {
  const [existing] = await db.select().from(notes).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
  if (!existing) throw new NotFoundError('Note', noteId);

  return db
    .select()
    .from(noteVersions)
    .where(eq(noteVersions.noteId, noteId))
    .orderBy(desc(noteVersions.versionNumber));
}

export async function getNoteVersion(db: Database, userId: string, noteId: string, versionNumber: number) {
  // Verify the note belongs to this user
  const [existing] = await db.select().from(notes).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
  if (!existing) throw new NotFoundError('Note', noteId);

  const [version] = await db
    .select()
    .from(noteVersions)
    .where(
      and(
        eq(noteVersions.noteId, noteId),
        eq(noteVersions.versionNumber, versionNumber)
      )
    );

  if (!version) throw new NotFoundError('NoteVersion', `${noteId}@v${versionNumber}`);
  return version;
}

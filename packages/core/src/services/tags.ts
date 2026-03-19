import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Database } from '../db/index.js';
import { tags, noteTags } from '../db/schema/tags.js';
import { NotFoundError, ConflictError } from '../errors.js';
import type { CreateTagInput, UpdateTagInput } from '../types.js';

export async function createTag(db: Database, userId: string, input: CreateTagInput) {
  const name = input.name.toLowerCase().trim();

  // Return existing tag if it already exists for this user
  const [existing] = await db.select().from(tags).where(and(eq(tags.userId, userId), eq(tags.name, name)));
  if (existing) return existing;

  const id = nanoid();
  const [tag] = await db.insert(tags).values({
    id,
    userId,
    name,
    color: input.color ?? null,
  }).returning();

  return tag;
}

export async function listTags(db: Database, userId: string) {
  return db.select().from(tags).where(eq(tags.userId, userId)).orderBy(tags.name);
}

export async function updateTag(db: Database, userId: string, id: string, input: UpdateTagInput) {
  const [existing] = await db.select().from(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)));
  if (!existing) throw new NotFoundError('Tag', id);

  if (input.name) {
    const [dupe] = await db.select().from(tags).where(and(eq(tags.userId, userId), eq(tags.name, input.name)));
    if (dupe && dupe.id !== id) {
      throw new ConflictError(`Tag "${input.name}" already exists`);
    }
  }

  const [updated] = await db
    .update(tags)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.color !== undefined && { color: input.color }),
    })
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning();

  return updated;
}

export async function deleteTag(db: Database, userId: string, id: string) {
  const [existing] = await db.select().from(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)));
  if (!existing) throw new NotFoundError('Tag', id);

  // note_tags cascade delete handles the junction
  await db.delete(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)));
}

export async function getTagsByNoteId(db: Database, userId: string, noteId: string) {
  const rows = await db
    .select({ tag: tags })
    .from(noteTags)
    .innerJoin(tags, eq(noteTags.tagId, tags.id))
    .where(and(eq(noteTags.noteId, noteId), eq(tags.userId, userId)));

  return rows.map((r) => r.tag);
}

export async function attachTagsToNote(db: Database, userId: string, noteId: string, tagNames: string[]) {
  // Remove existing tags for this note
  await db.delete(noteTags).where(eq(noteTags.noteId, noteId));

  if (tagNames.length === 0) return;

  // Ensure all tags exist
  const tagRecords = await Promise.all(
    tagNames.map((name) => createTag(db, userId, { name }))
  );

  // Insert new associations
  await db.insert(noteTags).values(
    tagRecords.map((tag) => ({
      noteId,
      tagId: tag.id,
    }))
  );
}

export async function detachTagFromNote(db: Database, userId: string, noteId: string, tagId: string) {
  await db
    .delete(noteTags)
    .where(
      and(eq(noteTags.noteId, noteId), eq(noteTags.tagId, tagId))
    );
}

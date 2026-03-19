import { eq, and, desc, asc, sql, count, lte, gte } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Database } from '../db/index.js';
import { todos } from '../db/schema/todos.js';
import { notes } from '../db/schema/notes.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../errors.js';
import { logActivity } from './activity.js';
import { sendNotify } from '../realtime/notify.js';
import type { CreateTodoInput, UpdateTodoInput, ListTodosQuery, Actor } from '../types.js';

export async function createTodo(
  db: Database,
  userId: string,
  input: CreateTodoInput,
  actor: Actor
) {
  // Validate noteId if provided
  if (input.noteId) {
    const [note] = await db.select().from(notes).where(and(eq(notes.id, input.noteId), eq(notes.userId, userId)));
    if (!note) throw new NotFoundError('Note', input.noteId);
  }

  const id = nanoid();
  const [todo] = await db.insert(todos).values({
    id,
    userId,
    title: input.title,
    priority: input.priority ?? 'medium',
    noteId: input.noteId ?? null,
    authorType: actor.type,
    authorName: actor.name,
    assigneeType: input.assigneeType ?? null,
    assigneeName: input.assigneeName ?? null,
    dueDate: input.dueDate ?? null,
  }).returning();

  await logActivity(db, userId, {
    action: 'todo.created',
    entityType: 'todo',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
    metadata: { title: input.title },
  });

  await sendNotify(db, 'todo_changes', {
    action: 'created',
    entityType: 'todo',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
  });

  return todo;
}

export async function getTodo(db: Database, userId: string, id: string) {
  const [todo] = await db.select().from(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));
  if (!todo) return null;
  return todo;
}

export async function listTodos(db: Database, userId: string, query: ListTodosQuery) {
  const conditions = [];

  conditions.push(eq(todos.userId, userId));

  if (query.status) {
    conditions.push(eq(todos.status, query.status));
  }
  if (query.priority) {
    conditions.push(eq(todos.priority, query.priority));
  }
  if (query.assigneeType) {
    conditions.push(eq(todos.assigneeType, query.assigneeType));
  }
  if (query.assigneeName) {
    conditions.push(eq(todos.assigneeName, query.assigneeName));
  }
  if (query.noteId) {
    conditions.push(eq(todos.noteId, query.noteId));
  }
  if (query.dueBefore) {
    conditions.push(lte(todos.dueDate, query.dueBefore));
  }
  if (query.dueAfter) {
    conditions.push(gte(todos.dueDate, query.dueAfter));
  }

  const where = and(...conditions);

  const sortColumn = {
    created_at: todos.createdAt,
    due_date: todos.dueDate,
    priority: todos.priority,
    status: todos.status,
  }[query.sortBy ?? 'created_at'];

  const orderFn = query.sortOrder === 'asc' ? asc : desc;

  const [todoRows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(todos)
      .where(where)
      .orderBy(orderFn(sortColumn))
      .limit(query.limit ?? 50)
      .offset(query.offset ?? 0),
    db
      .select({ total: count() })
      .from(todos)
      .where(where),
  ]);

  return { todos: todoRows, total };
}

export async function updateTodo(
  db: Database,
  userId: string,
  id: string,
  input: UpdateTodoInput,
  actor: Actor
) {
  const [existing] = await db.select().from(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));
  if (!existing) throw new NotFoundError('Todo', id);

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const changedFields: string[] = [];
  let isCompleting = false;

  if (input.title !== undefined) {
    updateData.title = input.title;
    changedFields.push('title');
  }
  if (input.status !== undefined) {
    updateData.status = input.status;
    changedFields.push('status');

    if (input.status === 'done' && existing.status !== 'done') {
      updateData.completedAt = new Date();
      isCompleting = true;
    } else if (input.status !== 'done' && existing.status === 'done') {
      updateData.completedAt = null;
    }
  }
  if (input.priority !== undefined) {
    updateData.priority = input.priority;
    changedFields.push('priority');
  }
  if (input.assigneeType !== undefined) {
    updateData.assigneeType = input.assigneeType;
    changedFields.push('assignee');
  }
  if (input.assigneeName !== undefined) {
    updateData.assigneeName = input.assigneeName;
  }
  if (input.dueDate !== undefined) {
    updateData.dueDate = input.dueDate;
    changedFields.push('dueDate');
  }

  const [updated] = await db
    .update(todos)
    .set(updateData)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();

  const action = isCompleting ? 'todo.completed' : 'todo.updated';

  await logActivity(db, userId, {
    action,
    entityType: 'todo',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
    metadata: { title: updated.title, changedFields },
  });

  await sendNotify(db, 'todo_changes', {
    action: isCompleting ? 'completed' : 'updated',
    entityType: 'todo',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
  });

  return updated;
}

export async function deleteTodo(
  db: Database,
  userId: string,
  id: string,
  actor: Actor
) {
  if (actor.type !== 'human') {
    throw new ForbiddenError('Only humans can delete todos');
  }

  const [existing] = await db.select().from(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));
  if (!existing) throw new NotFoundError('Todo', id);

  await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));

  await logActivity(db, userId, {
    action: 'todo.deleted',
    entityType: 'todo',
    entityId: id,
    actorType: actor.type,
    actorName: actor.name,
    metadata: { title: existing.title },
  });
}

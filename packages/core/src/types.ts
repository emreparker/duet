import { z } from 'zod';

// ── Actor Types ──

export const ActorType = z.enum(['human', 'agent']);
export type ActorType = z.infer<typeof ActorType>;

export const ActorSchema = z.object({
  type: ActorType,
  name: z.string(),
});
export type Actor = z.infer<typeof ActorSchema>;

// ── Notes ──

export const CreateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().default(''),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional().default(false),
});
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;

export const UpdateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  isPinned: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;

export const ListNotesQuerySchema = z.object({
  authorType: ActorType.optional(),
  authorName: z.string().optional(),
  tagName: z.string().optional(),
  isArchived: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional().default(false),
  isPinned: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'title']).optional().default('updated_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
export type ListNotesQuery = z.infer<typeof ListNotesQuerySchema>;

export const SearchNotesQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
export type SearchNotesQuery = z.infer<typeof SearchNotesQuerySchema>;

// ── Todos ──

export const TodoStatus = z.enum(['pending', 'in_progress', 'done']);
export type TodoStatus = z.infer<typeof TodoStatus>;

export const TodoPriority = z.enum(['low', 'medium', 'high', 'urgent']);
export type TodoPriority = z.infer<typeof TodoPriority>;

export const CreateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  priority: TodoPriority.optional().default('medium'),
  noteId: z.string().optional(),
  assigneeType: ActorType.optional(),
  assigneeName: z.string().optional(),
  dueDate: z.coerce.date().optional(),
});
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;

export const UpdateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  status: TodoStatus.optional(),
  priority: TodoPriority.optional(),
  assigneeType: ActorType.nullable().optional(),
  assigneeName: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
});
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;

export const ListTodosQuerySchema = z.object({
  status: TodoStatus.optional(),
  priority: TodoPriority.optional(),
  assigneeType: ActorType.optional(),
  assigneeName: z.string().optional(),
  noteId: z.string().optional(),
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
  sortBy: z.enum(['created_at', 'due_date', 'priority', 'status']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
export type ListTodosQuery = z.infer<typeof ListTodosQuerySchema>;

// ── Tags ──

export const CreateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').transform((s) => s.toLowerCase().trim()),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex color like #ff5733').optional(),
});
export type CreateTagInput = z.infer<typeof CreateTagSchema>;

export const UpdateTagSchema = z.object({
  name: z.string().min(1).transform((s) => s.toLowerCase().trim()).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
});
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;

// ── Agents ──

export const RegisterAgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required').max(64),
  permissions: z.string().optional().default('read,write,archive'),
});
export type RegisterAgentInput = z.infer<typeof RegisterAgentSchema>;

// ── Activity ──

export const ActivityFeedQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  actorType: ActorType.optional(),
  actorName: z.string().optional(),
  action: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
export type ActivityFeedQuery = z.infer<typeof ActivityFeedQuerySchema>;

// ── Auth ──

export const LoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const SetupSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

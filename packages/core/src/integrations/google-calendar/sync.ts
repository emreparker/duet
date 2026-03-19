import type { Database } from '../../db/index.js';
import { getAuthenticatedClient } from './auth.js';
import { getCalendarClient, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from './client.js';
import { todos } from '../../db/schema/todos.js';
import { eq, and, isNotNull, isNull } from 'drizzle-orm';

export interface SyncResult {
  created: number;
  updated: number;
  removed: number;
  errors: string[];
}

/**
 * Syncs todos with due dates to Google Calendar.
 * - Todos with due dates and no calendar_event_id → create event
 * - Todos with due dates and existing calendar_event_id → update event
 * - Completed todos with calendar_event_id → optionally keep/remove
 */
export async function syncTodosToCalendar(db: Database, userId: string): Promise<SyncResult> {
  const result: SyncResult = { created: 0, updated: 0, removed: 0, errors: [] };

  const oauth2Client = await getAuthenticatedClient(db, userId);
  if (!oauth2Client) {
    result.errors.push('Google Calendar not connected');
    return result;
  }

  const calendar = getCalendarClient(oauth2Client);

  // Get all todos with due dates
  const todosWithDueDates = await db
    .select()
    .from(todos)
    .where(and(eq(todos.userId, userId), isNotNull(todos.dueDate)));

  for (const todo of todosWithDueDates) {
    try {
      if (!todo.dueDate) continue;

      if (!todo.calendarEventId) {
        // Create new calendar event
        const eventId = await createCalendarEvent(calendar, {
          title: todo.title,
          description: `Priority: ${todo.priority}\nStatus: ${todo.status}\nCreated by: ${todo.authorType}:${todo.authorName}`,
          startDate: todo.dueDate,
          authorType: todo.authorType,
          authorName: todo.authorName,
        });

        // Save event ID to todo
        await db
          .update(todos)
          .set({ calendarEventId: eventId })
          .where(eq(todos.id, todo.id));

        result.created++;
      } else {
        // Update existing event
        await updateCalendarEvent(calendar, todo.calendarEventId, {
          title: todo.title,
          description: `Priority: ${todo.priority}\nStatus: ${todo.status}\nCreated by: ${todo.authorType}:${todo.authorName}`,
          startDate: todo.dueDate,
        });

        result.updated++;
      }
    } catch (err: any) {
      result.errors.push(`Failed to sync todo ${todo.id}: ${err.message}`);
    }
  }

  // Remove calendar events for completed todos (optional cleanup)
  const completedWithEvents = await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.userId, userId),
        eq(todos.status, 'done'),
        isNotNull(todos.calendarEventId)
      )
    );

  for (const todo of completedWithEvents) {
    try {
      if (todo.calendarEventId) {
        await deleteCalendarEvent(calendar, todo.calendarEventId);
        await db
          .update(todos)
          .set({ calendarEventId: null })
          .where(eq(todos.id, todo.id));
        result.removed++;
      }
    } catch (err: any) {
      // Event might already be deleted
      if (err.code === 410 || err.code === 404) {
        await db
          .update(todos)
          .set({ calendarEventId: null })
          .where(eq(todos.id, todo.id));
      } else {
        result.errors.push(`Failed to remove event for todo ${todo.id}: ${err.message}`);
      }
    }
  }

  return result;
}

let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoSync(db: Database, userId: string, intervalMs: number = 15 * 60 * 1000) {
  if (syncInterval) return;
  syncInterval = setInterval(async () => {
    try {
      const result = await syncTodosToCalendar(db, userId);
      if (result.created > 0 || result.updated > 0 || result.removed > 0) {
        console.log(`Calendar sync: ${result.created} created, ${result.updated} updated, ${result.removed} removed`);
      }
      if (result.errors.length > 0) {
        console.warn('Calendar sync errors:', result.errors);
      }
    } catch (err) {
      console.error('Calendar auto-sync failed:', err);
    }
  }, intervalMs);
  console.log(`Calendar auto-sync started (every ${intervalMs / 60000} minutes)`);
}

export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

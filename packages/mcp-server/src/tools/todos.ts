import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { todoService, type Database } from '@noteduet/core';

export function registerTodoTools(server: McpServer, db: Database, userId: string, agentName: string) {
  const actor = { type: 'agent' as const, name: agentName };

  server.tool(
    'create_todo',
    'Create a new todo item',
    {
      title: z.string().describe('The todo title/description'),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().describe('Priority level'),
      dueDate: z.string().optional().describe('Due date in ISO format (e.g., 2026-03-20)'),
      noteId: z.string().optional().describe('Link to a note by ID'),
      assigneeType: z.enum(['human', 'agent']).optional().describe('Assign to human or agent'),
      assigneeName: z.string().optional().describe('Name of the assignee'),
    },
    async ({ title, priority, dueDate, noteId, assigneeType, assigneeName }) => {
      const todo = await todoService.createTodo(db, userId, {
        title,
        priority: priority as any,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        noteId,
        assigneeType,
        assigneeName,
      }, actor);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(todo, null, 2) }],
      };
    }
  );

  server.tool(
    'list_todos',
    'List todos with optional filters',
    {
      status: z.enum(['pending', 'in_progress', 'done']).optional().describe('Filter by status'),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().describe('Filter by priority'),
      limit: z.number().optional().describe('Max results (default 20)'),
    },
    async ({ status, priority, limit }) => {
      const result = await todoService.listTodos(db, userId, {
        status: status as any,
        priority: priority as any,
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: limit ?? 20,
        offset: 0,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'update_todo',
    'Update a todo item',
    {
      todoId: z.string().describe('The ID of the todo to update'),
      title: z.string().optional().describe('New title'),
      status: z.enum(['pending', 'in_progress', 'done']).optional().describe('New status'),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().describe('New priority'),
      dueDate: z.string().optional().describe('New due date in ISO format'),
    },
    async ({ todoId, title, status, priority, dueDate }) => {
      const todo = await todoService.updateTodo(db, userId, todoId, {
        title,
        status: status as any,
        priority: priority as any,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      }, actor);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(todo, null, 2) }],
      };
    }
  );

  server.tool(
    'complete_todo',
    'Mark a todo as completed',
    {
      todoId: z.string().describe('The ID of the todo to complete'),
    },
    async ({ todoId }) => {
      const todo = await todoService.updateTodo(db, userId, todoId, {
        status: 'done',
      }, actor);
      return {
        content: [{ type: 'text' as const, text: `Todo completed: ${todo.title}` }],
      };
    }
  );
}

import { Command } from 'commander';
import { createDb, todoService, userService } from '@noteduet/core';
import { getDbUrl } from '../config.js';
import * as out from '../output.js';

export function createTodoCommand() {
  const todo = new Command('todo').description('Manage todos');

  todo
    .command('add')
    .description('Create a new todo')
    .argument('<title>', 'Todo title')
    .option('-p, --priority <priority>', 'Priority: low, medium, high, urgent', 'medium')
    .option('--due <date>', 'Due date (YYYY-MM-DD)')
    .option('--assign <assignee>', 'Assign to (human, agent:name)')
    .option('--note-id <noteId>', 'Link to a note')
    .option('--json', 'Output as JSON')
    .action(async (title, opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);

      let assigneeType: 'human' | 'agent' | undefined;
      let assigneeName: string | undefined;
      if (opts.assign) {
        if (opts.assign === 'human') {
          assigneeType = 'human';
          assigneeName = 'human';
        } else if (opts.assign.startsWith('agent:')) {
          assigneeType = 'agent';
          assigneeName = opts.assign.substring(6);
        }
      }

      const t = await todoService.createTodo(db, userId, {
        title,
        priority: opts.priority as any,
        dueDate: opts.due ? new Date(opts.due) : undefined,
        assigneeType,
        assigneeName,
        noteId: opts.noteId,
      }, { type: 'human', name: 'human' });

      if (opts.json) {
        out.json(t);
      } else {
        out.success(`Todo created: ${t.id}`);
        console.log(`  Title: ${t.title}`);
        console.log(`  Priority: ${t.priority}`);
        if (t.dueDate) console.log(`  Due: ${new Date(t.dueDate).toLocaleDateString()}`);
      }
      process.exit(0);
    });

  todo
    .command('list')
    .description('List todos')
    .option('-s, --status <status>', 'Filter by status: pending, in_progress, done')
    .option('-p, --priority <priority>', 'Filter by priority')
    .option('--due-before <date>', 'Due before date (YYYY-MM-DD)')
    .option('--limit <n>', 'Limit results', '20')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);

      const result = await todoService.listTodos(db, userId, {
        status: opts.status as any,
        priority: opts.priority as any,
        dueBefore: opts.dueBefore ? new Date(opts.dueBefore) : undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: parseInt(opts.limit),
        offset: 0,
      });

      if (opts.json) {
        out.json(result);
      } else {
        console.log(`\n  Todos (${result.total} total)\n`);
        out.table(result.todos.map((t) => ({
          id: t.id.substring(0, 8),
          title: t.title.substring(0, 40),
          status: t.status,
          priority: t.priority,
          due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-',
          author: `${t.authorType}:${t.authorName}`,
        })), ['id', 'title', 'status', 'priority', 'due', 'author']);
      }
      process.exit(0);
    });

  todo
    .command('done')
    .description('Mark a todo as completed')
    .argument('<id>', 'Todo ID')
    .action(async (id) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      const updated = await todoService.updateTodo(db, userId, id, {
        status: 'done',
      }, { type: 'human', name: 'human' });
      out.success(`Todo completed: ${updated.title}`);
      process.exit(0);
    });

  todo
    .command('update')
    .description('Update a todo')
    .argument('<id>', 'Todo ID')
    .option('-t, --title <title>', 'New title')
    .option('-s, --status <status>', 'New status: pending, in_progress, done')
    .option('-p, --priority <priority>', 'New priority')
    .option('--due <date>', 'New due date (YYYY-MM-DD)')
    .action(async (id, opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      const updated = await todoService.updateTodo(db, userId, id, {
        title: opts.title,
        status: opts.status as any,
        priority: opts.priority as any,
        dueDate: opts.due ? new Date(opts.due) : undefined,
      }, { type: 'human', name: 'human' });
      out.success(`Todo updated: ${updated.title}`);
      process.exit(0);
    });

  todo
    .command('delete')
    .description('Delete a todo')
    .argument('<id>', 'Todo ID')
    .option('-f, --force', 'Skip confirmation')
    .action(async (id, opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);

      if (!opts.force) {
        const t = await todoService.getTodo(db, userId, id);
        if (!t) {
          out.error(`Todo not found: ${id}`);
          process.exit(1);
        }
        console.log(`  Deleting: "${t.title}" (${id})`);
        out.info('Use --force to confirm deletion');
        process.exit(0);
      }

      await todoService.deleteTodo(db, userId, id, { type: 'human', name: 'human' });
      out.success(`Todo deleted: ${id}`);
      process.exit(0);
    });

  return todo;
}

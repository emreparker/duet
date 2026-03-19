import { Command } from 'commander';
import { createDb, noteService, userService } from '@noteduet/core';
import { getDbUrl } from '../config.js';
import * as out from '../output.js';

export function createNoteCommand() {
  const note = new Command('note').description('Manage notes');

  note
    .command('add')
    .description('Create a new note')
    .argument('[content]', 'Note content (or pipe from stdin)')
    .option('-t, --title <title>', 'Note title')
    .option('--tag <tags...>', 'Tags to attach')
    .option('--json', 'Output as JSON')
    .action(async (contentArg, opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      let content = contentArg ?? '';

      // Read from stdin if no content argument and stdin is piped
      if (!content && !process.stdin.isTTY) {
        content = await new Promise<string>((resolve) => {
          let data = '';
          process.stdin.on('data', (chunk) => { data += chunk; });
          process.stdin.on('end', () => resolve(data));
        });
      }

      const title = opts.title ?? (content.split('\n')[0]?.substring(0, 100) || 'Untitled');

      const n = await noteService.createNote(db, userId, {
        title,
        content,
        tags: opts.tag,
        isPinned: false,
      }, { type: 'human', name: 'human' });

      if (opts.json) {
        out.json(n);
      } else {
        out.success(`Note created: ${n.id}`);
        console.log(`  Title: ${n.title}`);
        if ((n as any).tags?.length > 0) {
          console.log(`  Tags: ${(n as any).tags.map((t: any) => t.name).join(', ')}`);
        }
      }
      process.exit(0);
    });

  note
    .command('list')
    .description('List notes')
    .option('--by <author>', 'Filter by author (human, agent:name)')
    .option('--tag <tag>', 'Filter by tag name')
    .option('--archived', 'Show archived notes')
    .option('--limit <n>', 'Limit results', '20')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);

      let authorType: 'human' | 'agent' | undefined;
      let authorName: string | undefined;
      if (opts.by) {
        if (opts.by === 'human') {
          authorType = 'human';
        } else if (opts.by.startsWith('agent:')) {
          authorType = 'agent';
          authorName = opts.by.substring(6);
        }
      }

      const result = await noteService.listNotes(db, userId, {
        authorType,
        authorName,
        tagName: opts.tag,
        isArchived: !!opts.archived,
        sortBy: 'updated_at',
        sortOrder: 'desc',
        limit: parseInt(opts.limit),
        offset: 0,
      });

      if (opts.json) {
        out.json(result);
      } else {
        console.log(`\n  Notes (${result.total} total)\n`);
        out.table(result.notes.map((n: any) => ({
          id: n.id.substring(0, 8),
          title: n.title.substring(0, 40),
          author: `${n.authorType}:${n.authorName}`,
          tags: n.tags?.map((t: any) => t.name).join(',') || '',
          updated: new Date(n.updatedAt).toLocaleDateString(),
        })), ['id', 'title', 'author', 'tags', 'updated']);
      }
      process.exit(0);
    });

  note
    .command('view')
    .description('View a note')
    .argument('<id>', 'Note ID')
    .action(async (id) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      const n = await noteService.getNote(db, userId, id);
      if (!n) {
        out.error(`Note not found: ${id}`);
        process.exit(1);
      }

      console.log(`\n  ── ${n.title} ──`);
      console.log(`  ID: ${n.id}`);
      console.log(`  Author: ${n.authorType}:${n.authorName}`);
      console.log(`  Created: ${n.createdAt}`);
      console.log(`  Updated: ${n.updatedAt}`);
      if ((n as any).tags?.length > 0) {
        console.log(`  Tags: ${(n as any).tags.map((t: any) => t.name).join(', ')}`);
      }
      console.log(`  Pinned: ${n.isPinned} | Archived: ${n.isArchived}`);
      console.log(`\n${n.content}\n`);
      process.exit(0);
    });

  note
    .command('edit')
    .description('Edit a note')
    .argument('<id>', 'Note ID')
    .option('-t, --title <title>', 'New title')
    .option('-c, --content <content>', 'New content')
    .option('--tag <tags...>', 'Replace tags')
    .action(async (id, opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      const updated = await noteService.updateNote(db, userId, id, {
        title: opts.title,
        content: opts.content,
        tags: opts.tag,
      }, { type: 'human', name: 'human' });

      out.success(`Note updated: ${updated.title}`);
      process.exit(0);
    });

  note
    .command('search')
    .description('Search notes')
    .argument('<query>', 'Search query')
    .option('--limit <n>', 'Limit results', '10')
    .option('--json', 'Output as JSON')
    .action(async (query, opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      const result = await noteService.searchNotes(db, userId, {
        q: query,
        limit: parseInt(opts.limit),
        offset: 0,
      });

      if (opts.json) {
        out.json(result);
      } else {
        console.log(`\n  Search results for "${query}" (${result.total} found)\n`);
        out.table(result.notes.map((n: any) => ({
          id: n.id.substring(0, 8),
          title: n.title.substring(0, 50),
          author: `${n.authorType}:${n.authorName}`,
        })), ['id', 'title', 'author']);
      }
      process.exit(0);
    });

  note
    .command('archive')
    .description('Archive a note')
    .argument('<id>', 'Note ID')
    .action(async (id) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      await noteService.archiveNote(db, userId, id, { type: 'human', name: 'human' });
      out.success(`Note archived: ${id}`);
      process.exit(0);
    });

  note
    .command('unarchive')
    .description('Unarchive a note')
    .argument('<id>', 'Note ID')
    .action(async (id) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      await noteService.unarchiveNote(db, userId, id, { type: 'human', name: 'human' });
      out.success(`Note unarchived: ${id}`);
      process.exit(0);
    });

  note
    .command('delete')
    .description('Delete a note permanently')
    .argument('<id>', 'Note ID')
    .option('-f, --force', 'Skip confirmation')
    .action(async (id, opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);

      if (!opts.force) {
        const n = await noteService.getNote(db, userId, id);
        if (!n) {
          out.error(`Note not found: ${id}`);
          process.exit(1);
        }
        console.log(`  Deleting: "${n.title}" (${id})`);
        out.info('Use --force to confirm deletion');
        process.exit(0);
      }

      await noteService.deleteNote(db, userId, id, { type: 'human', name: 'human' });
      out.success(`Note deleted: ${id}`);
      process.exit(0);
    });

  note
    .command('history')
    .description('Show version history')
    .argument('<id>', 'Note ID')
    .action(async (id) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      const versions = await noteService.getNoteVersions(db, userId, id);

      console.log(`\n  Version history for note ${id.substring(0, 8)}\n`);
      out.table(versions.map((v) => ({
        version: `v${v.versionNumber}`,
        author: `${v.authorType}:${v.authorName}`,
        date: new Date(v.createdAt).toLocaleString(),
      })), ['version', 'author', 'date']);
      process.exit(0);
    });

  return note;
}

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { noteService, type Database } from '@noteduet/core';

export function registerNoteTools(server: McpServer, db: Database, userId: string, agentName: string) {
  const actor = { type: 'agent' as const, name: agentName };

  server.tool(
    'create_note',
    'Create a new note in Duet',
    {
      title: z.string().describe('The title of the note'),
      content: z.string().describe('The markdown content of the note'),
      tags: z.array(z.string()).optional().describe('Optional tags to attach'),
    },
    async ({ title, content, tags }) => {
      const note = await noteService.createNote(db, userId, { title, content, tags, isPinned: false }, actor);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(note, null, 2) }],
      };
    }
  );

  server.tool(
    'read_note',
    'Read a specific note by ID',
    {
      noteId: z.string().describe('The ID of the note to read'),
    },
    async ({ noteId }) => {
      const note = await noteService.getNote(db, userId, noteId);
      if (!note) {
        return {
          content: [{ type: 'text' as const, text: `Note not found: ${noteId}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(note, null, 2) }],
      };
    }
  );

  server.tool(
    'update_note',
    'Update an existing note\'s title, content, or tags',
    {
      noteId: z.string().describe('The ID of the note to update'),
      title: z.string().optional().describe('New title'),
      content: z.string().optional().describe('New markdown content'),
      tags: z.array(z.string()).optional().describe('New tags (replaces existing)'),
    },
    async ({ noteId, title, content, tags }) => {
      const note = await noteService.updateNote(db, userId, noteId, { title, content, tags }, actor);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(note, null, 2) }],
      };
    }
  );

  server.tool(
    'list_notes',
    'List notes with optional filters',
    {
      authorType: z.enum(['human', 'agent']).optional().describe('Filter by author type'),
      authorName: z.string().optional().describe('Filter by author name'),
      tagName: z.string().optional().describe('Filter by tag name'),
      limit: z.number().optional().describe('Max number of notes to return (default 20)'),
      offset: z.number().optional().describe('Offset for pagination'),
    },
    async ({ authorType, authorName, tagName, limit, offset }) => {
      const result = await noteService.listNotes(db, userId, {
        authorType,
        authorName,
        tagName,
        isArchived: false,
        sortBy: 'updated_at',
        sortOrder: 'desc',
        limit: limit ?? 20,
        offset: offset ?? 0,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'search_notes',
    'Full-text search across all notes',
    {
      query: z.string().describe('Search query'),
      limit: z.number().optional().describe('Max results (default 10)'),
    },
    async ({ query, limit }) => {
      const result = await noteService.searchNotes(db, userId, {
        q: query,
        limit: limit ?? 10,
        offset: 0,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'archive_note',
    'Archive a note (soft delete). Note: agents cannot hard-delete notes.',
    {
      noteId: z.string().describe('The ID of the note to archive'),
    },
    async ({ noteId }) => {
      const note = await noteService.archiveNote(db, userId, noteId, actor);
      return {
        content: [{ type: 'text' as const, text: `Note archived: ${note.title}` }],
      };
    }
  );

  server.tool(
    'get_note_history',
    'Get version history of a note',
    {
      noteId: z.string().describe('The ID of the note'),
    },
    async ({ noteId }) => {
      const versions = await noteService.getNoteVersions(db, userId, noteId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(versions, null, 2) }],
      };
    }
  );
}

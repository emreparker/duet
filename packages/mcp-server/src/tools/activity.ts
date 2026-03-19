import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { activityService, type Database } from '@noteduet/core';

export function registerActivityTools(server: McpServer, db: Database, userId: string) {
  server.tool(
    'get_activity_feed',
    'Get recent activity feed showing all actions in Duet',
    {
      limit: z.number().optional().describe('Max entries to return (default 20)'),
      entityType: z.string().optional().describe('Filter by entity type (note, todo)'),
      actorName: z.string().optional().describe('Filter by actor name'),
    },
    async ({ limit, entityType, actorName }) => {
      const result = await activityService.getActivityFeed(db, userId, {
        limit: limit ?? 20,
        offset: 0,
        entityType,
        actorName,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}

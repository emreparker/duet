#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createDb, userService } from '@noteduet/core';
import { getConfig } from './config.js';
import { registerNoteTools } from './tools/notes.js';
import { registerTodoTools } from './tools/todos.js';
import { registerActivityTools } from './tools/activity.js';

const config = getConfig();
const db = createDb(config.databaseUrl);

// Connect via stdio transport
async function main() {
  const userId = await userService.getDefaultUserId(db);

  const server = new McpServer({
    name: 'duet',
    version: '0.1.0',
  });

  // Register all tools
  registerNoteTools(server, db, userId, config.agentName);
  registerTodoTools(server, db, userId, config.agentName);
  registerActivityTools(server, db, userId);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server is now running, communicating via stdin/stdout
}

main().catch((err) => {
  console.error('Failed to start Duet MCP server:', err);
  process.exit(1);
});

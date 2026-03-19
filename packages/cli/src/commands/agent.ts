import { Command } from 'commander';
import { createDb, agentService, userService } from '@noteduet/core';
import { getDbUrl } from '../config.js';
import * as out from '../output.js';

export function createAgentCommand() {
  const agent = new Command('agent').description('Manage AI agent access');

  agent
    .command('add')
    .description('Register a new agent')
    .argument('<name>', 'Agent name')
    .option('--permissions <perms>', 'Comma-separated permissions', 'read,write,archive')
    .action(async (name, opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      const { agent: a, apiKey } = await agentService.registerAgent(db, userId, {
        name,
        permissions: opts.permissions,
      });

      out.success(`Agent registered: ${a.name}`);
      console.log('');
      console.log(`  API Key: ${apiKey}`);
      console.log('');
      console.log('  ⚠ Save this key - it will not be shown again!');
      console.log(`  Permissions: ${a.permissions}`);
      process.exit(0);
    });

  agent
    .command('list')
    .description('List all registered agents')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      const agents = await agentService.listAgents(db, userId);

      if (opts.json) {
        out.json(agents);
      } else {
        console.log(`\n  Agents (${agents.length})\n`);
        out.table(agents.map((a) => ({
          id: a.id.substring(0, 8),
          name: a.name,
          prefix: a.apiKeyPrefix,
          permissions: a.permissions,
          active: a.isActive ? 'yes' : 'no',
          lastUsed: a.lastUsedAt ? new Date(a.lastUsedAt).toLocaleDateString() : 'never',
        })), ['id', 'name', 'prefix', 'permissions', 'active', 'lastUsed']);
      }
      process.exit(0);
    });

  agent
    .command('deactivate')
    .description('Deactivate an agent')
    .argument('<id>', 'Agent ID or name')
    .action(async (id) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      await agentService.deactivateAgent(db, userId, id);
      out.success(`Agent deactivated: ${id}`);
      process.exit(0);
    });

  agent
    .command('reactivate')
    .description('Reactivate an agent')
    .argument('<id>', 'Agent ID')
    .action(async (id) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      await agentService.reactivateAgent(db, userId, id);
      out.success(`Agent reactivated: ${id}`);
      process.exit(0);
    });

  agent
    .command('delete')
    .description('Delete an agent')
    .argument('<id>', 'Agent ID')
    .option('-f, --force', 'Skip confirmation')
    .action(async (id, opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);
      if (!opts.force) {
        out.info(`Use --force to confirm deletion of agent ${id}`);
        process.exit(0);
      }
      await agentService.deleteAgent(db, userId, id);
      out.success(`Agent deleted: ${id}`);
      process.exit(0);
    });

  return agent;
}

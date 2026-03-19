import { Command } from 'commander';
import { createDb, activityService, userService } from '@noteduet/core';
import { getDbUrl } from '../config.js';
import * as out from '../output.js';

export function createActivityCommand() {
  const activity = new Command('activity')
    .description('View activity feed')
    .option('--limit <n>', 'Number of entries', '20')
    .option('--actor <actor>', 'Filter by actor (human, agent:name)')
    .option('--type <type>', 'Filter by entity type (note, todo)')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      const db = createDb(getDbUrl());
      const userId = await userService.getDefaultUserId(db);

      let actorType: 'human' | 'agent' | undefined;
      let actorName: string | undefined;
      if (opts.actor) {
        if (opts.actor === 'human') {
          actorType = 'human';
        } else if (opts.actor.startsWith('agent:')) {
          actorType = 'agent';
          actorName = opts.actor.substring(6);
        }
      }

      const result = await activityService.getActivityFeed(db, userId, {
        actorType,
        actorName,
        entityType: opts.type,
        limit: parseInt(opts.limit),
        offset: 0,
      });

      if (opts.json) {
        out.json(result);
      } else {
        console.log(`\n  Activity Feed (${result.total} total)\n`);
        out.table(result.activities.map((a) => ({
          action: a.action,
          entity: `${a.entityType}:${a.entityId.substring(0, 8)}`,
          actor: `${a.actorType}:${a.actorName}`,
          time: new Date(a.createdAt).toLocaleString(),
        })), ['action', 'entity', 'actor', 'time']);
      }
      process.exit(0);
    });

  return activity;
}

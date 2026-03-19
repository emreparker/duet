#!/usr/bin/env node
import { Command } from 'commander';
import { createNoteCommand } from './commands/note.js';
import { createTodoCommand } from './commands/todo.js';
import { createAgentCommand } from './commands/agent.js';
import { createActivityCommand } from './commands/activity.js';

const program = new Command();

program
  .name('duet')
  .description('Duet - Human + Agent Collaborative Note-Taking')
  .version('0.1.0');

program.addCommand(createNoteCommand());
program.addCommand(createTodoCommand());
program.addCommand(createAgentCommand());
program.addCommand(createActivityCommand());

program.parse();

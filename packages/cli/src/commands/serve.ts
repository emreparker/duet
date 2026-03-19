import { Command } from 'commander';

export function createServeCommand() {
  return new Command('serve')
    .description('Start the Duet API server')
    .option('-p, --port <port>', 'Port number', '7777')
    .action(async (opts) => {
      process.env.PORT = opts.port;
      // Dynamically import the server to use the configured port
      await import('@noteduet/core/server');
    });
}

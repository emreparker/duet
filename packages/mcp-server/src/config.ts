import fs from 'fs';
import path from 'path';
import os from 'os';

interface McpConfig {
  databaseUrl: string;
  agentName: string;
  apiKey: string;
  apiUrl?: string; // For remote mode
}

export function getConfig(): McpConfig {
  // Environment variables take priority
  const databaseUrl = process.env.DUET_DATABASE_URL ?? process.env.DATABASE_URL;
  const agentName = process.env.DUET_AGENT_NAME ?? 'mcp-agent';
  const apiKey = process.env.DUET_API_KEY ?? '';
  const apiUrl = process.env.DUET_API_URL;

  // Fallback to config file
  if (!databaseUrl) {
    const configPath = path.join(os.homedir(), '.duet', 'config.json');
    try {
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(raw);
        return {
          databaseUrl: config.databaseUrl ?? 'postgresql://localhost:5432/duet_dev',
          agentName,
          apiKey,
          apiUrl,
        };
      }
    } catch {
      // Fall through
    }
  }

  return {
    databaseUrl: databaseUrl ?? 'postgresql://localhost:5432/duet_dev',
    agentName,
    apiKey,
    apiUrl,
  };
}

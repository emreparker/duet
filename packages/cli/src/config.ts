import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.duet');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface DuetConfig {
  databaseUrl: string;
  port: number;
}

const DEFAULT_CONFIG: DuetConfig = {
  databaseUrl: 'postgresql://localhost:5432/duet_dev',
  port: 7777,
};

export function getConfig(): DuetConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // Fall through to defaults
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: Partial<DuetConfig>): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const current = getConfig();
  const merged = { ...current, ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2) + '\n');
}

export function getDbUrl(): string {
  return process.env.DATABASE_URL ?? getConfig().databaseUrl;
}

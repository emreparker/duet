const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  get DATABASE_URL() {
    return getEnv('DATABASE_URL', 'postgresql://localhost:5432/duet_dev');
  },
  get PORT() {
    return parseInt(getEnv('PORT', '7777'), 10);
  },
  get SESSION_SECRET() {
    return getEnv('SESSION_SECRET', 'duet-dev-secret-change-in-production');
  },
  get NODE_ENV() {
    return getEnv('NODE_ENV', 'development');
  },
  get APP_URL() {
    return process.env.APP_URL ?? `http://localhost:${this.PORT}`;
  },
  // Google Calendar API
  get GOOGLE_CLIENT_ID() {
    return process.env.GOOGLE_CLIENT_ID ?? '';
  },
  get GOOGLE_CLIENT_SECRET() {
    return process.env.GOOGLE_CLIENT_SECRET ?? '';
  },
  get GOOGLE_REDIRECT_URI() {
    return process.env.GOOGLE_REDIRECT_URI ?? `${this.APP_URL}/api/calendar/callback`;
  },
};

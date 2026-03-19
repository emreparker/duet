import { google } from 'googleapis';
import { env } from '../../env.js';
import type { Database } from '../../db/index.js';
import { getSetting, setSetting, deleteSetting } from '../../services/settings.js';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  token_type: string;
}

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

export async function exchangeCode(db: Database, userId: string, code: string): Promise<void> {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  const storedTokens: StoredTokens = {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token!,
    expiry_date: tokens.expiry_date!,
    token_type: tokens.token_type!,
  };

  await setSetting(db, userId, 'google_calendar_tokens', storedTokens);
}

export async function getAuthenticatedClient(db: Database, userId: string) {
  const tokens = await getSetting<StoredTokens>(db, userId, 'google_calendar_tokens');
  if (!tokens) return null;

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
    token_type: tokens.token_type,
  });

  oauth2Client.on('tokens', async (newTokens) => {
    const updated: StoredTokens = {
      access_token: newTokens.access_token ?? tokens.access_token,
      refresh_token: newTokens.refresh_token ?? tokens.refresh_token,
      expiry_date: newTokens.expiry_date ?? tokens.expiry_date,
      token_type: newTokens.token_type ?? tokens.token_type,
    };
    await setSetting(db, userId, 'google_calendar_tokens', updated);
  });

  return oauth2Client;
}

export async function isCalendarConnected(db: Database, userId: string): Promise<boolean> {
  const tokens = await getSetting<StoredTokens>(db, userId, 'google_calendar_tokens');
  return tokens !== null;
}

export async function disconnectCalendar(db: Database, userId: string): Promise<void> {
  await deleteSetting(db, userId, 'google_calendar_tokens');
}

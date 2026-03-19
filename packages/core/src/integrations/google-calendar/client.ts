import { google, type calendar_v3 } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

export function getCalendarClient(auth: OAuth2Client): calendar_v3.Calendar {
  return google.calendar({ version: 'v3', auth });
}

export async function createCalendarEvent(
  calendar: calendar_v3.Calendar,
  event: {
    title: string;
    description?: string;
    startDate: Date;
    authorType: string;
    authorName: string;
  }
): Promise<string> {
  const prefix = event.authorType === 'agent' ? `[Agent: ${event.authorName}] ` : '';

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `[Duet] ${prefix}${event.title}`,
      description: event.description ?? '',
      start: {
        date: event.startDate.toISOString().split('T')[0],
      },
      end: {
        date: event.startDate.toISOString().split('T')[0],
      },
      reminders: {
        useDefault: true,
      },
    },
  });

  return response.data.id!;
}

export async function updateCalendarEvent(
  calendar: calendar_v3.Calendar,
  eventId: string,
  updates: {
    title?: string;
    description?: string;
    startDate?: Date;
  }
): Promise<void> {
  const updateBody: calendar_v3.Schema$Event = {};

  if (updates.title) {
    updateBody.summary = `[Duet] ${updates.title}`;
  }
  if (updates.description) {
    updateBody.description = updates.description;
  }
  if (updates.startDate) {
    updateBody.start = { date: updates.startDate.toISOString().split('T')[0] };
    updateBody.end = { date: updates.startDate.toISOString().split('T')[0] };
  }

  await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody: updateBody,
  });
}

export async function deleteCalendarEvent(
  calendar: calendar_v3.Calendar,
  eventId: string
): Promise<void> {
  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });
}

export async function listCalendarEvents(
  calendar: calendar_v3.Calendar,
  timeMin: Date,
  timeMax: Date
): Promise<calendar_v3.Schema$Event[]> {
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    q: '[Duet]', // Only get Duet-created events
  });

  return response.data.items ?? [];
}

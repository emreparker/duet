import postgres from 'postgres';
import { EventEmitter } from 'events';

export interface PgNotification {
  channel: string;
  payload: Record<string, unknown>;
}

export class PgListener extends EventEmitter {
  private sql: ReturnType<typeof postgres>;
  private channels: string[];
  private connected = false;

  constructor(databaseUrl: string, channels: string[] = ['note_changes', 'todo_changes']) {
    super();
    this.channels = channels;
    this.sql = postgres(databaseUrl, {
      // Dedicated connection for LISTEN - not pooled
      max: 1,
    });
  }

  async start() {
    if (this.connected) return;

    try {
      for (const channel of this.channels) {
        await this.sql.listen(channel, (payload) => {
          try {
            const data = JSON.parse(payload);
            this.emit('notification', { channel, payload: data } as PgNotification);
            this.emit(channel, data);
          } catch {
            console.warn(`Failed to parse notification payload on ${channel}:`, payload);
          }
        });
      }
      this.connected = true;
      console.log(`PG Listener started on channels: ${this.channels.join(', ')}`);
    } catch (err) {
      console.error('Failed to start PG Listener:', err);
      // Retry after 5 seconds
      setTimeout(() => this.start(), 5000);
    }
  }

  async stop() {
    if (!this.connected) return;
    this.connected = false;
    await this.sql.end();
    console.log('PG Listener stopped');
  }
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  useEffect(() => {
    api.calendar.status().then((r) => setCalendarConnected(r.connected)).catch(() => {});
  }, []);

  const handleCalendarConnect = async () => {
    try {
      const { url } = await api.calendar.authUrl();
      window.open(url, "_blank", "width=500,height=600");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCalendarSync = async () => {
    setSyncing(true);
    try {
      const result = await api.calendar.sync();
      setSyncResult(result);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleCalendarDisconnect = async () => {
    await api.calendar.disconnect();
    setCalendarConnected(false);
  };

  const handleLogout = async () => {
    await api.auth.logout();
    router.replace("/login");
  };

  return (
    <div className="h-screen overflow-y-auto bg-cream">
      <div className="max-w-[640px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* Google Calendar */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-1">Google Calendar</h2>
          <p className="text-sm text-ink-muted mb-4">Sync todos with due dates to your Google Calendar.</p>

          <div className="bg-cream-mid/50 border border-border-light rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${calendarConnected ? "bg-human" : "bg-cream-dark"}`} />
                <span className="text-sm font-medium">
                  {calendarConnected ? "Connected" : "Not connected"}
                </span>
              </div>
              {calendarConnected ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleCalendarSync}
                    disabled={syncing}
                    className="px-3 py-1.5 text-xs font-medium bg-ink text-cream rounded-md hover:bg-ink-light transition-colors disabled:opacity-50"
                  >
                    {syncing ? "Syncing..." : "Sync now"}
                  </button>
                  <button
                    onClick={handleCalendarDisconnect}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCalendarConnect}
                  className="px-3 py-1.5 text-xs font-medium bg-ink text-cream rounded-md hover:bg-ink-light transition-colors"
                >
                  Connect Google Calendar
                </button>
              )}
            </div>
            {syncResult && (
              <div className="mt-3 text-xs text-ink-muted bg-cream-deep rounded-lg p-3">
                Sync complete: {syncResult.created} created, {syncResult.updated} updated, {syncResult.removed} removed
                {syncResult.errors?.length > 0 && (
                  <div className="text-red-600 mt-1">{syncResult.errors.join(", ")}</div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* MCP Server Info */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-1">MCP Server</h2>
          <p className="text-sm text-ink-muted mb-4">Configure AI agents to connect to Duet.</p>

          <div className="bg-cream-mid/50 border border-border-light rounded-xl p-5">
            <p className="text-xs text-ink-muted mb-3">Add this to your MCP client configuration:</p>
            <pre className="text-[11px] font-mono text-ink-muted bg-cream-deep rounded-lg p-4 overflow-x-auto">{JSON.stringify({
              mcpServers: {
                duet: {
                  command: "npx",
                  args: ["@noteduet/mcp-server"],
                  env: {
                    DUET_DATABASE_URL: "postgresql://...",
                    DUET_AGENT_NAME: "your-agent-name",
                    DUET_API_KEY: "duet_xxxxx"
                  }
                }
              }
            }, null, 2)}</pre>
          </div>
        </section>

        {/* About */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-1">About</h2>
          <div className="bg-cream-mid/50 border border-border-light rounded-xl p-5 text-sm text-ink-muted">
            <div className="flex items-center gap-0 mb-2">
              <span className="text-lg font-light text-amber">{"["}</span>
              <span className="text-sm font-bold text-ink">duet</span>
              <span className="text-lg font-light text-amber">{"]"}</span>
              <span className="text-xs text-ink-faint ml-2">v0.1.0</span>
            </div>
            <p>Human + Agent Collaborative Note-Taking</p>
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

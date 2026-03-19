"use client";

import { useEffect, useState, useCallback } from "react";
import * as api from "@/lib/api";

const ACTION_CONFIG: Record<string, { verb: string; icon: string }> = {
  "note.created": { verb: "created", icon: "📝" },
  "note.updated": { verb: "edited", icon: "✏️" },
  "note.archived": { verb: "archived", icon: "📦" },
  "note.unarchived": { verb: "restored", icon: "📂" },
  "note.deleted": { verb: "deleted", icon: "🗑️" },
  "todo.created": { verb: "added", icon: "☑️" },
  "todo.updated": { verb: "updated", icon: "📋" },
  "todo.completed": { verb: "completed", icon: "✅" },
  "todo.deleted": { verb: "deleted", icon: "🗑️" },
  "agent.registered": { verb: "registered", icon: "🤖" },
  "agent.deactivated": { verb: "deactivated", icon: "⏸️" },
};

interface EnrichedActivity {
  key: string;
  action: string;
  actorType: string;
  actorName: string;
  entityType: string;
  entityId: string;
  count: number;
  title: string | null;
  lastAt: string;
}

function groupActivities(raw: any[]): EnrichedActivity[] {
  const groups: EnrichedActivity[] = [];
  for (const a of raw) {
    const prev = groups[groups.length - 1];
    if (
      prev &&
      prev.action === a.action &&
      prev.actorType === a.actorType &&
      prev.actorName === a.actorName &&
      prev.entityId === a.entityId
    ) {
      prev.count++;
    } else {
      groups.push({
        key: a.id,
        action: a.action,
        actorType: a.actorType,
        actorName: a.actorName,
        entityType: a.entityType,
        entityId: a.entityId,
        count: 1,
        title: a.metadata?.title ?? a.metadata?.agentName ?? null,
        lastAt: a.createdAt,
      });
    }
  }
  return groups;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityPage() {
  const [grouped, setGrouped] = useState<EnrichedActivity[]>([]);

  const load = useCallback(async () => {
    try {
      const result = await api.activity.feed({ limit: 100 });
      const groups = groupActivities(result.activities);

      // Enrich: fetch titles for entries that don't have them
      const enriched = await Promise.all(
        groups.map(async (g) => {
          if (g.title) return g;
          // Try to fetch the entity to get its title
          try {
            if (g.entityType === "note") {
              const note = await api.notes.get(g.entityId);
              return { ...g, title: note?.title ?? null };
            }
            if (g.entityType === "todo") {
              const todo = await api.todos.get(g.entityId);
              return { ...g, title: todo?.title ?? null };
            }
          } catch {
            // Entity might be deleted
          }
          return g;
        })
      );

      setGrouped(enriched);
    } catch (err) {
      console.error("Failed to load activity:", err);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="h-screen overflow-y-auto bg-cream">
      <div className="max-w-[600px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Activity</h1>

        <div>
          {grouped.map((g) => {
            const config = ACTION_CONFIG[g.action] ?? { verb: g.action, icon: "•" };
            const author = g.actorType === "human" ? "You" : g.actorName;
            const isAgent = g.actorType === "agent";
            const entityLabel = g.entityType === "agent_key" ? "agent" : g.entityType;

            return (
              <div
                key={g.key}
                className="py-2.5 border-b border-border-light text-[13px] leading-relaxed"
              >
                <span className="mr-1.5">{config.icon}</span>
                <span className={`font-semibold ${isAgent ? "text-agent-text" : "text-ink"}`}>
                  {author}
                </span>
                {" "}
                <span className="text-ink-muted">{config.verb}</span>
                {" "}
                {g.title ? (
                  <>
                    <span className="text-ink-muted">{entityLabel}</span>
                    {" "}
                    <span className="font-medium text-ink">&ldquo;{g.title}&rdquo;</span>
                  </>
                ) : (
                  <span className="text-ink-muted">a {entityLabel}</span>
                )}
                {g.count > 1 && (
                  <span className="text-ink-faint text-xs ml-0.5">({g.count}x)</span>
                )}
                <span className="text-ink-faint text-[11px] ml-2">{formatTime(g.lastAt)}</span>
              </div>
            );
          })}
          {grouped.length === 0 && (
            <div className="text-center py-12 text-ink-faint text-sm">No activity yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

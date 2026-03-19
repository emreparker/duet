"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import * as api from "@/lib/api";

export default function AgentsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-cream text-ink-faint text-sm">Loading...</div>}>
      <AgentsContent />
    </Suspense>
  );
}

function AgentsContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const [agents, setAgents] = useState<any[]>([]);
  const [agentActivity, setAgentActivity] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await api.agents.list();
      setAgents(result.agents);
    } catch (err) {
      console.error("Failed to load agents:", err);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Load activity for selected agent
  const selectedAgent = agents.find((a) => a.id === selectedId);
  useEffect(() => {
    if (selectedAgent) {
      api.activity.feed({ actorType: "agent", actorName: selectedAgent.name, limit: 20 })
        .then((r) => setAgentActivity(r.activities))
        .catch(() => {});
    }
  }, [selectedAgent]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const result = await api.agents.register({ name: newName });
      setNewApiKey(result.apiKey);
      setNewName("");
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggle = async (agent: any) => {
    if (agent.isActive) {
      await api.agents.deactivate(agent.id);
    } else {
      await api.agents.reactivate(agent.id);
    }
    load();
  };

  // If an agent is selected, show detail view
  if (selectedAgent) {
    return (
      <div className="h-screen overflow-y-auto bg-cream">
        <div className="max-w-[640px] mx-auto px-6 py-8">
          <Link href="/agents" className="text-xs text-ink-faint hover:text-ink mb-4 inline-block">&larr; All agents</Link>

          <div className="flex items-center gap-3 mb-6">
            <div className={`w-3 h-3 rounded-full ${selectedAgent.isActive ? "bg-agent" : "bg-cream-dark"}`} />
            <h1 className="text-2xl font-bold">{selectedAgent.name}</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${selectedAgent.isActive ? "bg-agent-bg text-agent-text" : "bg-cream-deep text-ink-faint"}`}>
              {selectedAgent.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Details */}
          <div className="bg-cream-mid/50 border border-border-light rounded-xl p-5 mb-6">
            <div className="grid grid-cols-[120px_1fr] gap-y-3 text-[13px]">
              <span className="text-ink-faint">API Key</span>
              <span className="font-mono text-ink-muted">{selectedAgent.apiKeyPrefix}...</span>

              <span className="text-ink-faint">Permissions</span>
              <div className="flex gap-1.5">
                {selectedAgent.permissions.split(",").map((p: string) => (
                  <span key={p} className="text-xs bg-cream-deep px-2 py-0.5 rounded font-medium text-ink-muted">{p.trim()}</span>
                ))}
              </div>

              <span className="text-ink-faint">Registered</span>
              <span className="text-ink-muted">{new Date(selectedAgent.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>

              <span className="text-ink-faint">Last used</span>
              <span className="text-ink-muted">{selectedAgent.lastUsedAt ? new Date(selectedAgent.lastUsedAt).toLocaleString() : "Never"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => handleToggle(selectedAgent)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                selectedAgent.isActive
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-human-bg text-human-text hover:bg-green-100"
              }`}
            >
              {selectedAgent.isActive ? "Deactivate" : "Reactivate"}
            </button>
            <Link
              href={`/notes?author=agent:${selectedAgent.name}`}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-cream-deep text-ink-muted hover:text-ink transition-all"
            >
              View notes by this agent
            </Link>
          </div>

          {/* Recent activity */}
          <h2 className="text-base font-semibold mb-3">Recent Activity</h2>
          <div>
            {agentActivity.length > 0 ? agentActivity.map((a) => (
              <div key={a.id} className="py-2 border-b border-border-light text-[13px]">
                <span className="text-ink-muted">{a.action.replace(".", " ")}</span>
                {a.metadata?.title && (
                  <span className="font-medium text-ink ml-1">&ldquo;{a.metadata.title}&rdquo;</span>
                )}
                <span className="text-ink-faint text-[11px] ml-2">
                  {new Date(a.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )) : (
              <div className="text-sm text-ink-faint py-4">No activity from this agent yet</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: list all agents
  return (
    <div className="h-screen overflow-y-auto bg-cream">
      <div className="max-w-[640px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Agents</h1>
            <p className="text-sm text-ink-muted mt-1">Manage AI agent access to your notes</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setNewApiKey(null); }}
            className="px-4 py-2 bg-ink text-cream text-sm font-medium rounded-lg hover:bg-ink-light transition-colors"
          >
            + Register Agent
          </button>
        </div>

        {/* Register form */}
        {showForm && (
          <div className="bg-cream-mid border border-border rounded-xl p-5 mb-6">
            {newApiKey ? (
              <div>
                <h3 className="text-sm font-semibold text-human-text mb-2">Agent registered!</h3>
                <p className="text-xs text-ink-muted mb-3">Copy this API key now - it won't be shown again.</p>
                <div className="bg-cream border border-border rounded-lg p-3 font-mono text-xs break-all select-all">
                  {newApiKey}
                </div>
                <div className="mt-4 p-3 bg-cream-deep rounded-lg">
                  <p className="text-xs font-medium text-ink-muted mb-2">MCP Configuration:</p>
                  <pre className="text-[11px] text-ink-muted font-mono overflow-x-auto">{JSON.stringify({
                    mcpServers: {
                      duet: {
                        command: "npx",
                        args: ["@noteduet/mcp-server"],
                        env: {
                          DUET_DATABASE_URL: "postgresql://...",
                          DUET_AGENT_NAME: agents[agents.length - 1]?.name ?? "agent",
                          DUET_API_KEY: newApiKey,
                        }
                      }
                    }
                  }, null, 2)}</pre>
                </div>
                <button
                  onClick={() => { setShowForm(false); setNewApiKey(null); }}
                  className="mt-3 text-xs text-ink-muted hover:text-ink"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Agent name (e.g. claude, openclaw)"
                  className="flex-1 px-3 py-2.5 text-sm bg-cream border border-border rounded-lg outline-none focus:border-amber focus:ring-2 focus:ring-amber-bg placeholder:text-ink-faint"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-ink text-cream text-sm font-medium rounded-lg hover:bg-ink-light transition-colors"
                >
                  Register
                </button>
              </form>
            )}
          </div>
        )}

        {/* Agent list */}
        <div className="space-y-2">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents?id=${agent.id}`}
              className="flex items-center gap-4 px-5 py-4 bg-cream-mid/50 border border-border-light rounded-xl hover:border-amber/30 transition-all block"
            >
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${agent.isActive ? "bg-agent" : "bg-cream-dark"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{agent.name}</div>
                <div className="text-xs text-ink-faint mt-0.5 flex items-center gap-3">
                  <span>Key: {agent.apiKeyPrefix}...</span>
                  <span>Permissions: {agent.permissions}</span>
                  {agent.lastUsedAt && (
                    <span>Last used: {new Date(agent.lastUsedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); handleToggle(agent); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  agent.isActive
                    ? "bg-cream-deep text-ink-muted hover:bg-red-50 hover:text-red-600"
                    : "bg-human-bg text-human-text hover:bg-green-100"
                }`}
              >
                {agent.isActive ? "Deactivate" : "Reactivate"}
              </button>
            </Link>
          ))}
          {agents.length === 0 && (
            <div className="text-center py-12 text-ink-faint text-sm">
              <p>No agents registered</p>
              <p className="text-xs mt-1">Register an agent to let AI collaborate on your notes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

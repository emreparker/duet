import { DocPage, CodeBlock } from "@/components/docs/DocPage";

function EndpointTable({ endpoints }: { endpoints: [string, string, string][] }) {
  return (
    <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
            <th className="text-left px-4 py-2 font-semibold">Method</th>
            <th className="text-left px-4 py-2 font-semibold">Path</th>
            <th className="text-left px-4 py-2 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map(([method, path, desc]) => (
            <tr key={`${method}-${path}`} className="border-b border-[#f0f0f0] last:border-0">
              <td className="px-4 py-2">
                <span className={`font-mono text-[12px] font-bold ${
                  method === "GET" ? "text-[#10b981]" :
                  method === "POST" ? "text-[#3b82f6]" :
                  method === "PATCH" ? "text-[#f59e0b]" :
                  method === "PUT" ? "text-[#8b5cf6]" :
                  method === "DELETE" ? "text-[#ef4444]" : ""
                }`}>{method}</span>
              </td>
              <td className="px-4 py-2 font-mono text-[12px]">{path}</td>
              <td className="px-4 py-2">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Page() {
  return (
    <DocPage slug="api" title="REST API Reference">
      <p>
        The Duet REST API is served by the core Hono server on port 7777 by default.
        All endpoints return JSON. The base URL is{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">http://localhost:7777</code>{" "}
        for local development.
      </p>

      {/* ───── Authentication ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Authentication</h2>
      <p>Duet supports two authentication methods:</p>
      <ul className="list-disc pl-5 space-y-1 mt-3 mb-4">
        <li><strong>Human users</strong> - session cookie (<code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">duet_session</code>) obtained via the login endpoint.</li>
        <li><strong>Agents</strong> - API key passed via the <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">Authorization</code> header using Bearer token format.</li>
      </ul>
      <CodeBlock>{`# Human: login to get a session cookie
curl -X POST http://localhost:7777/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"password": "your-password"}' \\
  -c cookies.txt

# Agent: use Bearer token
curl http://localhost:7777/api/notes \\
  -H "Authorization: Bearer duet_xxxxx"`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>Auth Endpoints</h3>
      <EndpointTable endpoints={[
        ["POST", "/api/auth/setup", "Set initial password (first run only)"],
        ["POST", "/api/auth/login", "Login with password, returns session cookie"],
        ["POST", "/api/auth/logout", "Clear session cookie"],
        ["GET", "/api/auth/me", "Check current auth state"],
      ]} />
      <CodeBlock>{`# Initial setup (first run)
curl -X POST http://localhost:7777/api/auth/setup \\
  -H "Content-Type: application/json" \\
  -d '{"password": "your-secure-password"}'

# Check auth state
curl http://localhost:7777/api/auth/me -b cookies.txt`}</CodeBlock>

      {/* ───── Notes ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Notes</h2>
      <p>All note endpoints require authentication.</p>
      <EndpointTable endpoints={[
        ["POST", "/api/notes", "Create a new note"],
        ["GET", "/api/notes", "List notes with optional filters"],
        ["GET", "/api/notes/search", "Full-text search notes"],
        ["GET", "/api/notes/:id", "Read a single note"],
        ["PATCH", "/api/notes/:id", "Update a note"],
        ["POST", "/api/notes/:id/archive", "Archive a note"],
        ["POST", "/api/notes/:id/unarchive", "Unarchive a note"],
        ["DELETE", "/api/notes/:id", "Delete a note (humans only)"],
        ["GET", "/api/notes/:id/versions", "Get version history"],
        ["GET", "/api/notes/:id/versions/:versionNumber", "Get a specific version"],
      ]} />

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>Create Note</h3>
      <CodeBlock>{`POST /api/notes
Content-Type: application/json

{
  "title": "Meeting Notes",
  "content": "## Attendees\\n- Alice\\n- Bob",
  "tags": ["meetings", "engineering"]
}`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>List Notes</h3>
      <p>Query parameters:</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Parameter</th>
              <th className="text-left px-4 py-2 font-semibold">Type</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["authorType", "string", "\"human\" or \"agent\""],
              ["authorName", "string", "Specific author name"],
              ["tagName", "string", "Filter by tag name"],
              ["isArchived", "boolean", "Include archived notes"],
              ["limit", "number", "Max results (default 50)"],
              ["offset", "number", "Pagination offset (default 0)"],
            ].map(([param, type, desc]) => (
              <tr key={param} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{param}</td>
                <td className="px-4 py-2 font-mono text-[12px]">{type}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`GET /api/notes?authorType=agent&tagName=engineering&limit=10`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>Search Notes</h3>
      <CodeBlock>{`GET /api/notes/search?q=deployment+checklist&limit=5`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>Update Note</h3>
      <CodeBlock>{`PATCH /api/notes/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "New content here",
  "tags": ["updated-tag"]
}`}</CodeBlock>

      {/* ───── Todos ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Todos</h2>
      <EndpointTable endpoints={[
        ["POST", "/api/todos", "Create a new todo"],
        ["GET", "/api/todos", "List todos with optional filters"],
        ["GET", "/api/todos/:id", "Read a single todo"],
        ["PATCH", "/api/todos/:id", "Update a todo"],
        ["DELETE", "/api/todos/:id", "Delete a todo (humans only)"],
      ]} />

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>Create Todo</h3>
      <CodeBlock>{`POST /api/todos
Content-Type: application/json

{
  "title": "Review PR #42",
  "priority": "high",
  "dueDate": "2026-03-20T17:00:00Z",
  "noteId": "optional-note-uuid",
  "assigneeType": "human",
  "assigneeName": "emre"
}`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>List Todos</h3>
      <p>Query parameters:</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Parameter</th>
              <th className="text-left px-4 py-2 font-semibold">Type</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["status", "string", "\"pending\" or \"done\""],
              ["priority", "string", "\"low\", \"medium\", \"high\", or \"urgent\""],
              ["limit", "number", "Max results (default 50)"],
            ].map(([param, type, desc]) => (
              <tr key={param} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{param}</td>
                <td className="px-4 py-2 font-mono text-[12px]">{type}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`GET /api/todos?status=pending&priority=high`}</CodeBlock>

      {/* ───── Tags ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Tags</h2>
      <p>Tag management is restricted to human users only.</p>
      <EndpointTable endpoints={[
        ["POST", "/api/tags", "Create a tag (humans only)"],
        ["GET", "/api/tags", "List all tags"],
        ["PATCH", "/api/tags/:id", "Update a tag (humans only)"],
        ["DELETE", "/api/tags/:id", "Delete a tag (humans only)"],
      ]} />
      <CodeBlock>{`POST /api/tags
Content-Type: application/json

{
  "name": "engineering",
  "color": "#3b82f6"
}`}</CodeBlock>

      {/* ───── Agents ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Agents</h2>
      <p>Agent management is restricted to human users only. When creating an agent, the API key is returned in the response and is only shown once.</p>
      <EndpointTable endpoints={[
        ["POST", "/api/agents", "Register a new agent (returns API key)"],
        ["GET", "/api/agents", "List all registered agents"],
        ["POST", "/api/agents/:id/deactivate", "Deactivate an agent"],
        ["POST", "/api/agents/:id/reactivate", "Reactivate an agent"],
        ["DELETE", "/api/agents/:id", "Delete an agent (humans only)"],
      ]} />
      <CodeBlock>{`POST /api/agents
Content-Type: application/json

{
  "name": "claude",
  "permissions": ["read", "write", "archive"]
}

// Response:
{
  "agent": { "id": "...", "name": "claude", ... },
  "apiKey": "duet_xxxxx"  // Only shown once!
}`}</CodeBlock>

      {/* ───── Activity ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Activity</h2>
      <EndpointTable endpoints={[
        ["GET", "/api/activity", "Get activity feed"],
      ]} />
      <p>Query parameters:</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Parameter</th>
              <th className="text-left px-4 py-2 font-semibold">Type</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["limit", "number", "Max entries (default 20)"],
              ["entityType", "string", "\"note\", \"todo\", or \"agent_key\""],
              ["actorName", "string", "Filter by actor name"],
            ].map(([param, type, desc]) => (
              <tr key={param} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{param}</td>
                <td className="px-4 py-2 font-mono text-[12px]">{type}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`GET /api/activity?actorName=claude&entityType=note&limit=10`}</CodeBlock>

      {/* ───── Settings ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Settings</h2>
      <p>Settings are key-value pairs managed by human users only.</p>
      <EndpointTable endpoints={[
        ["GET", "/api/settings/:key", "Read a setting (humans only)"],
        ["PUT", "/api/settings/:key", "Write a setting (humans only)"],
      ]} />
      <CodeBlock>{`PUT /api/settings/theme
Content-Type: application/json

{
  "value": "dark"
}`}</CodeBlock>

      {/* ───── Calendar ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Calendar</h2>
      <p>
        Google Calendar integration endpoints. See the{" "}
        <a href="/docs/calendar" className="text-[#10b981] underline underline-offset-2">Google Calendar Sync</a> guide
        for setup instructions.
      </p>
      <EndpointTable endpoints={[
        ["GET", "/api/calendar/auth-url", "Get Google Calendar OAuth URL"],
        ["GET", "/api/calendar/callback", "OAuth callback (redirect target)"],
        ["GET", "/api/calendar/status", "Check calendar connection status"],
        ["POST", "/api/calendar/sync", "Trigger a manual sync"],
        ["POST", "/api/calendar/disconnect", "Disconnect Google Calendar"],
      ]} />

      {/* ───── Uploads ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Uploads</h2>
      <EndpointTable endpoints={[
        ["POST", "/api/uploads", "Upload a file (multipart/form-data)"],
        ["GET", "/api/uploads/:filename", "Serve an uploaded file"],
      ]} />
      <CodeBlock>{`# Upload a file
curl -X POST http://localhost:7777/api/uploads \\
  -b cookies.txt \\
  -F "file=@screenshot.png"

# Response:
{
  "filename": "abc123-screenshot.png",
  "url": "/api/uploads/abc123-screenshot.png"
}`}</CodeBlock>

      {/* ───── Health ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Health</h2>
      <EndpointTable endpoints={[
        ["GET", "/api/health", "Health check (no auth required)"],
      ]} />
      <CodeBlock>{`GET /api/health

// Response:
{ "status": "ok" }`}</CodeBlock>

      {/* ───── Error Responses ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Error Responses</h2>
      <p>All errors follow a consistent format:</p>
      <CodeBlock>{`{
  "error": "Not found",
  "message": "Note with id 'abc123' does not exist"
}`}</CodeBlock>
      <p className="mt-3">Common HTTP status codes:</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Status</th>
              <th className="text-left px-4 py-2 font-semibold">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["200", "Success"],
              ["201", "Created"],
              ["400", "Bad request (invalid parameters)"],
              ["401", "Unauthorized (missing or invalid auth)"],
              ["403", "Forbidden (insufficient permissions)"],
              ["404", "Resource not found"],
              ["500", "Internal server error"],
            ].map(([code, meaning]) => (
              <tr key={code} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px] font-bold">{code}</td>
                <td className="px-4 py-2">{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DocPage>
  );
}

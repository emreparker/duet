import { DocPage, CodeBlock } from "@/components/docs/DocPage";

function ParamTable({ params }: { params: [string, string, string, string][] }) {
  return (
    <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
            <th className="text-left px-4 py-2 font-semibold">Parameter</th>
            <th className="text-left px-4 py-2 font-semibold">Type</th>
            <th className="text-left px-4 py-2 font-semibold">Required</th>
            <th className="text-left px-4 py-2 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map(([name, type, required, desc]) => (
            <tr key={name} className="border-b border-[#f0f0f0] last:border-0">
              <td className="px-4 py-2 font-mono text-[12px]">{name}</td>
              <td className="px-4 py-2 font-mono text-[12px]">{type}</td>
              <td className="px-4 py-2">{required}</td>
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
    <DocPage slug="mcp-tools" title="MCP Tools Reference">
      <p>
        Complete reference for all 12 MCP tools exposed by the Duet MCP server. These tools allow AI agents
        to read, create, and manage notes and todos through the Model Context Protocol.
      </p>
      <p className="mt-3">
        For setup instructions, see the{" "}
        <a href="/docs/mcp-setup" className="text-[#10b981] underline underline-offset-2">MCP Setup</a> guide.
      </p>

      {/* ───── Note Tools ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Note Tools</h2>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">create_note</code>
      </h3>
      <p>Creates a new note. The note is attributed to the calling agent.</p>
      <ParamTable params={[
        ["title", "string", "Yes", "Title of the note"],
        ["content", "string", "Yes", "Markdown content of the note"],
        ["tags", "string[]", "No", "Array of tag names to attach"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: the created note object with id, title, content, tags, author, and timestamps.</p>
      <CodeBlock>{`// Example
use_mcp_tool("duet", "create_note", {
  title: "Meeting Notes - March 19",
  content: "## Key decisions\\n- Ship v2 by Friday\\n- Migrate to new auth",
  tags: ["meetings", "engineering"]
})`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">read_note</code>
      </h3>
      <p>Reads a single note by its ID, including full content, tags, and version information.</p>
      <ParamTable params={[
        ["noteId", "string", "Yes", "UUID of the note to read"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: note object with content, tags, version count, and metadata.</p>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">update_note</code>
      </h3>
      <p>Updates an existing note. Only the provided fields are modified. A new version is created automatically.</p>
      <ParamTable params={[
        ["noteId", "string", "Yes", "UUID of the note to update"],
        ["title", "string", "No", "New title"],
        ["content", "string", "No", "New markdown content"],
        ["tags", "string[]", "No", "Replace all tags with this array"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: the updated note object.</p>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">list_notes</code>
      </h3>
      <p>Lists notes with optional filters. Results are ordered by last modified date, newest first.</p>
      <ParamTable params={[
        ["authorType", "string", "No", "Filter by author type: \"human\" or \"agent\""],
        ["authorName", "string", "No", "Filter by specific author name (e.g. \"claude\")"],
        ["tagName", "string", "No", "Filter by tag name"],
        ["limit", "number", "No", "Max results to return (default 50)"],
        ["offset", "number", "No", "Pagination offset (default 0)"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: array of note objects (content truncated for list view).</p>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">search_notes</code>
      </h3>
      <p>Full-text search across all note titles and content using PostgreSQL&apos;s built-in search engine.</p>
      <ParamTable params={[
        ["query", "string", "Yes", "Search query string"],
        ["limit", "number", "No", "Max results to return (default 20)"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: array of matching notes ranked by relevance.</p>
      <CodeBlock>{`// Example
use_mcp_tool("duet", "search_notes", {
  query: "deployment checklist",
  limit: 5
})`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">archive_note</code>
      </h3>
      <p>Archives a note (soft delete). The note is hidden from default views but can be restored. Agents can archive but never permanently delete.</p>
      <ParamTable params={[
        ["noteId", "string", "Yes", "UUID of the note to archive"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: confirmation with the archived note&apos;s ID.</p>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">get_note_history</code>
      </h3>
      <p>Retrieves the full version history of a note. Each edit creates a new version automatically.</p>
      <ParamTable params={[
        ["noteId", "string", "Yes", "UUID of the note"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: array of version objects with version number, content snapshot, author, and timestamp.</p>

      {/* ───── Todo Tools ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Todo Tools</h2>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">create_todo</code>
      </h3>
      <p>Creates a new todo item. Can optionally be linked to a note and assigned to a specific user or agent.</p>
      <ParamTable params={[
        ["title", "string", "Yes", "Title of the todo"],
        ["priority", "string", "No", "Priority level: \"low\", \"medium\", \"high\", or \"urgent\" (default \"medium\")"],
        ["dueDate", "string", "No", "Due date in ISO 8601 format (e.g. \"2026-03-25T17:00:00Z\")"],
        ["noteId", "string", "No", "UUID of a note to link this todo to"],
        ["assigneeType", "string", "No", "Assignee type: \"human\" or \"agent\""],
        ["assigneeName", "string", "No", "Name of the assignee"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: the created todo object.</p>
      <CodeBlock>{`// Example
use_mcp_tool("duet", "create_todo", {
  title: "Review PR #42",
  priority: "high",
  dueDate: "2026-03-20T17:00:00Z",
  assigneeType: "human",
  assigneeName: "emre"
})`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">list_todos</code>
      </h3>
      <p>Lists todos with optional filters.</p>
      <ParamTable params={[
        ["status", "string", "No", "Filter by status: \"pending\" or \"done\""],
        ["priority", "string", "No", "Filter by priority: \"low\", \"medium\", \"high\", or \"urgent\""],
        ["limit", "number", "No", "Max results to return (default 50)"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: array of todo objects.</p>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">update_todo</code>
      </h3>
      <p>Updates an existing todo. Only the provided fields are modified.</p>
      <ParamTable params={[
        ["todoId", "string", "Yes", "UUID of the todo to update"],
        ["title", "string", "No", "New title"],
        ["status", "string", "No", "New status: \"pending\" or \"done\""],
        ["priority", "string", "No", "New priority level"],
        ["dueDate", "string", "No", "New due date in ISO 8601 format"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: the updated todo object.</p>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">complete_todo</code>
      </h3>
      <p>Marks a todo as done. This is a convenience shortcut for setting status to &quot;done&quot;.</p>
      <ParamTable params={[
        ["todoId", "string", "Yes", "UUID of the todo to complete"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: the completed todo object.</p>

      {/* ───── Activity Tool ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Activity Tool</h2>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">get_activity_feed</code>
      </h3>
      <p>Retrieves the activity feed showing recent actions by all users and agents. Useful for understanding what changes have been made and by whom.</p>
      <ParamTable params={[
        ["limit", "number", "No", "Max entries to return (default 20)"],
        ["entityType", "string", "No", "Filter by entity type: \"note\", \"todo\", or \"agent_key\""],
        ["actorName", "string", "No", "Filter by actor name (e.g. \"claude\", \"human\")"],
      ]} />
      <p className="text-[13px] text-[#666]">Returns: array of activity entries with action, actor, entity, and timestamp.</p>

      {/* ───── Permissions ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Agent Permissions</h2>
      <p>
        Agents operate under a restricted permission model. When registering an agent, you can grant a combination
        of <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">read</code>,{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">write</code>, and{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">archive</code> permissions.
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-3 mb-6">
        <li><strong>read</strong> - allows <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">read_note</code>, <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">list_notes</code>, <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">search_notes</code>, <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">get_note_history</code>, <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">list_todos</code>, <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">get_activity_feed</code></li>
        <li><strong>write</strong> - allows <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">create_note</code>, <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">update_note</code>, <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">create_todo</code>, <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">update_todo</code>, <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">complete_todo</code></li>
        <li><strong>archive</strong> - allows <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">archive_note</code></li>
      </ul>
      <p>
        Agents can <strong>never</strong> permanently delete notes or todos. Only human users can perform destructive deletions.
      </p>
    </DocPage>
  );
}

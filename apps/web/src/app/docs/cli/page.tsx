import { DocPage, CodeBlock } from "@/components/docs/DocPage";

export default function Page() {
  return (
    <DocPage slug="cli" title="CLI Reference">
      <p>
        The Duet CLI gives you full control over your notes, todos, and agents from the terminal.
        It connects directly to your PostgreSQL database - no API server required.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Installation</h2>
      <CodeBlock>{`npm install -g @noteduet/cli`}</CodeBlock>
      <p>Verify the installation:</p>
      <CodeBlock>{`duet --version`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Environment</h2>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Variable</th>
              <th className="text-left px-4 py-2 font-semibold">Required</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#f0f0f0] last:border-0">
              <td className="px-4 py-2 font-mono text-[12px]">DUET_DATABASE_URL</td>
              <td className="px-4 py-2">Yes</td>
              <td className="px-4 py-2">PostgreSQL connection string</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock>{`export DUET_DATABASE_URL="postgresql://user:pass@localhost:5432/duet_dev"`}</CodeBlock>

      {/* ───── Note Commands ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Note Commands</h2>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet note add [content]</code>
      </h3>
      <p>Create a new note. Content can be provided as an argument or piped from stdin.</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Option</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["-t, --title <title>", "Set the note title"],
              ["--tag <name>", "Add a tag (repeatable: --tag work --tag urgent)"],
              ["--json", "Output result as JSON"],
            ].map(([opt, desc]) => (
              <tr key={opt} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{opt}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`# Create a note with title and tags
duet note add "Buy groceries" -t "Shopping List" --tag personal

# Pipe content from a file
cat meeting-notes.md | duet note add -t "Standup Notes"`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet note list</code>
      </h3>
      <p>List all notes, newest first.</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Option</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["--by <author>", "Filter by author (e.g. \"human\", \"agent:claude\")"],
              ["--tag <name>", "Filter by tag name"],
              ["--archived", "Show archived notes"],
              ["--limit <n>", "Max results (default 50)"],
              ["--json", "Output as JSON"],
            ].map(([opt, desc]) => (
              <tr key={opt} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{opt}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`# List all notes by Claude
duet note list --by agent:claude

# List notes with a specific tag
duet note list --tag engineering --limit 10`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet note view &lt;id&gt;</code>
      </h3>
      <p>View a note&apos;s full content and metadata including title, author, tags, and timestamps.</p>
      <CodeBlock>{`duet note view abc123`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet note edit &lt;id&gt;</code>
      </h3>
      <p>Edit an existing note. A new version is created automatically.</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Option</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["-t, --title <title>", "Update the title"],
              ["-c, --content <content>", "Replace the content"],
              ["--tag <name>", "Set tags (repeatable, replaces existing tags)"],
            ].map(([opt, desc]) => (
              <tr key={opt} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{opt}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`duet note edit abc123 -t "Updated Title" -c "New content here"`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet note search &lt;query&gt;</code>
      </h3>
      <p>Full-text search across all notes using PostgreSQL&apos;s search engine.</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Option</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["--limit <n>", "Max results (default 20)"],
              ["--json", "Output as JSON"],
            ].map(([opt, desc]) => (
              <tr key={opt} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{opt}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`duet note search "deployment checklist" --limit 5`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet note archive &lt;id&gt;</code>
      </h3>
      <p>Archive a note. The note is hidden from default views but not permanently deleted.</p>
      <CodeBlock>{`duet note archive abc123`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet note unarchive &lt;id&gt;</code>
      </h3>
      <p>Restore an archived note back to the active notes list.</p>
      <CodeBlock>{`duet note unarchive abc123`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet note delete &lt;id&gt;</code>
      </h3>
      <p>Permanently delete a note. This action is irreversible and requires the <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">-f</code> flag.</p>
      <CodeBlock>{`duet note delete abc123 --force`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet note history &lt;id&gt;</code>
      </h3>
      <p>Show the version history of a note, including who made each change and when.</p>
      <CodeBlock>{`duet note history abc123`}</CodeBlock>

      {/* ───── Todo Commands ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Todo Commands</h2>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet todo add &lt;title&gt;</code>
      </h3>
      <p>Create a new todo.</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Option</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["-p, --priority <level>", "Priority: low, medium, high, urgent (default medium)"],
              ["--due <date>", "Due date in ISO 8601 format"],
              ["--assign <name>", "Assign to a user or agent"],
              ["--note-id <id>", "Link to an existing note"],
              ["--json", "Output as JSON"],
            ].map(([opt, desc]) => (
              <tr key={opt} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{opt}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`# Create a high-priority todo with a due date
duet todo add "Review PR #42" -p high --due 2026-03-20T17:00:00Z

# Create a todo linked to a note
duet todo add "Follow up on meeting action items" --note-id abc123`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet todo list</code>
      </h3>
      <p>List todos with optional filters.</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Option</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["-s, --status <status>", "Filter: pending or done"],
              ["-p, --priority <level>", "Filter by priority level"],
              ["--due-before <date>", "Show todos due before this date"],
              ["--limit <n>", "Max results (default 50)"],
              ["--json", "Output as JSON"],
            ].map(([opt, desc]) => (
              <tr key={opt} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{opt}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`# List all pending high-priority todos
duet todo list -s pending -p high

# List todos due this week
duet todo list --due-before 2026-03-23T00:00:00Z`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet todo done &lt;id&gt;</code>
      </h3>
      <p>Mark a todo as complete.</p>
      <CodeBlock>{`duet todo done abc123`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet todo update &lt;id&gt;</code>
      </h3>
      <p>Update an existing todo.</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Option</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["-t, --title <title>", "Update the title"],
              ["-s, --status <status>", "Set status: pending or done"],
              ["-p, --priority <level>", "Set priority level"],
              ["--due <date>", "Set due date"],
            ].map(([opt, desc]) => (
              <tr key={opt} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{opt}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`duet todo update abc123 -p urgent --due 2026-03-19T12:00:00Z`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet todo delete &lt;id&gt;</code>
      </h3>
      <p>Permanently delete a todo. Requires the <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">-f</code> flag.</p>
      <CodeBlock>{`duet todo delete abc123 --force`}</CodeBlock>

      {/* ───── Agent Commands ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Agent Commands</h2>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet agent add &lt;name&gt;</code>
      </h3>
      <p>Register a new agent and receive an API key. The key is only displayed once.</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Option</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#f0f0f0] last:border-0">
              <td className="px-4 py-2 font-mono text-[12px]">--permissions &lt;perms&gt;</td>
              <td className="px-4 py-2">Comma-separated permissions (default: read,write,archive)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock>{`# Register an agent with default permissions
duet agent add claude

# Register a read-only agent
duet agent add monitor --permissions read`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet agent list</code>
      </h3>
      <p>List all registered agents with their status and permissions.</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Option</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#f0f0f0] last:border-0">
              <td className="px-4 py-2 font-mono text-[12px]">--json</td>
              <td className="px-4 py-2">Output as JSON</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock>{`duet agent list`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet agent deactivate &lt;id&gt;</code>
      </h3>
      <p>Temporarily deactivate an agent. The agent&apos;s API key will stop working until reactivated.</p>
      <CodeBlock>{`duet agent deactivate abc123`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet agent reactivate &lt;id&gt;</code>
      </h3>
      <p>Reactivate a previously deactivated agent.</p>
      <CodeBlock>{`duet agent reactivate abc123`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet agent delete &lt;id&gt;</code>
      </h3>
      <p>Permanently delete an agent. Requires the <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">-f</code> flag.</p>
      <CodeBlock>{`duet agent delete abc123 --force`}</CodeBlock>

      {/* ───── Activity Command ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Activity Command</h2>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet activity</code>
      </h3>
      <p>View the activity feed showing recent actions by all users and agents.</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Option</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["--limit <n>", "Max entries (default 20)"],
              ["--actor <name>", "Filter by actor name"],
              ["--type <type>", "Filter by entity type: note, todo, agent_key"],
              ["--json", "Output as JSON"],
            ].map(([opt, desc]) => (
              <tr key={opt} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{opt}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`# View recent activity by Claude
duet activity --actor claude --limit 10

# View all note-related activity
duet activity --type note`}</CodeBlock>

      {/* ───── Server Command ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Server Command</h2>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        <code className="bg-[#f2f2f2] px-2 py-1 rounded text-[15px] font-mono">duet serve</code>
      </h3>
      <p>Start the Duet API server. This is useful for running the web UI alongside the CLI.</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Option</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#f0f0f0] last:border-0">
              <td className="px-4 py-2 font-mono text-[12px]">-p, --port &lt;port&gt;</td>
              <td className="px-4 py-2">Port to listen on (default 7777)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock>{`# Start on default port
duet serve

# Start on a custom port
duet serve -p 3000`}</CodeBlock>

      {/* ───── Tips ───── */}
      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Tips</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Use <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">--json</code> on any list command to pipe output into <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">jq</code> for further processing.</li>
        <li>Set <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">DUET_DATABASE_URL</code> in your shell profile so you don&apos;t have to provide it every time.</li>
        <li>Deletion commands (<code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">delete</code>) always require <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">-f/--force</code> to prevent accidental data loss.</li>
        <li>The CLI connects directly to PostgreSQL, so it works without a running Duet server.</li>
      </ul>
    </DocPage>
  );
}

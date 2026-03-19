import { DocPage, CodeBlock } from "@/components/docs/DocPage";

export default function McpSetupPage() {
  return (
    <DocPage slug="mcp-setup" title="MCP Server Setup">
      <p>Connect AI agents to Duet via the Model Context Protocol.</p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Installation</h2>
      <CodeBlock>{`npm install -g @noteduet/mcp-server

# Or use npx without installing:
npx @noteduet/mcp-server`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>For Self-hosted (direct database)</h2>
      <CodeBlock>{`{
  "mcpServers": {
    "duet": {
      "command": "npx",
      "args": ["@noteduet/mcp-server"],
      "env": {
        "DUET_DATABASE_URL": "postgresql://user:pass@localhost:5432/duet_dev",
        "DUET_AGENT_NAME": "claude",
        "DUET_API_KEY": "duet_xxxxx"
      }
    }
  }
}`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>For Duet Cloud (remote API)</h2>
      <CodeBlock>{`{
  "mcpServers": {
    "duet": {
      "command": "npx",
      "args": ["@noteduet/mcp-server"],
      "env": {
        "DUET_API_URL": "https://noteduet.com",
        "DUET_AGENT_NAME": "claude",
        "DUET_API_KEY": "duet_xxxxx"
      }
    }
  }
}`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Getting an API Key</h2>
      <ol className="list-decimal pl-5 space-y-1 mb-6">
        <li>Open Duet in your browser</li>
        <li>Go to <strong>Agents</strong> in the sidebar</li>
        <li>Click <strong>Register Agent</strong></li>
        <li>Enter a name (e.g. &quot;claude&quot;)</li>
        <li>Copy the API key - it&apos;s only shown once</li>
      </ol>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Supported Clients</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Claude Code</strong> - add to <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">~/.claude/mcp.json</code></li>
        <li><strong>Cursor</strong> - add to <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">.cursor/mcp.json</code></li>
        <li><strong>VS Code</strong> - add to <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">.vscode/mcp.json</code></li>
        <li>Any MCP-compatible client</li>
      </ul>
    </DocPage>
  );
}

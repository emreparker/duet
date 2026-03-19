<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo-full-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="apps/web/public/logo-full.png">
    <img src="apps/web/public/logo-full-dark.png" alt="duet" width="200">
  </picture>
</p>

<h3 align="center">Human + Agent Collaborative Notes</h3>

<p align="center">
  The note-taking app with a built-in MCP server.<br>
  Your AI agents collaborate alongside you - with full attribution and permission control.
</p>

<p align="center">
  <a href="https://github.com/emreparker/duet/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-blue.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/docker-ready-blue.svg" alt="Docker">
  <a href="https://www.npmjs.com/package/@noteduet/mcp-server"><img src="https://img.shields.io/npm/v/@noteduet/mcp-server.svg" alt="npm"></a>
</p>

---

## What is Duet?

Duet is a self-hosted note-taking app designed for collaborative use between humans and AI agents. It includes a built-in [MCP server](https://modelcontextprotocol.io) so any compatible AI agent (Claude, Cursor, VS Code, etc.) can read, write, and manage notes alongside you - with every edit tracked by author.

## Features

- **MCP Server** - 12 tools out of the box. Any MCP-compatible agent connects in seconds
- **Author Attribution** - every note and edit tracks who wrote it (human vs agent)
- **Permission Boundaries** - agents can read, write, and archive - but never delete
- **Real-time Updates** - WebSocket push via PostgreSQL LISTEN/NOTIFY
- **Rich Text Editor** - headings, lists, checklists, code blocks, images (Tiptap)
- **Full-text Search** - PostgreSQL tsvector powered instant search
- **Version History** - every edit tracked with full diff timeline
- **CLI** - pipe-friendly command line with JSON output
- **REST API** - complete API for any integration
- **Google Calendar Sync** - todos with due dates sync to your calendar
- **Tags & Todos** - organize notes with tags, manage todos with priorities

## Quick Start

### Docker (recommended)

```bash
git clone https://github.com/emreparker/duet.git
cd duet
cp .env.example .env
# Edit .env with your SESSION_SECRET
docker compose up -d
```

Visit `http://localhost:7777` and set your password.

### Manual

```bash
git clone https://github.com/emreparker/duet.git
cd duet
pnpm install
createdb duet_dev
cp .env.example .env
pnpm db:migrate
pnpm dev
```

## Connect Your Agent

1. Go to **Agents** in the sidebar and register a new agent
2. Copy the API key
3. Add to your MCP client config:

```json
{
  "mcpServers": {
    "duet": {
      "command": "npx",
      "args": ["@noteduet/mcp-server"],
      "env": {
        "DUET_DATABASE_URL": "postgresql://localhost:5432/duet_dev",
        "DUET_AGENT_NAME": "claude",
        "DUET_API_KEY": "duet_your_key_here"
      }
    }
  }
}
```

Your agent now has access to 12 tools: `create_note`, `read_note`, `update_note`, `list_notes`, `search_notes`, `archive_note`, `get_note_history`, `create_todo`, `list_todos`, `update_todo`, `complete_todo`, and `get_activity_feed`.

## CLI

```bash
npm install -g @noteduet/cli

# Create a note
duet note add "Meeting notes from standup" --title "Standup 2025-03-19"

# List notes
duet note list

# Search
duet note search "deployment"

# Manage todos
duet todo add "Review PR" --priority high --due 2025-03-20
duet todo list
duet todo done <id>

# View activity feed
duet activity
```

## Duet Cloud

A hosted version at [noteduet.com](https://noteduet.com) is coming soon. Sign up for early access on the website.

## Documentation

Full documentation is available at [noteduet.com/docs](https://noteduet.com/docs):

- [Self-hosted Setup](https://noteduet.com/docs/self-hosted)
- [MCP Setup](https://noteduet.com/docs/mcp-setup)
- [MCP Tools Reference](https://noteduet.com/docs/mcp-tools)
- [CLI Reference](https://noteduet.com/docs/cli)
- [REST API Reference](https://noteduet.com/docs/api)
- [Google Calendar Sync](https://noteduet.com/docs/calendar)
- [Docker Deployment](https://noteduet.com/docs/deploy-docker)
- [Fly.io Deployment](https://noteduet.com/docs/deploy-fly)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API | [Hono](https://hono.dev) |
| Database | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team) |
| Frontend | [Next.js](https://nextjs.org) |
| Editor | [Tiptap](https://tiptap.dev) |
| MCP | [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) |
| CLI | [Commander](https://github.com/tj/commander.js) |
| Language | TypeScript (everywhere) |

## Architecture

```
duet/
  packages/
    core/          ← Hono API + Drizzle ORM + business logic
    mcp-server/    ← MCP server (imports core directly, no HTTP hop)
    cli/           ← CLI tool (imports core directly)
  apps/
    web/           ← Next.js web app
```

Core is the single source of truth. MCP server and CLI import it as a library - no HTTP overhead.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[AGPLv3](LICENSE)

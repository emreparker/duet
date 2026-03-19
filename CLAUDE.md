# Duet - Human + Agent Collaborative Note-Taking App

## Project Overview
Duet is a self-hosted note-taking application designed for collaborative use between humans and AI agents. It features an MCP server so AI agents can read/write notes, a web UI + Electron desktop app, and a CLI.

## Tech Stack
- **Language:** TypeScript (everywhere)
- **Database:** PostgreSQL (via Drizzle ORM)
- **Core API:** Hono
- **Frontend:** Next.js + Electron
- **CLI:** Commander
- **MCP Server:** Official TypeScript MCP SDK (@modelcontextprotocol/sdk)
- **Deployment:** Fly.io

## Project Structure
```
duet/
  packages/
    core/          ← Hono API + Drizzle ORM + business logic
    mcp-server/    ← MCP server (imports core directly)
    cli/           ← CLI tool (imports core directly)
  apps/
    web/           ← Next.js app (web + Electron)
```

## Architecture Principles
- Core engine is the single source of truth - all interfaces (web, CLI, MCP) use it
- MCP server and CLI import core as a library (no HTTP hop)
- Web UI and Electron app share the same Next.js codebase
- PostgreSQL always - no SQLite fallback
- Every note tracks its author (human vs agent:{name})
- Agents can read, write, and archive - but NEVER delete
- Real-time updates via PostgreSQL LISTEN/NOTIFY

## Key Design Decisions
- Single-user + their agents (multi-user is future scope)
- Apple Notes-like simplicity + Notion-like markdown support
- Two deployment modes: local (Electron bundles everything) and self-hosted (Docker/Fly.io)
- Google Calendar sync for todos with due dates
- Version history on all notes
- Activity feed for agent actions

## Commands
- `pnpm install` - install all dependencies
- `pnpm dev` - run development servers
- `pnpm build` - build all packages
- `pnpm db:migrate` - run database migrations
- `pnpm db:generate` - generate migration files from schema changes

## Code Style
- Use TypeScript strict mode
- Prefer named exports
- Use Drizzle query builder (not raw SQL)
- Error handling at system boundaries only
- No unnecessary abstractions

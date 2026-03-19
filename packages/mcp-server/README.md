<p align="center">
  <img src="https://raw.githubusercontent.com/emreparker/duet/main/apps/web/public/logo-full.png" alt="duet" width="160">
</p>

# @noteduet/mcp-server

MCP server for [Duet](https://github.com/emreparker/duet) - lets AI agents read, write, and manage notes via the [Model Context Protocol](https://modelcontextprotocol.io).

## Quick Start

```bash
npx @noteduet/mcp-server
```

## MCP Client Configuration

Add to your Claude Code, Cursor, or VS Code MCP config:

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

## Available Tools (12)

| Tool | Description |
|------|-------------|
| `create_note` | Create a new note with optional tags |
| `read_note` | Read a note by ID |
| `update_note` | Update title, content, or tags |
| `list_notes` | List notes with filters |
| `search_notes` | Full-text search across notes |
| `archive_note` | Archive a note (soft delete) |
| `get_note_history` | View version history |
| `create_todo` | Create a todo with priority and due date |
| `list_todos` | List todos with filters |
| `update_todo` | Update a todo |
| `complete_todo` | Mark a todo as done |
| `get_activity_feed` | View recent activity |

## Prerequisites

Requires a running Duet instance with PostgreSQL. See the [self-hosted setup guide](https://noteduet.com/docs/self-hosted).

## Documentation

- [MCP Setup Guide](https://noteduet.com/docs/mcp-setup)
- [MCP Tools Reference](https://noteduet.com/docs/mcp-tools)
- [GitHub](https://github.com/emreparker/duet)

## License

AGPLv3

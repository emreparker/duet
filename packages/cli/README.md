<p align="center">
  <img src="https://raw.githubusercontent.com/emreparker/duet/main/apps/web/public/logo-full.png" alt="duet" width="160">
</p>

# @noteduet/cli

CLI for [Duet](https://github.com/emreparker/duet) - manage notes, todos, and agents from the terminal.

## Install

```bash
npm install -g @noteduet/cli
```

## Usage

```bash
# Set your database URL
export DUET_DATABASE_URL="postgresql://localhost:5432/duet_dev"

# Notes
duet note add "Meeting notes" --title "Standup"
duet note list
duet note search "deployment"
duet note view <id>

# Todos
duet todo add "Review PR" --priority high --due 2025-03-20
duet todo list
duet todo done <id>

# Agents
duet agent add claude --permissions read,write,archive
duet agent list

# Activity
duet activity --limit 20
```

## Commands

| Command | Description |
|---------|-------------|
| `duet note add` | Create a note |
| `duet note list` | List notes |
| `duet note view <id>` | View a note |
| `duet note edit <id>` | Edit a note |
| `duet note search <query>` | Full-text search |
| `duet note archive <id>` | Archive a note |
| `duet note delete <id>` | Delete a note |
| `duet note history <id>` | Version history |
| `duet todo add <title>` | Create a todo |
| `duet todo list` | List todos |
| `duet todo done <id>` | Complete a todo |
| `duet todo update <id>` | Update a todo |
| `duet agent add <name>` | Register an agent |
| `duet agent list` | List agents |
| `duet activity` | View activity feed |

## Prerequisites

Requires a running Duet instance with PostgreSQL. See the [self-hosted setup guide](https://noteduet.com/docs/self-hosted).

## Documentation

- [CLI Reference](https://noteduet.com/docs/cli)
- [GitHub](https://github.com/emreparker/duet)

## License

AGPLv3

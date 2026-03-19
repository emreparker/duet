# Contributing to Duet

Thanks for your interest in contributing to Duet! This guide will help you get set up.

## Development Setup

### Prerequisites

- **Node.js** 22+
- **pnpm** 10+
- **PostgreSQL** 16+

### Getting Started

```bash
# Clone the repo
git clone https://github.com/emreparker/duet.git
cd duet

# Install dependencies
pnpm install

# Create database
createdb duet_dev

# Copy environment config
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

The API server runs on `http://localhost:7777` and the web app on `http://localhost:3000`.

## Project Structure

```
duet/
  packages/
    core/          ← Hono API + Drizzle ORM + business logic
    mcp-server/    ← MCP server (imports core directly)
    cli/           ← CLI tool (imports core directly)
  apps/
    web/           ← Next.js app (web UI)
```

## Code Style

- TypeScript strict mode everywhere
- Named exports preferred
- Use Drizzle query builder, not raw SQL
- Error handling at system boundaries only
- No unnecessary abstractions - keep it simple

## Making Changes

1. Create a branch from `main`
2. Make your changes
3. Ensure `pnpm build` passes
4. Test your changes manually
5. Submit a pull request

## Pull Request Guidelines

- Keep PRs focused - one feature or fix per PR
- Write a clear description of what and why
- Include steps to test your changes
- Update documentation if your change affects user-facing behavior

## Database Changes

If you modify the schema in `packages/core/src/db/schema/`:

```bash
# Generate a migration
pnpm db:generate

# Apply it
pnpm db:migrate
```

Always review generated migrations before committing.

## Architecture Principles

- **Core is the source of truth** - all interfaces (web, CLI, MCP) use it
- **MCP server and CLI import core directly** - no HTTP hop
- **PostgreSQL always** - no SQLite fallback
- **Agents can read, write, archive - never delete**
- **Every note tracks its author** (human vs agent)

## Reporting Issues

Please use [GitHub Issues](https://github.com/emreparker/duet/issues) for bug reports and feature requests.

## License

By contributing to Duet, you agree that your contributions will be licensed under the AGPLv3 license.

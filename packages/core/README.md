<p align="center">
  <img src="https://raw.githubusercontent.com/emreparker/duet/main/apps/web/public/logo-full.png" alt="duet" width="160">
</p>

# @noteduet/core

Core engine for [Duet](https://github.com/emreparker/duet) - the note-taking app with a built-in MCP server.

This package contains the Hono API, Drizzle ORM schemas, services, and business logic that powers Duet. It is used internally by `@noteduet/mcp-server` and `@noteduet/cli`.

## Usage

This package is primarily used as a dependency of the MCP server and CLI. You generally don't need to install it directly.

```ts
import { createApp, createDb, noteService } from '@noteduet/core';
```

## Documentation

- [Duet Documentation](https://noteduet.com/docs)
- [REST API Reference](https://noteduet.com/docs/api)
- [GitHub](https://github.com/emreparker/duet)

## License

AGPLv3

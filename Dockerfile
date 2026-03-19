# Stage 1: Install dependencies
FROM node:22-slim AS deps
RUN npm install -g pnpm@10
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/core/package.json packages/core/
COPY packages/mcp-server/package.json packages/mcp-server/
COPY packages/cli/package.json packages/cli/
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM deps AS builder
WORKDIR /app
COPY tsconfig.base.json turbo.json ./
COPY packages/ packages/
# Temporarily point exports to src for build
RUN pnpm build

# Stage 3: Production
FROM node:22-slim AS runner
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/drizzle ./packages/core/drizzle
COPY --from=builder /app/packages/core/package.json ./packages/core/

ENV NODE_ENV=production
ENV PORT=7777
EXPOSE 7777

CMD ["sh", "-c", "node packages/core/dist/migrate.js && node packages/core/dist/server.js"]

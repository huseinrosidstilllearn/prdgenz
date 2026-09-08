# syntax=docker/dockerfile:1

# Self-host image for PRD GenZ (PRD §8.5.2).
# Build from the monorepo root (context = ./prdgenz):
#   docker build -f apps/self-host/docker/Dockerfile -t prdgenz-self-host .
# Or run via docker-compose.yml in this directory.

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

# ---- deps ---------------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json ./
COPY apps/self-host/package.json ./apps/self-host/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN pnpm install --no-frozen-lockfile --filter @prdgenz/self-host...

# ---- build ---------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/self-host ./apps/self-host
ENV NEXT_TELEMETRY_DISABLED=1
# Relative SQLite URL resolves against apps/self-host/prisma/schema.prisma
ENV DATABASE_URL="file:./prdgenz.db"
RUN pnpm --filter @prdgenz/self-host exec prisma generate
RUN pnpm --filter @prdgenz/self-host build
# Push the schema so a fresh SQLite file ships inside the image
RUN pnpm --filter @prdgenz/self-host exec prisma db push --skip-generate

# ---- runtime -------------------------------------------------------------
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next standalone output (monorepo layout: server.js + traced node_modules)
COPY --from=builder /app/apps/self-host/.next/standalone ./
COPY --from=builder /app/apps/self-host/.next/static ./apps/self-host/.next/static
COPY --from=builder /app/apps/self-host/public ./apps/self-host/public
# Fresh SQLite file (schema already pushed at build time)
COPY --from=builder /app/apps/self-host/prisma/prdgenz.db /tmp/fresh-prdgenz.db

# data volume for SQLite persistence
VOLUME ["/data"]
ENV DATABASE_URL="file:/data/prdgenz.db"

EXPOSE 3000
# Seed the volume on first boot (non-destructive), then start the server
CMD ["sh", "-c", "[ -f /data/prdgenz.db ] || cp /tmp/fresh-prdgenz.db /data/prdgenz.db; node apps/self-host/server.js"]


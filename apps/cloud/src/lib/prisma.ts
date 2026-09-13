import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  // Pool cached at module level so hot-reload/dev reuse the same connections.
  pgPool?: import('pg').Pool
}

// Cloudflare Workers path: pg driver adapter over a small connection pool
// (no Node TCP engine — Supabase session pooler, IPv4). Local dev / Vercel:
// default Prisma engine, unchanged behavior.
const needsAdapter = process.env.CF_WORKERS === '1' && !!process.env.DATABASE_URL

if (needsAdapter) {
  globalForPrisma.pgPool ??= new (require('pg').Pool)({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  })
}

export const prisma = globalForPrisma.prisma ?? (needsAdapter && globalForPrisma.pgPool
  ? new PrismaClient({ adapter: new PrismaPg(globalForPrisma.pgPool) })
  : new PrismaClient())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { PrismaClient as WorkerPrismaClient } from '@prisma/client/wasm.js'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}
const requestClients = new WeakMap<object, PrismaClient>()

function createClient(connectionString: string | undefined, max: number) {
  const adapter = new PrismaPg({
    connectionString,
    max,
    ...(max === 1 ? { maxUses: 1 } : {}),
    connectionTimeoutMillis: 10_000,
  })
  const Client = max === 1 ? WorkerPrismaClient : PrismaClient
  return new Client({ adapter })
}

function currentClient() {
  if (process.env.CF_WORKERS === '1') {
    const context = getCloudflareContext()
    let client = requestClients.get(context.ctx)
    if (!client) {
      const bindings = context.env as unknown as { DATABASE_URL?: string }
      client = createClient(bindings.DATABASE_URL ?? process.env.DATABASE_URL, 1)
      requestClients.set(context.ctx, client)
    }
    return client
  }

  globalForPrisma.prisma ??= createClient(process.env.DATABASE_URL, 5)
  return globalForPrisma.prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = currentClient()
    const value = Reflect.get(client, property, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  client: vi.fn(),
  workerClient: vi.fn(),
  adapter: vi.fn(),
  context: vi.fn(),
}))

vi.mock('@prisma/client', () => ({ PrismaClient: mocks.client }))
vi.mock('@prisma/client/wasm.js', () => ({ PrismaClient: mocks.workerClient }))
vi.mock('@prisma/adapter-pg', () => ({ PrismaPg: mocks.adapter }))
vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: mocks.context }))

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.stubGlobal('prisma', undefined)
  vi.stubEnv('DATABASE_URL', 'postgresql://test.local/local')
  vi.stubEnv('CF_WORKERS', '')
  mocks.client.mockImplementation(function () {
    return {
      user: { findUnique: vi.fn() },
      $disconnect() { return this },
    }
  })
  mocks.adapter.mockImplementation(function () { return {} })
  mocks.workerClient.mockImplementation(mocks.client.getMockImplementation()!)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('Prisma runtime selection', () => {
  it('does not initialize a database client before a request accesses it', async () => {
    await import('./prisma')
    expect(mocks.client).not.toHaveBeenCalled()
    expect(mocks.workerClient).not.toHaveBeenCalled()
    expect(mocks.context).not.toHaveBeenCalled()
  })

  it('reads Worker bindings lazily and reuses a client within one request', async () => {
    const { prisma } = await import('./prisma')
    vi.stubEnv('CF_WORKERS', '1')
    mocks.context.mockReturnValue({
      ctx: {}, env: { DATABASE_URL: 'postgresql://test.local/worker' },
    })
    expect(prisma.user).toBe(prisma.user)
    expect(mocks.workerClient).toHaveBeenCalledTimes(1)
    expect(mocks.client).not.toHaveBeenCalled()
    expect(mocks.adapter).toHaveBeenCalledWith(expect.objectContaining({
      connectionString: 'postgresql://test.local/worker', max: 1, maxUses: 1,
    }))
  })

  it('does not share Worker database clients across request contexts', async () => {
    vi.stubEnv('CF_WORKERS', '1')
    const { prisma } = await import('./prisma')
    mocks.context.mockReturnValue({ ctx: {}, env: {} })
    const firstDelegate = prisma.user
    mocks.context.mockReturnValue({ ctx: {}, env: {} })
    expect(prisma.user).not.toBe(firstDelegate)
    expect(mocks.workerClient).toHaveBeenCalledTimes(2)
  })

  it('keeps the Node client cached and preserves method binding', async () => {
    const { prisma } = await import('./prisma')
    const firstDelegate = prisma.user
    const client = (prisma.$disconnect as unknown as () => { user: unknown })()
    expect(client.user).toBe(firstDelegate)
    expect(mocks.client).toHaveBeenCalledTimes(1)
    expect(mocks.workerClient).not.toHaveBeenCalled()
    expect(mocks.context).not.toHaveBeenCalled()
    expect(mocks.adapter).toHaveBeenCalledWith(expect.objectContaining({ max: 5 }))
  })
})

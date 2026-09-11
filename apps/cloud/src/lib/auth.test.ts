import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({ prisma: { user: { upsert: vi.fn() } } }))

const OAuth_ENV_KEYS = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
] as const

const savedEnv: Record<string, string | undefined> = {}

async function loadAuthOptions() {
  vi.resetModules()
  const { authOptions } = await import('./auth')
  return authOptions
}

describe('authOptions.providers (conditional OAuth)', () => {
  beforeEach(() => {
    for (const k of OAuth_ENV_KEYS) savedEnv[k] = process.env[k]
    for (const k of OAuth_ENV_KEYS) delete process.env[k]
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    for (const k of OAuth_ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k]
      else process.env[k] = savedEnv[k]
    }
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('has exactly 1 provider (credentials) when no OAuth env vars are set', async () => {
    const authOptions = await loadAuthOptions()
    expect(authOptions.providers).toHaveLength(1)
  })

  it('has 2 providers (credentials + google) when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set', async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-id')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-secret')
    const authOptions = await loadAuthOptions()
    expect(authOptions.providers).toHaveLength(2)
  })

  it('has 2 providers (credentials + github) when GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are set', async () => {
    vi.stubEnv('GITHUB_CLIENT_ID', 'github-id')
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'github-secret')
    const authOptions = await loadAuthOptions()
    expect(authOptions.providers).toHaveLength(2)
  })

  it('has 3 providers (credentials + google + github) when all four vars are set', async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-id')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-secret')
    vi.stubEnv('GITHUB_CLIENT_ID', 'github-id')
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'github-secret')
    const authOptions = await loadAuthOptions()
    expect(authOptions.providers).toHaveLength(3)
  })
})

describe('authOptions.callbacks.jwt (OAuth upsert)', () => {
  beforeEach(() => {
    for (const k of OAuth_ENV_KEYS) savedEnv[k] = process.env[k]
    for (const k of OAuth_ENV_KEYS) delete process.env[k]
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    for (const k of OAuth_ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k]
      else process.env[k] = savedEnv[k]
    }
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('upserts the user by email on OAuth sign-in and sets token.id to the DB id', async () => {
    const authOptions = await loadAuthOptions()
    const { prisma } = await import('@/lib/prisma')
    const upsert = vi.mocked(prisma.user.upsert)
    upsert.mockResolvedValue({ id: 'db-user-id' } as never)

    const token = await authOptions.callbacks?.jwt?.(
      {
        token: {},
        user: { id: 'provider-id', email: 'oauth@example.com', name: 'OAuth User' },
        account: { type: 'oauth' },
      } as never,
    )

    expect(upsert).toHaveBeenCalledWith({
      where: { email: 'oauth@example.com' },
      create: { email: 'oauth@example.com', name: 'OAuth User' },
      update: { name: 'OAuth User' },
    })
    expect(token?.id).toBe('db-user-id')
  })

  it('keeps token.id from user.id for credentials sign-in (no upsert)', async () => {
    const authOptions = await loadAuthOptions()
    const { prisma } = await import('@/lib/prisma')
    const upsert = vi.mocked(prisma.user.upsert)
    upsert.mockReset()

    const token = await authOptions.callbacks?.jwt?.(
      {
        token: {},
        user: { id: 'cred-user-id', email: 'cred@example.com', name: 'Cred User' },
        account: { type: 'credentials' },
      } as never,
    )

    expect(upsert).not.toHaveBeenCalled()
    expect(token?.id).toBe('cred-user-id')
  })

  it('leaves the token untouched on subsequent calls without user (session refresh)', async () => {
    const authOptions = await loadAuthOptions()
    const token = await authOptions.callbacks?.jwt?.(
      { token: { id: 'existing-id' }, user: undefined, account: undefined } as never,
    )
    expect(token?.id).toBe('existing-id')
  })
})
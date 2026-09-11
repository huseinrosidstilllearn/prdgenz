import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { assertProdSecrets } from './api-auth'

describe(`assertProdSecrets (fail closed in production)`, () => {
  const savedEnv: Record<string, string | undefined> = {}
  const keysToSave = ['NODE_ENV', 'NEXTAUTH_SECRET']

  beforeEach(() => {
    for (const k of keysToSave) savedEnv[k] = process.env[k]
    vi.stubEnv('NODE_ENV', 'production')
  })

  afterEach(() => {
    for (const k of keysToSave) {
      if (savedEnv[k] === undefined) delete process.env[k]
      else vi.stubEnv(k, savedEnv[k] as string)
    }
  })

  it('returns silently (no throw) when NEXTAUTH_SECRET is strong', () => {
    process.env.NEXTAUTH_SECRET = 'x'.repeat(43) + '==='
    expect(() => assertProdSecrets()).not.toThrow()
  })

  it('throws when NEXTAUTH_SECRET is missing', () => {
    delete process.env.NEXTAUTH_SECRET
    expect(() => assertProdSecrets()).toThrow('NEXTAUTH_SECRET must be set')
  })

  it(`throws when NEXTAUTH_SECRET is the placeholder 'change-me-in-production'`, () => {
    process.env.NEXTAUTH_SECRET = 'change-me-in-production'
    expect(() => assertProdSecrets()).toThrow('NEXTAUTH_SECRET must be set')
  })

  it('throws when NEXTAUTH_SECRET is shorter than 32 chars', () => {
    process.env.NEXTAUTH_SECRET = 'short-secret-123'
    expect(() => assertProdSecrets()).toThrow('NEXTAUTH_SECRET must be set')
  })

  it('is a no-op outside production (placeholder allowed in dev/test)', () => {
    vi.stubEnv('NODE_ENV', 'test')
    process.env.NEXTAUTH_SECRET = 'change-me-in-production'
    expect(() => assertProdSecrets()).not.toThrow()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./prisma', () => ({
  prisma: {
    apiKey: {
      findFirst: vi.fn(),
    },
  },
}))

import { prisma } from './prisma'
import { encryptApiKey, decryptApiKey, getUserCredential } from './encryption'
import { encryptSecret } from '@prdgenz/shared'

const KEY_64 = 'a'.repeat(64)

describe('getEncryptionKey via encryptApiKey', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('roundtrips a user API key', async () => {
    process.env.ENCRYPTION_KEY = KEY_64
    const enc = await encryptApiKey('sk-live-abc123')
    expect(enc).not.toContain('sk-live-abc123')
    expect(await decryptApiKey(enc)).toBe('sk-live-abc123')
  })

  it('throws when ENCRYPTION_KEY is missing', async () => {
    delete process.env.ENCRYPTION_KEY
    await expect(encryptApiKey('sk-x')).rejects.toThrow(
      'ENCRYPTION_KEY must be set to exactly 64 hex characters (32 bytes)'
    )
  })

  it('throws when ENCRYPTION_KEY is the wrong length', async () => {
    process.env.ENCRYPTION_KEY = 'abcd'
    await expect(encryptApiKey('sk-x')).rejects.toThrow()
  })
})

describe('getUserCredential (PRD §6.2.2)', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = KEY_64
    vi.mocked(prisma.apiKey.findFirst).mockReset()
  })

  it('returns the decrypted key + baseUrl when a row exists', async () => {
    const keyEncrypted = await encryptSecret('sk-decrypted-key', KEY_64)
    vi.mocked(prisma.apiKey.findFirst).mockResolvedValue({
      id: '1',
      userId: 'u1',
      provider: 'openai',
      keyEncrypted,
      baseUrl: 'https://proxy.example.com/v1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const cred = await getUserCredential('u1', 'openai')
    expect(cred).toEqual({ apiKey: 'sk-decrypted-key', baseUrl: 'https://proxy.example.com/v1' })
  })

  it('returns null when no row exists', async () => {
    vi.mocked(prisma.apiKey.findFirst).mockResolvedValue(null)
    expect(await getUserCredential('u1', 'openai')).toBeNull()
  })

  it('returns null (does not throw) when the stored ciphertext is corrupt', async () => {
    vi.mocked(prisma.apiKey.findFirst).mockResolvedValue({
      id: '1',
      userId: 'u1',
      provider: 'openai',
      keyEncrypted: 'not-valid-base64!!!',
      baseUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)
    expect(await getUserCredential('u1', 'openai')).toBeNull()
  })
})

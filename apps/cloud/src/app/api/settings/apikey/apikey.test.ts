import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api-auth', () => ({
  requireUserId: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    apiKey: { findMany: vi.fn(), upsert: vi.fn() },
  },
}))

vi.mock('@/lib/encryption', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/encryption')>()
  return {
    ...actual,
    encryptApiKey: vi.fn(actual.encryptApiKey),
    decryptApiKey: vi.fn(actual.decryptApiKey),
  }
})

import { requireUserId } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { encryptApiKey, decryptApiKey } from '@/lib/encryption'
import { GET, PUT } from './route'

const KEY_64 = 'a'.repeat(64)

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/settings/apikey', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('PUT /api/settings/apikey (PRD §10.5, §7.2)', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = KEY_64
    vi.mocked(requireUserId).mockReset()
    vi.mocked(prisma.apiKey.upsert).mockReset()
  })

  it('saves the key encrypted at rest and returns only the masked form', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.apiKey.upsert).mockResolvedValue({
      id: 'k1',
      provider: 'openai',
      baseUrl: null,
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    } as never)

    const res = await PUT(makeReq({ provider: 'openai', key: 'sk-fake-test-key-1234567890' }))
    expect(res.status).toBe(200)
    const body = await res.json()

    // Masked in the response
    expect(body.apiKey.maskedKey).toBe('sk-f****7890')
    expect(JSON.stringify(body)).not.toContain('sk-fake-test-key-1234567890')

    // Encrypted (not plaintext) in the DB upsert
    const upsertArg = vi.mocked(prisma.apiKey.upsert).mock.calls[0][0]
    expect(upsertArg.create.keyEncrypted).not.toContain('sk-fake-test-key')
    expect(upsertArg.create.keyEncrypted.length).toBeGreaterThan(20)

    // Decryption roundtrip: the stored ciphertext decrypts back to the original
    expect(await decryptApiKey(upsertArg.create.keyEncrypted)).toBe('sk-fake-test-key-1234567890')
  })

  it('upserts per (userId, provider) — an existing key is replaced, not duplicated', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.apiKey.upsert).mockResolvedValue({
      id: 'k1',
      provider: 'openai',
      baseUrl: null,
      updatedAt: new Date(),
    } as never)

    await PUT(makeReq({ provider: 'openai', key: 'sk-another-valid-key-123' }))
    const arg = vi.mocked(prisma.apiKey.upsert).mock.calls[0][0]
    expect(arg.where).toEqual({ userId_provider: { userId: 'u1', provider: 'openai' } })
    expect(arg.update.keyEncrypted).toBeDefined()
  })

  it('reports connectionOk:false with a warning when the key fails a live test', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.apiKey.upsert).mockResolvedValue({
      id: 'k1',
      provider: 'openai',
      baseUrl: null,
      updatedAt: new Date(),
    } as never)

    const res = await PUT(makeReq({ provider: 'openai', key: 'sk-invalid-key-abcdef' }))
    const body = await res.json()
    expect(body.connectionOk).toBe(false)
    expect(body.warning).toBeTruthy()
  })

  it('returns 400 when the key is too short (<8)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    const res = await PUT(makeReq({ provider: 'openai', key: 'short' }))
    expect(res.status).toBe(400)
    expect(prisma.apiKey.upsert).not.toHaveBeenCalled()
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    expect((await PUT(makeReq({ provider: 'openai', key: 'sk-12345678' }))).status).toBe(401)
  })
})

describe('GET /api/settings/apikey', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = KEY_64
    vi.mocked(requireUserId).mockReset()
    vi.mocked(prisma.apiKey.findMany).mockReset()
  })

  it('returns masked keys, never the ciphertext or plaintext', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    const ciphertext = await encryptApiKey('sk-live-secret-key-9999')
    vi.mocked(prisma.apiKey.findMany).mockResolvedValue([
      {
        id: 'k1',
        provider: 'openai',
        keyEncrypted: ciphertext,
        baseUrl: null,
        updatedAt: new Date(),
      },
    ] as never)

    const res = await GET()
    expect(res.status).toBe(200)
    const raw = await res.text()
    expect(raw).not.toContain('sk-live-secret-key-9999')
    expect(raw).not.toContain(ciphertext)
    expect(JSON.parse(raw).apiKeys[0].maskedKey).toBe('sk-l****9999')
  })

  it('shows a generic mask for corrupted ciphertext entries instead of failing', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.apiKey.findMany).mockResolvedValue([
      {
        id: 'k1',
        provider: 'openai',
        keyEncrypted: 'corrupted-not-base64!!!',
        baseUrl: null,
        updatedAt: new Date(),
      },
    ] as never)

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.apiKeys[0].maskedKey).toBe('****')
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    expect((await GET()).status).toBe(401)
  })
})

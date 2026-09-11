import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'

vi.mock('@/lib/api-auth', () => ({
  requireUserId: vi.fn(),
}))

vi.mock('@/lib/prd-service', () => ({
  ServiceError: class ServiceError extends Error {
    status: number
    constructor(message: string, status = 400) {
      super(message)
      this.status = status
    }
  },
  assertPRDOwnership: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pRD: { update: vi.fn(), findFirst: vi.fn() },
    pRDVersion: { findFirst: vi.fn() },
  },
}))

import { requireUserId } from '@/lib/api-auth'
import { assertPRDOwnership, ServiceError } from '@/lib/prd-service'
import { prisma } from '@/lib/prisma'
import { POST as share, DELETE as revoke } from './route'

const prdWithShare = { id: 'prd1', title: 'Aplikasi Kasir', shareId: 'aplikasi-kasir-abc12345' }
const prdWithoutShare = { id: 'prd1', title: 'Aplikasi Kasir', shareId: null }

function makeReq(body?: unknown): Request {
  return new Request('http://localhost/x', {
    method: 'POST',
    ...(body !== undefined ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
  })
}

describe('POST /api/prd/[id]/share (PRD §6.7, cloud only)', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(assertPRDOwnership).mockReset()
    vi.mocked(prisma.pRD.update).mockReset()
  })

  it('creates a share id from the slugified title + random suffix', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(prdWithoutShare as never)
    vi.mocked(prisma.pRD.update).mockResolvedValue({ ...prdWithoutShare, shareId: 'x' } as never)

    const res = await share(makeReq(), { params: { id: 'prd1' } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.shareId).toMatch(/^aplikasi-kasir-[0-9a-f]{8}$/)
    const updateArg = vi.mocked(prisma.pRD.update).mock.calls[0]![0]
    expect(updateArg.data.shareId).toBe(body.shareId)
  })

  it('is idempotent — returns the existing shareId without regenerating', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(prdWithShare as never)

    const res = await share(makeReq(), { params: { id: 'prd1' } })
    expect(res.status).toBe(200)
    expect((await res.json()).shareId).toBe('aplikasi-kasir-abc12345')
    expect(prisma.pRD.update).not.toHaveBeenCalled()
  })

  it('returns 404 for a PRD owned by someone else', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockRejectedValue(new ServiceError('PRD not found', 404))
    const res = await share(makeReq(), { params: { id: 'foreign' } })
    expect(res.status).toBe(404)
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    const res = await share(makeReq(), { params: { id: 'prd1' } })
    expect(res.status).toBe(401)
  })

  it('stores the password as a bcrypt hash, never plaintext (PRD §6.7)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(prdWithoutShare as never)
    vi.mocked(prisma.pRD.update).mockResolvedValue({ ...prdWithoutShare, shareId: 'x' } as never)

    const res = await share(makeReq({ password: 'supersecret1' }), { params: { id: 'prd1' } })
    expect(res.status).toBe(200)
    const updateArg = vi.mocked(prisma.pRD.update).mock.calls[0]![0]
    const hash = updateArg.data.sharePasswordHash as string
    expect(typeof hash).toBe('string')
    expect(hash).not.toContain('supersecret1')
    expect(hash.startsWith('$2')).toBe(true)
    expect(await bcrypt.compare('supersecret1', hash)).toBe(true)
    expect(hash).not.toBe(await bcrypt.hash('supersecret1', 10)) // salted, not a fixed hash
  })

  it('stores the expiry date derived from expiresInDays (PRD §6.7)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(prdWithoutShare as never)
    vi.mocked(prisma.pRD.update).mockResolvedValue({ ...prdWithoutShare, shareId: 'x' } as never)

    const before = Date.now()
    const res = await share(makeReq({ expiresInDays: 7 }), { params: { id: 'prd1' } })
    expect(res.status).toBe(200)
    const updateArg = vi.mocked(prisma.pRD.update).mock.calls[0]![0]
    const expiresAt = updateArg.data.shareExpiresAt as Date
    expect(expiresAt).toBeInstanceOf(Date)
    const msPerDay = 24 * 60 * 60 * 1000
    const diff = expiresAt.getTime() - before
    expect(diff).toBeGreaterThanOrEqual(7 * msPerDay - 60_000)
    expect(diff).toBeLessThanOrEqual(7 * msPerDay + 60_000)
    expect(updateArg.data.sharePasswordHash).toBeNull()
  })

  it('creates an unprotected share when no body is sent', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(prdWithoutShare as never)
    vi.mocked(prisma.pRD.update).mockResolvedValue({ ...prdWithoutShare, shareId: 'x' } as never)

    const res = await share(new Request('http://localhost/x', { method: 'POST' }), {
      params: { id: 'prd1' },
    })
    expect(res.status).toBe(200)
    const updateArg = vi.mocked(prisma.pRD.update).mock.calls[0]![0]
    expect(updateArg.data.sharePasswordHash).toBeNull()
    expect(updateArg.data.shareExpiresAt).toBeNull()
  })

  it('rejects a password shorter than 8 chars with 400', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(prdWithoutShare as never)

    const res = await share(makeReq({ password: 'short' }), { params: { id: 'prd1' } })
    expect(res.status).toBe(400)
    expect(prisma.pRD.update).not.toHaveBeenCalled()
  })

  it('rejects an out-of-range expiresInDays with 400', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(prdWithoutShare as never)

    const res = await share(makeReq({ expiresInDays: 400 }), { params: { id: 'prd1' } })
    expect(res.status).toBe(400)
    expect(prisma.pRD.update).not.toHaveBeenCalled()
  })

  it('returns 400 when re-protecting an existing share (must revoke first)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(prdWithShare as never)

    const res = await share(makeReq({ password: 'supersecret1' }), { params: { id: 'prd1' } })
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe(
      'Share link already exists — revoke it first to change protection settings'
    )
    expect(prisma.pRD.update).not.toHaveBeenCalled()
  })

  it('still returns the existing shareId on an empty POST body with an existing share', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(prdWithShare as never)

    const res = await share(makeReq(), { params: { id: 'prd1' } })
    expect(res.status).toBe(200)
    expect((await res.json()).shareId).toBe('aplikasi-kasir-abc12345')
    expect(prisma.pRD.update).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/prd/[id]/share (revoke)', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(assertPRDOwnership).mockReset()
    vi.mocked(prisma.pRD.update).mockReset()
  })

  it('nulls the shareId', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(prdWithShare as never)
    vi.mocked(prisma.pRD.update).mockResolvedValue(prdWithoutShare as never)

    const res = await revoke(new Request('http://localhost/x', { method: 'DELETE' }), {
      params: { id: 'prd1' },
    })
    expect(res.status).toBe(200)
    expect((await res.json()).ok).toBe(true)
    const updateArg = vi.mocked(prisma.pRD.update).mock.calls[0]![0]
    expect(updateArg.data.shareId).toBeNull()
  })

  it('also clears the protection columns (password hash + expiry)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue({
      ...prdWithShare,
      sharePasswordHash: 'hash',
      shareExpiresAt: new Date(),
    } as never)
    vi.mocked(prisma.pRD.update).mockResolvedValue(prdWithoutShare as never)

    const res = await revoke(new Request('http://localhost/x', { method: 'DELETE' }), {
      params: { id: 'prd1' },
    })
    expect(res.status).toBe(200)
    const updateArg = vi.mocked(prisma.pRD.update).mock.calls[0]![0]
    expect(updateArg.data.shareId).toBeNull()
    expect(updateArg.data.sharePasswordHash).toBeNull()
    expect(updateArg.data.shareExpiresAt).toBeNull()
  })

  it('returns 404 for a foreign PRD', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockRejectedValue(new ServiceError('PRD not found', 404))
    const res = await revoke(new Request('http://localhost/x', { method: 'DELETE' }), {
      params: { id: 'foreign' },
    })
    expect(res.status).toBe(404)
  })
})
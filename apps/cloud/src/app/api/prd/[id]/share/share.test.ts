import { describe, it, expect, vi, beforeEach } from 'vitest'

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

    const res = await share(new Request('http://localhost/x', { method: 'POST' }), {
      params: { id: 'prd1' },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.shareId).toMatch(/^aplikasi-kasir-[0-9a-f]{8}$/)
    const updateArg = vi.mocked(prisma.pRD.update).mock.calls[0]![0]
    expect(updateArg.data.shareId).toBe(body.shareId)
  })

  it('is idempotent — returns the existing shareId without regenerating', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(prdWithShare as never)

    const res = await share(new Request('http://localhost/x', { method: 'POST' }), {
      params: { id: 'prd1' },
    })
    expect(res.status).toBe(200)
    expect((await res.json()).shareId).toBe('aplikasi-kasir-abc12345')
    expect(prisma.pRD.update).not.toHaveBeenCalled()
  })

  it('returns 404 for a PRD owned by someone else', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockRejectedValue(new ServiceError('PRD not found', 404))
    const res = await share(new Request('http://localhost/x', { method: 'POST' }), {
      params: { id: 'foreign' },
    })
    expect(res.status).toBe(404)
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    const res = await share(new Request('http://localhost/x', { method: 'POST' }), {
      params: { id: 'prd1' },
    })
    expect(res.status).toBe(401)
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

  it('returns 404 for a foreign PRD', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockRejectedValue(new ServiceError('PRD not found', 404))
    const res = await revoke(new Request('http://localhost/x', { method: 'DELETE' }), {
      params: { id: 'foreign' },
    })
    expect(res.status).toBe(404)
  })
})

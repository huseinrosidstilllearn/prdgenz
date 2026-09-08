import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pRD: { findMany: vi.fn(), create: vi.fn() },
  },
}))

import { prisma } from '@/lib/prisma'
import { GET, POST } from './route'

describe('GET /api/prd (self-host, no auth)', () => {
  beforeEach(() => vi.mocked(prisma.pRD.findMany).mockReset())

  it('lists all PRDs without requiring a session (single user)', async () => {
    vi.mocked(prisma.pRD.findMany).mockResolvedValue([{ id: 'p1', title: 'T' }] as never)
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.prds).toHaveLength(1)
    const arg = vi.mocked(prisma.pRD.findMany).mock.calls[0]![0]!
    expect(arg.orderBy).toEqual({ updatedAt: 'desc' })
  })
})

describe('POST /api/prd', () => {
  beforeEach(() => vi.mocked(prisma.pRD.create).mockReset())

  function makeReq(body: unknown): Request {
    return new Request('http://localhost:3001/api/prd', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  it('creates a PRD with defaults (no ownership checks — single user)', async () => {
    vi.mocked(prisma.pRD.create).mockResolvedValue({ id: 'p1' } as never)
    const res = await POST(makeReq({}))
    expect(res.status).toBe(201)
    const arg = vi.mocked(prisma.pRD.create).mock.calls[0][0]
    expect(arg.data).toEqual({ title: 'Untitled PRD', language: 'EN', mode: 'WIZARD' })
  })

  it('accepts explicit ID language + ONESHOT mode', async () => {
    vi.mocked(prisma.pRD.create).mockResolvedValue({ id: 'p1' } as never)
    const res = await POST(makeReq({ title: 'PRD Aplikasi Kasir', language: 'ID', mode: 'ONESHOT' }))
    expect(res.status).toBe(201)
    const arg = vi.mocked(prisma.pRD.create).mock.calls[0][0]
    expect(arg.data).toMatchObject({ title: 'PRD Aplikasi Kasir', language: 'ID', mode: 'ONESHOT' })
  })

  it('returns 400 on an invalid mode', async () => {
    const res = await POST(makeReq({ mode: 'VOICE' }))
    expect(res.status).toBe(400)
    expect(prisma.pRD.create).not.toHaveBeenCalled()
  })
})

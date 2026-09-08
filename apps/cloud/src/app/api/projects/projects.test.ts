import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api-auth', () => ({
  requireUserId: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: { findMany: vi.fn(), create: vi.fn() },
  },
}))

import { requireUserId } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { GET, POST } from './route'

describe('GET /api/projects (PRD §10)', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(prisma.project.findMany).mockReset()
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('lists only the session user’s projects', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.project.findMany).mockResolvedValue([
      { id: 'p1', name: 'Projek Uji', _count: { prds: 2 } },
    ] as never)

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.projects).toHaveLength(1)
    const arg = vi.mocked(prisma.project.findMany).mock.calls[0]![0]!
    expect(arg.where).toEqual({ userId: 'u1' })
    expect(arg.orderBy).toEqual({ updatedAt: 'desc' })
  })

  it('rate-limits to 429 after 100 requests per minute', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u-ratelimit')
    vi.mocked(prisma.project.findMany).mockResolvedValue([] as never)
    let saw429 = false
    for (let i = 0; i < 101; i++) {
      const res = await GET()
      if (res.status === 429) {
        saw429 = true
        expect((await res.json()).error).toBe('Too many requests')
        break
      }
    }
    expect(saw429).toBe(true)
  })
})

describe('POST /api/projects', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(prisma.project.create).mockReset()
  })

  function makeReq(body: unknown): Request {
    return new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  it('creates a project for the session user', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.project.create).mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      name: 'Projek Baru',
    } as never)

    const res = await POST(makeReq({ name: 'Projek Baru', description: 'desc' }))
    expect(res.status).toBe(201)
    const arg = vi.mocked(prisma.project.create).mock.calls[0]![0]
    expect(arg.data.userId).toBe('u1')
    expect(arg.data.name).toBe('Projek Baru')
  })

  it('returns 400 when the schema rejects the body (name required)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    const res = await POST(makeReq({ title: 'wrong field' }))
    expect(res.status).toBe(400)
    expect(prisma.project.create).not.toHaveBeenCalled()
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    const res = await POST(makeReq({ name: 'X' }))
    expect(res.status).toBe(401)
  })
})

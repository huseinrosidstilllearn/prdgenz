import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api-auth', () => ({
  requireUserId: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: { findMany: vi.fn(), create: vi.fn(), count: vi.fn() },
    user: { findUnique: vi.fn() },
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
    vi.mocked(prisma.project.count).mockReset()
    vi.mocked(prisma.user.findUnique).mockReset()
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
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'PRO' } as never)
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

describe('POST /api/projects — free-plan 1-project limit (PRD §14)', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(prisma.project.create).mockReset()
    vi.mocked(prisma.project.count).mockReset()
    vi.mocked(prisma.user.findUnique).mockReset()
  })

  function makeReq(body: unknown): Request {
    return new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  it('lets PRO users create projects regardless of existing count', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'PRO' } as never)
    vi.mocked(prisma.project.count).mockResolvedValue(99)
    vi.mocked(prisma.project.create).mockResolvedValue({
      id: 'p2',
      userId: 'u1',
      name: 'Projek kedua',
    } as never)

    const res = await POST(makeReq({ name: 'Projek kedua' }))
    expect(res.status).toBe(201)
    expect(prisma.project.count).not.toHaveBeenCalled()
  })

  it('lets a FREE user with 0 existing projects create their first', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'FREE' } as never)
    vi.mocked(prisma.project.count).mockResolvedValue(0)
    vi.mocked(prisma.project.create).mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      name: 'Projek Pertama',
    } as never)

    const res = await POST(makeReq({ name: 'Projek Pertama' }))
    expect(res.status).toBe(201)
    const countArg = vi.mocked(prisma.project.count).mock.calls[0]![0]!
    expect(countArg.where).toEqual({ userId: 'u1' })
  })

  it('blocks a FREE user who already has 1 project with 403', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'FREE' } as never)
    vi.mocked(prisma.project.count).mockResolvedValue(1)

    const res = await POST(makeReq({ name: 'Projek Kedua' }))
    expect(res.status).toBe(403)
    expect((await res.json()).error).toBe(
      'Free plan is limited to 1 project. Upgrade to Pro for unlimited projects.'
    )
    expect(prisma.project.create).not.toHaveBeenCalled()
  })

  it('returns 401 when the user no longer exists', async () => {
    vi.mocked(requireUserId).mockResolvedValue('ghost')
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await POST(makeReq({ name: 'X' }))
    expect(res.status).toBe(401)
    expect(prisma.project.create).not.toHaveBeenCalled()
  })
})
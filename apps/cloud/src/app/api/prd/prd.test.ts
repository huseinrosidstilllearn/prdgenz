import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api-auth', () => ({
  requireUserId: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pRD: { findMany: vi.fn(), create: vi.fn(), count: vi.fn() },
    project: { findFirst: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}))

import { requireUserId } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { GET, POST } from './route'

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/prd', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('GET /api/prd (PRD §10.2)', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(prisma.pRD.findMany).mockReset()
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    expect((await GET()).status).toBe(401)
  })

  it('lists only PRDs whose project belongs to the user, newest first', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.pRD.findMany).mockResolvedValue([] as never)

    const res = await GET()
    expect(res.status).toBe(200)
    const arg = vi.mocked(prisma.pRD.findMany).mock.calls[0]![0]!
    expect(arg.where).toEqual({ project: { userId: 'u1' } })
    expect(arg.orderBy).toEqual({ updatedAt: 'desc' })
  })
})

describe('POST /api/prd', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(prisma.project.findFirst).mockReset()
    vi.mocked(prisma.user.findUnique).mockReset()
    vi.mocked(prisma.pRD.count).mockReset()
    vi.mocked(prisma.pRD.create).mockReset()
  })

  it('creates an empty PRD shell with defaults (title/language/mode)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.project.findFirst).mockResolvedValue({ id: 'p1', userId: 'u1' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'PRO' } as never)
    vi.mocked(prisma.pRD.create).mockResolvedValue({ id: 'prd1' } as never)

    const res = await POST(makeReq({ projectId: 'p1' }))
    expect(res.status).toBe(201)
    const arg = vi.mocked(prisma.pRD.create).mock.calls[0]![0]
    expect(arg.data).toMatchObject({
      projectId: 'p1',
      title: 'Untitled PRD',
      language: 'EN',
      mode: 'WIZARD',
    })
  })

  it('returns 404 when the project does not belong to the user', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null)

    const res = await POST(makeReq({ projectId: 'foreign' }))
    expect(res.status).toBe(404)
    expect(prisma.pRD.create).not.toHaveBeenCalled()
  })

  it('returns 403 when the free-plan limit is reached (10/30 days, PRD §14)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.project.findFirst).mockResolvedValue({ id: 'p1', userId: 'u1' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'FREE' } as never)
    vi.mocked(prisma.pRD.count).mockResolvedValue(10)

    const res = await POST(makeReq({ projectId: 'p1' }))
    expect(res.status).toBe(403)
    expect((await res.json()).error).toContain('Free plan limit reached')
  })

  it('returns 400 on invalid input', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    const res = await POST(makeReq({ title: 123 }))
    expect(res.status).toBe(400)
  })
})

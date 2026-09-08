import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
  },
}))

import { prisma } from '@/lib/prisma'
import { POST as register } from './route'

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/auth/register (PRD §10.1)', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset()
    vi.mocked(prisma.user.create).mockReset()
  })

  it('creates a user and returns 201 with safe fields (no password hash)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      name: 'Test User',
    } as never)

    const res = await register(makeReq({ email: 'test@example.com', name: 'Test User', password: 'Test1234!' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.user).toEqual({ id: 'u1', email: 'test@example.com', name: 'Test User' })
    expect(body.passwordHash).toBeUndefined()

    const createArg = vi.mocked(prisma.user.create).mock.calls[0]![0]
    expect(createArg.data.email).toBe('test@example.com')
    const hash = createArg.data.passwordHash as string
    expect(hash).not.toBe('Test1234!') // bcrypt-hashed
    expect(hash.startsWith('$2')).toBe(true)
  })

  it('rejects invalid input with 400', async () => {
    const res = await register(makeReq({ email: 'not-an-email', name: '', password: 'short' }))
    expect(res.status).toBe(400)
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('returns 409 when the email is already registered', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1' } as never)
    const res = await register(
      makeReq({ email: 'dup@example.com', name: 'Dup', password: 'Test1234!' })
    )
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('Email already registered')
  })

  it('returns 500 on an unexpected prisma failure', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('db down'))
    const res = await register(
      makeReq({ email: 'x@example.com', name: 'X', password: 'Test1234!' })
    )
    expect(res.status).toBe(500)
  })
})

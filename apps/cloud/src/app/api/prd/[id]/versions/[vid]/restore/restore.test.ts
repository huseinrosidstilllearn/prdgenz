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
  restoreVersion: vi.fn(),
}))

import { requireUserId } from '@/lib/api-auth'
import { restoreVersion, ServiceError } from '@/lib/prd-service'
import { POST } from './route'

function call(vid: string): ReturnType<typeof POST> {
  return POST(new Request('http://localhost/x', { method: 'POST' }), {
    params: { id: 'prd1', vid },
  })
}

describe('POST /api/prd/[id]/versions/[vid]/restore (PRD §6.6)', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(restoreVersion).mockReset()
  })

  it('restores an old version and returns the new version number', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(restoreVersion).mockResolvedValue({
      id: 'v3',
      versionNumber: 3,
      createdAt: new Date('2026-01-03T00:00:00Z'),
    } as never)

    const res = await call('2')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.version.versionNumber).toBe(3)
    expect(restoreVersion).toHaveBeenCalledWith('u1', 'prd1', 2)
  })

  it('returns 400 for a non-numeric version id', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    const res = await call('abc')
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Invalid version number')
    expect(restoreVersion).not.toHaveBeenCalled()
  })

  it('returns 400 for version 0 or negative', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    expect((await call('0')).status).toBe(400)
    expect((await call('-1')).status).toBe(400)
  })

  it('returns 404 when the version does not exist', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(restoreVersion).mockRejectedValue(new ServiceError('Version not found', 404))
    const res = await call('99')
    expect(res.status).toBe(404)
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    expect((await call('1')).status).toBe(401)
  })
})

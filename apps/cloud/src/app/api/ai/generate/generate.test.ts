import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api-auth', () => ({
  requireUserId: vi.fn(),
}))

vi.mock('@/lib/encryption', () => ({
  getUserCredential: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockReturnValue(true),
}))

vi.mock('@/lib/prd-service', () => ({
  ServiceError: class ServiceError extends Error {
    status: number
    constructor(message: string, status = 400) {
      super(message)
      this.status = status
    }
  },
}))

import { requireUserId } from '@/lib/api-auth'
import { getUserCredential } from '@/lib/encryption'
import { POST } from './route'

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/ai/generate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const validPayload = {
  language: 'ID',
  mode: 'ONESHOT',
  provider: 'openai',
  model: 'gpt-4o-mini',
  input: { idea: 'Aplikasi kasir warung kopi dengan inventaris sederhana' },
}

describe('POST /api/ai/generate (PRD Â§10.3, Â§6.2.4)', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(getUserCredential).mockReset()
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    const res = await POST(makeReq(validPayload))
    expect(res.status).toBe(401)
  })

  it('returns 400 with a helpful message when no API key is configured for the provider', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(getUserCredential).mockResolvedValue(null)

    const res = await POST(makeReq(validPayload))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('No API key configured for provider "openai"')
    expect(body.error).toContain('Settings')
  })

  it('rejects an invalid one-shot input with 400 (validation before key lookup)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    const res = await POST(
      makeReq({ ...validPayload, input: { idea: 'short' } })
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.details.fieldErrors.input).toContain('Invalid one-shot input')
  })

  it('rejects a link-local customBaseUrl with 400 (SSRF guard, production)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(getUserCredential).mockResolvedValue(null)
    vi.stubEnv('NODE_ENV', 'production')

    const res = await POST(makeReq({ ...validPayload, customBaseUrl: 'http://169.254.169.254/v1' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('customBaseUrl must be a public http(s) URL')
    expect(getUserCredential).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })

  it('rejects a private-IP customBaseUrl with 400 (production)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(getUserCredential).mockResolvedValue(null)
    vi.stubEnv('NODE_ENV', 'production')

    const res = await POST(makeReq({ ...validPayload, customBaseUrl: 'http://10.0.0.5/v1' }))
    expect(res.status).toBe(400)
    expect(getUserCredential).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })

  it('lets a valid public https customBaseUrl through to the credential lookup', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(getUserCredential).mockResolvedValue(null)

    const res = await POST(makeReq({ ...validPayload, customBaseUrl: 'https://api.openai.com/v1' }))
    expect(res.status).toBe(400) // passes guard, fails at key lookup
    expect((await res.json()).error).toContain('No API key configured')
    expect(getUserCredential).toHaveBeenCalledWith('u1', 'openai')
  })

  it('returns JSON errors with Content-Type application/json (not SSE) for early failures', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(getUserCredential).mockResolvedValue(null)

    const res = await POST(makeReq(validPayload))
    expect(res.headers.get('content-type')).toContain('application/json')
  })
})

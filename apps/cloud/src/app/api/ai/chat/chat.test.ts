import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api-auth', () => ({
  requireUserId: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockReturnValue(true),
}))

vi.mock('@/lib/encryption', () => ({
  getUserCredential: vi.fn(),
}))

vi.mock('@prdgenz/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@prdgenz/shared')>()
  return {
    ...actual,
    callAIStream: vi.fn(async function* () {
      // overridden per-test via mockImplementation
    }),
  }
})

import { requireUserId } from '@/lib/api-auth'
import { getUserCredential } from '@/lib/encryption'
import { callAIStream } from '@prdgenz/shared'
import { POST } from './route'

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const validPayload = {
  language: 'ID',
  provider: 'tokenrouter',
  model: 'glm-5.3-free',
  messages: [
    { role: 'user', content: 'aku mau bikin aplikasi kasir' },
    { role: 'assistant', content: 'target user siapa?' },
    { role: 'user', content: 'pemilik warung kopi' },
  ],
}

describe('POST /api/ai/chat (PRD §10.3, §6.1.2)', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(getUserCredential).mockReset()
    vi.mocked(callAIStream).mockReset()
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    const res = await POST(makeReq(validPayload))
    expect(res.status).toBe(401)
  })

  it('returns 400 when no API key is configured for the provider', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(getUserCredential).mockResolvedValue(null)

    const res = await POST(makeReq(validPayload))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain('No API key configured')
  })

  it('rejects an empty messages array with 400', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    const res = await POST(makeReq({ ...validPayload, messages: [] }))
    expect(res.status).toBe(400)
  })

  it('streams SSE delta events and a done event with the full text', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(getUserCredential).mockResolvedValue({ apiKey: 'sk-key', baseUrl: undefined })

    vi.mocked(callAIStream).mockImplementation(
      async function* () {
        yield 'Ha'
        yield 'lo!'
      } as never
    )

    const res = await POST(makeReq(validPayload))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/event-stream')

    const raw = await res.text()
    const events = raw
      .split('\n\n')
      .filter((l) => l.startsWith('data: '))
      .map((l) => JSON.parse(l.slice(6)))

    expect(events).toEqual([
      { type: 'delta', text: 'Ha' },
      { type: 'delta', text: 'lo!' },
      { type: 'done', full: 'Halo!' },
    ])
  })

  it('sends the last user message as the prompt, with the chat system prompt', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(getUserCredential).mockResolvedValue({ apiKey: 'sk-key', baseUrl: undefined })
    vi.mocked(callAIStream).mockImplementation(
      async function* () {} as never
    )

    await POST(makeReq(validPayload))
    const arg = vi.mocked(callAIStream).mock.calls[0]![0]
    expect(arg.userPrompt).toBe('pemilik warung kopi') // last user turn only
    expect(arg.systemPrompt).toContain('PRD')
    expect(arg.model).toBe('glm-5.3-free')
    expect(arg.apiKey).toBe('sk-key')
  })

  it('emits an SSE error event when the provider fails mid-stream', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(getUserCredential).mockResolvedValue({ apiKey: 'sk-key', baseUrl: undefined })
    vi.mocked(callAIStream).mockImplementation(
      async function* () {
        yield 'partial'
        throw new Error('AI provider error 500')
      } as never
    )

    const res = await POST(makeReq(validPayload))
    expect(res.status).toBe(200) // SSE stream already started
    const raw = await res.text()
    const events = raw
      .split('\n\n')
      .filter((l) => l.startsWith('data: '))
      .map((l) => JSON.parse(l.slice(6)))
    expect(events).toEqual([
      { type: 'delta', text: 'partial' },
      { type: 'error', error: 'AI provider error 500' },
    ])
  })
})

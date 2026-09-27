import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getProtocol, getDefaultModel, resolveBaseUrl, listProviders, callAI, callAIStream, testProviderConnection } from './providers'

/** Minimal fetch mock signature: (url, init) — typed so mock.calls args are accessible. */
type FetchInit = { headers: Record<string, string>; body?: string }

describe('getProtocol (PRD §6.2.1)', () => {
  it('maps every provider to its wire protocol', () => {
    expect(getProtocol('openai')).toBe('openai-compatible')
    expect(getProtocol('omniroute')).toBe('openai-compatible')
    expect(getProtocol('tokenrouter')).toBe('openai-compatible')
    expect(getProtocol('9router')).toBe('openai-compatible')
    expect(getProtocol('custom')).toBe('openai-compatible')
    expect(getProtocol('anthropic')).toBe('anthropic')
    expect(getProtocol('google')).toBe('google')
  })
  it('falls back to openai-compatible for unknown ids', () => {
    expect(getProtocol('unknown-provider')).toBe('openai-compatible')
  })
})

describe('resolveBaseUrl (PRD §6.2.1)', () => {
  it('returns each provider default base URL', () => {
    expect(resolveBaseUrl('openai')).toBe('https://api.openai.com/v1')
    expect(resolveBaseUrl('anthropic')).toBe('https://api.anthropic.com/v1')
    expect(resolveBaseUrl('google')).toBe('https://generativelanguage.googleapis.com/v1beta')
    expect(resolveBaseUrl('tokenrouter')).toBe('https://api.tokenrouter.com/v1')
  })
  it('prefers customBaseUrl when given, stripping trailing slashes', () => {
    expect(resolveBaseUrl('openai', 'https://proxy.example.com/v1/')).toBe(
      'https://proxy.example.com/v1'
    )
    expect(resolveBaseUrl('custom', 'https://my-llm.internal//')).toBe('https://my-llm.internal')
  })
  it('throws for custom provider without a base URL', () => {
    expect(() => resolveBaseUrl('custom')).toThrow('Custom provider requires a base URL')
  })
  it('throws for an unknown provider without custom URL', () => {
    expect(() => resolveBaseUrl('nope')).toThrow('Unknown provider: nope')
  })
})

describe('getDefaultModel', () => {
  it('returns the first listed model for known providers', () => {
    expect(getDefaultModel('openai')).toBe('gpt-4o')
    expect(getDefaultModel('anthropic')).toBe('claude-sonnet-4-20250514')
  })
  it('falls back to "auto" for providers without models', () => {
    expect(getDefaultModel('custom')).toBe('auto')
  })
})

describe('listProviders (GET /api/ai/providers)', () => {
  it('returns all 7 providers with configured flags (PRD §6.2.1)', () => {
    const list = listProviders(['openai', 'anthropic'])
    expect(list).toHaveLength(7)
    expect(list.map((p) => p.id)).toEqual([
      'openai',
      'anthropic',
      'google',
      'omniroute',
      'tokenrouter',
      '9router',
      'custom',
    ])
    const openai = list.find((p) => p.id === 'openai')!
    expect(openai.configured).toBe(true)
    expect(list.find((p) => p.id === 'google')!.configured).toBe(false)
  })
})

describe('callAI (non-streaming, per protocol)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const req = {
    provider: 'openai',
    apiKey: 'sk-test',
    systemPrompt: 'SYS',
    userPrompt: 'USER',
  }

  it('sends an OpenAI-compatible request and extracts choices text', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init: FetchInit): Promise<Response> =>
        new Response(JSON.stringify({ choices: [{ message: { content: 'FULL TEXT' } }] }), {
          status: 200,
        })
    )
    vi.stubGlobal('fetch', fetchMock)

    const out = await callAI(req)
    expect(out).toBe('FULL TEXT')

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.openai.com/v1/chat/completions')
    const body = JSON.parse(init.body!)
    expect(body.messages[0]).toEqual({ role: 'system', content: 'SYS' })
    expect(body.messages[1]).toEqual({ role: 'user', content: 'USER' })
    expect(init.headers.Authorization).toBe('Bearer sk-test')
    expect(body.stream).toBeUndefined()
  })

  it('uses jsonMode only for openai (response_format json_object)', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init: FetchInit): Promise<Response> =>
        new Response(JSON.stringify({ choices: [{ message: { content: '{}' } }] }), { status: 200 })
    )
    vi.stubGlobal('fetch', fetchMock)

    await callAI({ ...req, jsonMode: true })
    expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body!).response_format).toEqual({
      type: 'json_object',
    })

    // Non-openai providers do not send response_format even in jsonMode
    fetchMock.mockClear()
    await callAI({ ...req, provider: 'omniroute', jsonMode: true })
    expect(
      JSON.parse(fetchMock.mock.calls[0]![1]!.body!).response_format
    ).toBeUndefined()
  })

  it('sends an Anthropic request (x-api-key header, system field) and extracts text', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init: FetchInit): Promise<Response> =>
        new Response(JSON.stringify({ content: [{ type: 'text', text: 'ANTHROPIC OUT' }] }), {
          status: 200,
        })
    )
    vi.stubGlobal('fetch', fetchMock)

    const out = await callAI({ ...req, provider: 'anthropic' })
    expect(out).toBe('ANTHROPIC OUT')

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(init.headers['x-api-key']).toBe('sk-test')
    expect(init.headers['anthropic-version']).toBe('2023-06-01')
    const body = JSON.parse(init.body!)
    expect(body.system).toBe('SYS')
    expect(body.messages).toEqual([{ role: 'user', content: 'USER' }])
  })

  it('sends enough output tokens for full-PRD generation (regression: 4000 truncated JSONs)', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init: FetchInit): Promise<Response> =>
        new Response(JSON.stringify({ content: [{ type: 'text', text: 'OK' }] }), { status: 200 })
    )
    vi.stubGlobal('fetch', fetchMock)

    await callAI(req)
    expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body!).max_tokens).toBeGreaterThanOrEqual(16000)

    fetchMock.mockClear()
    await callAI({ ...req, provider: 'anthropic' })
    expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body!).max_tokens).toBe(4096)

    fetchMock.mockClear()
    await callAI({ ...req, provider: 'google' })
    expect(
      JSON.parse(fetchMock.mock.calls[0]![1]!.body!).generationConfig.maxOutputTokens
    ).toBe(8192)
  })

  it('sends a Google request (x-goog-api-key) and extracts candidates text', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init: FetchInit): Promise<Response> =>
        new Response(
          JSON.stringify({ candidates: [{ content: { parts: [{ text: 'GOOGLE OUT' }] } }] }),
          { status: 200 }
        )
    )
    vi.stubGlobal('fetch', fetchMock)

    const out = await callAI({ ...req, provider: 'google', model: 'gemini-1.5-pro' })
    expect(out).toBe('GOOGLE OUT')

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
    )
    expect(init.headers['x-goog-api-key']).toBe('sk-test')
  })

  it('throws a descriptive error on a non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (): Promise<Response> => new Response('{"error":"bad key"}', { status: 401 }))
    )
    await expect(callAI(req)).rejects.toThrow('AI provider error 401')
  })

  it('tolerates mirrors that force SSE on non-stream requests (regression)', async () => {
    const encoder = new TextEncoder()
    const sse = 'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\ndata: {"choices":[{"delta":{"content":"lo"}}]}\n\ndata: [DONE]\n\n'
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (): Promise<Response> =>
          new Response(
            new ReadableStream({
              start(c) {
                c.enqueue(encoder.encode(sse))
                c.close()
              },
            }),
            { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
          )
      )
    )
    const out = await callAI(req)
    expect(out).toBe('Hello')
  })
})

describe('callAIStream (SSE, PRD §6.2.4)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function sseResponse(events: object[]): Response {
    const chunks = events.map((e) => `data: ${JSON.stringify(e)}\n\n`)
    chunks.push('data: [DONE]\n\n')
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        for (const c of chunks) controller.enqueue(encoder.encode(c))
        controller.close()
      },
    })
    return new Response(stream, { status: 200 })
  }

  it('yields openai-compatible deltas and requests stream:true', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init: FetchInit): Promise<Response> =>
        sseResponse([
          { choices: [{ delta: { content: 'Hel' } }] },
          { choices: [{ delta: { content: 'lo' } }] },
          { choices: [{ delta: {} }] },
        ])
    )
    vi.stubGlobal('fetch', fetchMock)

    const deltas: string[] = []
    for await (const d of callAIStream({
      provider: 'openai',
      apiKey: 'sk-test',
      systemPrompt: 'S',
      userPrompt: 'U',
    })) {
      deltas.push(d)
    }
    expect(deltas).toEqual(['Hel', 'lo'])
    expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body!).stream).toBe(true)
  })

  it('yields anthropic content_block_delta events', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (_url: string, _init: FetchInit): Promise<Response> =>
          sseResponse([
            { type: 'message_start' },
            { type: 'content_block_delta', delta: { text: 'Halo' } },
            { type: 'content_block_delta', delta: { text: ' PRD' } },
            { type: 'message_stop' },
          ])
      )
    )
    const deltas: string[] = []
    for await (const d of callAIStream({
      provider: 'anthropic',
      apiKey: 'k',
      systemPrompt: 'S',
      userPrompt: 'U',
    })) {
      deltas.push(d)
    }
    expect(deltas).toEqual(['Halo', ' PRD'])
  })

  it('yields google SSE candidate chunks', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (_url: string, _init: FetchInit): Promise<Response> =>
          sseResponse([
            { candidates: [{ content: { parts: [{ text: 'A' }] } }] },
            { candidates: [{ content: { parts: [{ text: 'B' }] } }] },
          ])
      )
    )
    const deltas: string[] = []
    for await (const d of callAIStream({
      provider: 'google',
      apiKey: 'k',
      model: 'gemini-2.0-flash',
      systemPrompt: 'S',
      userPrompt: 'U',
    })) {
      deltas.push(d)
    }
    expect(deltas).toEqual(['A', 'B'])
  })

  it('skips malformed keep-alive SSE lines without crashing', async () => {
    const encoder = new TextEncoder()
    const raw = 'data: not-json\n\ndata: {"choices":[{"delta":{"content":"OK"}}]}\n\n'
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (_url: string, _init: FetchInit): Promise<Response> =>
          new Response(
            new ReadableStream({
              start(c) {
                c.enqueue(encoder.encode(raw))
                c.close()
              },
            }),
            { status: 200 }
          )
      )
    )
    const deltas: string[] = []
    for await (const d of callAIStream({
      provider: 'openai',
      apiKey: 'k',
      systemPrompt: 'S',
      userPrompt: 'U',
    })) {
      deltas.push(d)
    }
    expect(deltas).toEqual(['OK'])
  })
})

describe('testProviderConnection (PRD §6.2.2)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true on a 2xx models listing', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init: FetchInit): Promise<Response> =>
        new Response('{}', { status: 200 })
    )
    vi.stubGlobal('fetch', fetchMock)

    expect(await testProviderConnection('openai', 'sk-good')).toBe(true)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.openai.com/v1/models')
    expect(init.headers.Authorization).toBe('Bearer sk-good')
  })

  it('returns false on non-2xx or network errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (): Promise<Response> => new Response('nope', { status: 401 }))
    )
    expect(await testProviderConnection('openai', 'sk-bad')).toBe(false)

    vi.stubGlobal(
      'fetch',
      vi.fn(async (): Promise<Response> => {
        throw new Error('network down')
      })
    )
    expect(await testProviderConnection('openai', 'sk-any')).toBe(false)
  })
})

// Without a deadline, a provider that accepts the connection and then goes
// quiet holds the request open forever — nothing in this codebase passed a
// signal of its own. Fake timers keep the test instant.
describe('AI request timeout', () => {
  const req = {
    provider: 'openai',
    apiKey: 'sk-test',
    systemPrompt: 'SYS',
    userPrompt: 'USER',
  }

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  /** A fetch that never settles, and rejects if the signal aborts. */
  function hangingFetch() {
    return vi.fn(
      (_url: string, init: { signal?: AbortSignal }) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          )
        })
    )
  }

  it('callAI gives up once the deadline passes', async () => {
    vi.stubGlobal('fetch', hangingFetch())
    vi.useFakeTimers()
    // Attach the assertion before advancing: the rejection happens during the
    // tick, and a promise with no handler by then counts as an unhandled
    // rejection rather than a test failure.
    const assertion = expect(callAI({ ...req, timeoutMs: 5_000 })).rejects.toThrow(
      /did not respond within 5000ms/
    )
    await vi.advanceTimersByTimeAsync(5_001)
    await assertion
  })

  it('callAIStream gives up once the deadline passes', async () => {
    vi.stubGlobal('fetch', hangingFetch())
    vi.useFakeTimers()
    const run = async () => {
      for await (const _ of callAIStream({ ...req, timeoutMs: 5_000 })) {
        /* never yields */
      }
    }
    const assertion = expect(run()).rejects.toThrow(/did not respond within 5000ms/)
    await vi.advanceTimersByTimeAsync(5_001)
    await assertion
  })

  it('does not fire when the provider answers in time', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ choices: [{ message: { content: 'FAST' } }] }), {
            status: 200,
          })
      )
    )
    vi.useFakeTimers()
    await expect(callAI({ ...req, timeoutMs: 5_000 })).resolves.toBe('FAST')
  })

  it('a caller-initiated cancel is reported as an abort, not a timeout', async () => {
    vi.stubGlobal('fetch', hangingFetch())
    const controller = new AbortController()
    const p = callAI({ ...req, signal: controller.signal, timeoutMs: 60_000 })
    controller.abort()
    // The message must not claim a timeout the caller did not cause.
    await expect(p).rejects.not.toThrow(/did not respond/)
  })
})

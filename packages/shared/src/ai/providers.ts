import { AIProviderInfo } from '../types'
import { AI_PROVIDERS } from '../constants'

/** Wire protocol used by each provider (PRD §6.2.1, §8.4). */
type Protocol = 'openai-compatible' | 'anthropic' | 'google'

const PROVIDER_PROTOCOLS: Record<string, Protocol> = {
  openai: 'openai-compatible',
  omniroute: 'openai-compatible',
  tokenrouter: 'openai-compatible',
  '9router': 'openai-compatible',
  custom: 'openai-compatible',
  anthropic: 'anthropic',
  google: 'google',
}

const DEFAULT_BASE_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  google: 'https://generativelanguage.googleapis.com/v1beta',
  omniroute: 'https://omniroute.io/api/v1',
  tokenrouter: 'https://api.tokenrouter.com/v1',
  '9router': 'https://api.9router.ai/v1',
  custom: '',
}

export function getProtocol(providerId: string): Protocol {
  return PROVIDER_PROTOCOLS[providerId] ?? 'openai-compatible'
}

export function getDefaultModel(providerId: string): string {
  const p = AI_PROVIDERS.find((x) => x.id === providerId)
  return p && p.models.length > 0 ? (p.models[0] as string) : 'auto'
}

/** Resolve the API base URL, allowing custom OpenAI-compatible endpoints (PRD §6.2.1). */
export function resolveBaseUrl(providerId: string, customBaseUrl?: string): string {
  if (customBaseUrl) return customBaseUrl.replace(/\/+$/, '')
  if (providerId === 'custom') throw new Error('Custom provider requires a base URL')
  const base = DEFAULT_BASE_URLS[providerId]
  if (!base) throw new Error(`Unknown provider: ${providerId}`)
  return base
}

export interface AIRequest {
  provider: string
  apiKey: string
  model?: string
  systemPrompt: string
  userPrompt: string
  /** Force JSON mode where the protocol supports it (full PRD generation). */
  jsonMode?: boolean
  /** Override base URL for custom OpenAI-compatible endpoints. */
  customBaseUrl?: string
  signal?: AbortSignal
}

interface BuiltRequest {
  url: string
  headers: Record<string, string>
  body: Record<string, unknown>
  protocol: Protocol
}

function buildRequest(req: AIRequest, stream: boolean): BuiltRequest {
  const protocol = getProtocol(req.provider)
  const model = req.model || getDefaultModel(req.provider)
  const base = resolveBaseUrl(req.provider, req.customBaseUrl)

  if (protocol === 'anthropic') {
    return {
      url: `${base}/messages`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': req.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: {
        model,
        system: req.systemPrompt,
        messages: [{ role: 'user', content: req.userPrompt }],
        temperature: 0.7,
        max_tokens: 4096,
        ...(stream ? { stream: true } : {}),
      },
      protocol,
    }
  }

  if (protocol === 'google') {
    return {
      url: `${base}/models/${model}:${stream ? 'streamGenerateContent?alt=sse' : 'generateContent'}`,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': req.apiKey,
      },
      body: {
        contents: [{ role: 'user', parts: [{ text: `${req.systemPrompt}\n\n${req.userPrompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      },
      protocol,
    }
  }

  // openai-compatible (OpenAI, OmniRoute, TokenRouter, 9Router, custom)
  return {
    url: `${base}/chat/completions`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${req.apiKey}`,
    },
    body: {
      model,
      messages: [
        { role: 'system', content: req.systemPrompt },
        { role: 'user', content: req.userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 16000,
      ...(req.jsonMode && req.provider === 'openai' ? { response_format: { type: 'json_object' } } : {}),
      ...(stream ? { stream: true } : {}),
    },
    protocol,
  }
}

function extractFullText(protocol: Protocol, json: any): string {
  if (protocol === 'anthropic') return json?.content?.[0]?.text ?? ''
  if (protocol === 'google') return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return json?.choices?.[0]?.message?.content ?? ''
}

function extractStreamDelta(protocol: Protocol, json: any): string {
  if (protocol === 'anthropic') {
    return json?.type === 'content_block_delta' ? (json?.delta?.text ?? '') : ''
  }
  if (protocol === 'google') {
    return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  }
  return json?.choices?.[0]?.delta?.content ?? ''
}

async function describeError(res: Response): Promise<string> {
  let detail = ''
  try {
    detail = (await res.text()).slice(0, 300)
  } catch {
    /* ignore */
  }
  return `AI provider error ${res.status} ${res.statusText}${detail ? `: ${detail}` : ''}`
}

/** Non-streaming completion. Returns the full text content. */
export async function callAI(req: AIRequest): Promise<string> {
  const { url, headers, body, protocol } = buildRequest(req, false)
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: req.signal,
  })
  if (!res.ok) throw new Error(await describeError(res))
  const json = await res.json()
  return extractFullText(protocol, json)
}

/** Parse an SSE body into JSON events. */
async function* parseSSE(res: Response): AsyncGenerator<any> {
  if (!res.body) throw new Error('Streaming not supported by response body')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (!data || data === '[DONE]') continue
      try {
        yield JSON.parse(data)
      } catch {
        /* skip malformed keep-alive lines */
      }
    }
  }
}

/** Streaming completion (PRD §6.2.4). Yields text deltas token by token. */
export async function* callAIStream(req: AIRequest): AsyncGenerator<string> {
  const { url, headers, body, protocol } = buildRequest(req, true)
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: req.signal,
  })
  if (!res.ok) throw new Error(await describeError(res))
  for await (const evt of parseSSE(res)) {
    const delta = extractStreamDelta(protocol, evt)
    if (delta) yield delta
  }
}

/** List providers with configured status (GET /api/ai/providers — PRD §10.3). */
export function listProviders(configuredProviderIds: string[] = []): AIProviderInfo[] {
  return AI_PROVIDERS.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    models: [...p.models],
    configured: configuredProviderIds.includes(p.id),
  }))
}

/** Validate an API key by hitting the provider's models endpoint (PRD §6.2.2). */
export async function testProviderConnection(
  providerId: string,
  apiKey: string,
  customBaseUrl?: string
): Promise<boolean> {
  try {
    const base = resolveBaseUrl(providerId, customBaseUrl)
    const protocol = getProtocol(providerId)
    const headers: Record<string, string> =
      protocol === 'anthropic'
        ? { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
        : protocol === 'google'
          ? { 'x-goog-api-key': apiKey }
          : { Authorization: `Bearer ${apiKey}` }
    const res = await fetch(`${base}/models`, { headers })
    return res.ok
  } catch {
    return false
  }
}


import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateId,
  parseAIResponse,
  maskApiKey,
  encryptSecret,
  decryptSecret,
  slugify,
  truncate,
  formatDate,
  isSafeExternalUrl,
} from './index'

const KEY_64 = 'a'.repeat(64)
const KEY_64_B = 'b'.repeat(64)

describe('generateId', () => {
  it('returns a valid UUID format', () => {
    expect(generateId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    )
  })
  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})

describe('parseAIResponse', () => {
  it('parses plain JSON', () => {
    expect(parseAIResponse('{"a":1}')).toEqual({ a: 1 })
  })
  it('parses JSON with surrounding whitespace', () => {
    expect(parseAIResponse('  \n{"a":1}\n  ')).toEqual({ a: 1 })
  })
  it('extracts JSON from surrounding prose (PRD §6.2.3)', () => {
    const prose = 'Here is your PRD:\n{"title":"X","features":[]}\nHope it helps!'
    expect(parseAIResponse(prose)).toEqual({ title: 'X', features: [] })
  })
  it('extracts JSON from markdown fences', () => {
    expect(parseAIResponse('```json\n{"a":true}\n```')).toEqual({ a: true })
  })
  it('throws when no JSON object is present', () => {
    expect(() => parseAIResponse('no json here at all')).toThrow(
      'Failed to parse AI response as JSON'
    )
  })
  it('throws on malformed braces', () => {
    expect(() => parseAIResponse('{broken json}')).toThrow()
  })
})

describe('maskApiKey', () => {
  it('masks keys longer than 8 chars: first 4 + **** + last 4 (PRD §15)', () => {
    expect(maskApiKey('sk-fake-test-key-1234567890')).toBe('sk-f****7890')
  })
  it('fully masks keys of 8 chars or fewer', () => {
    expect(maskApiKey('12345678')).toBe('****')
    expect(maskApiKey('short')).toBe('****')
  })
})

describe('encryptSecret / decryptSecret (AES-256-GCM, PRD §7.2)', () => {
  it('roundtrips a secret', async () => {
    const enc = await encryptSecret('sk-my-secret-api-key', KEY_64)
    expect(enc).not.toContain('sk-my-secret')
    expect(await decryptSecret(enc, KEY_64)).toBe('sk-my-secret-api-key')
  })
  it('produces unique ciphertext per call (random IV)', async () => {
    const a = await encryptSecret('same-input', KEY_64)
    const b = await encryptSecret('same-input', KEY_64)
    expect(a).not.toBe(b)
  })
  it('fails to decrypt with the wrong key', async () => {
    const enc = await encryptSecret('secret', KEY_64)
    await expect(decryptSecret(enc, KEY_64_B)).rejects.toThrow()
  })
  it('rejects a non-64-hex encryption key', async () => {
    await expect(encryptSecret('x', 'tooshort')).rejects.toThrow(
      'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)'
    )
    await expect(encryptSecret('x', 'z'.repeat(64))).rejects.toThrow()
  })
})

describe('slugify', () => {
  it('converts text to a url-safe slug', () => {
    expect(slugify('Aplikasi Kasir Warung Kopi!')).toBe('aplikasi-kasir-warung-kopi')
  })
  it('collapses whitespace and hyphens, trims edges', () => {
    expect(slugify('  Hello   -- World  ')).toBe('hello-world')
  })
  it('removes non-word characters', () => {
    expect(slugify('PRD @#$ GenZ 2026')).toBe('prd-genz-2026')
  })
})

describe('truncate', () => {
  it('returns short text unchanged', () => {
    expect(truncate('short text')).toBe('short text')
  })
  it('truncates with ellipsis at the limit', () => {
    const out = truncate('a'.repeat(200), 120)
    expect(out.length).toBe(120)
    expect(out.endsWith('…')).toBe(true)
  })
  it('returns empty string unchanged', () => {
    expect(truncate('')).toBe('')
  })
  it('returns text exactly at max length unchanged', () => {
    const input = 'a'.repeat(120)
    expect(truncate(input, 120)).toBe(input)
    expect(truncate(input, 120).length).toBe(120)
  })
  it('ends with a single Unicode ellipsis and stays within max (URL-safe result)', () => {
    const out = truncate('https://example.com/' + 'x'.repeat(200), 60)
    expect(out.length).toBe(60)
    expect(out.endsWith('…')).toBe(true)
    expect(out).not.toContain('...')
  })
})

describe('formatDate', () => {
  it('formats in English by default', () => {
    const out = formatDate(new Date('2026-01-15T00:00:00Z'))
    expect(out).toMatch(/2026/)
  })
  it('formats in Indonesian when requested', () => {
    const out = formatDate(new Date('2026-01-15T00:00:00Z'), 'id')
    expect(out).toMatch(/2026/)
  })
})

describe('isSafeExternalUrl (SSRF guard, non-production carve-out)', () => {
  const savedEnv: Record<string, string | undefined> = {}
  const keysToSave = ['NODE_ENV']

  beforeEach(() => {
    for (const k of keysToSave) savedEnv[k] = process.env[k]
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    for (const k of keysToSave) {
      if (savedEnv[k] === undefined) delete process.env[k]
      else process.env[k] = savedEnv[k] as string
    }
  })

  it('rejects malformed URLs in all environments', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(isSafeExternalUrl('not-a-url')).toBe(false)
    vi.stubEnv('NODE_ENV', 'test')
    expect(isSafeExternalUrl('not-a-url')).toBe(false)
  })

  it('rejects non-http(s) protocols in all environments', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(isSafeExternalUrl('ftp://example.com/file')).toBe(false)
    vi.stubEnv('NODE_ENV', 'test')
    expect(isSafeExternalUrl('ftp://example.com/file')).toBe(false)
  })

  it('production: blocks loopback/link-local, allows public https', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(isSafeExternalUrl('http://127.0.0.1:8080')).toBe(false)
    expect(isSafeExternalUrl('http://169.254.169.254')).toBe(false)
    expect(isSafeExternalUrl('https://api.openai.com/v1')).toBe(true)
  })

  it('non-production: allows loopback/private so local AI mocks work', () => {
    vi.stubEnv('NODE_ENV', 'test')
    expect(isSafeExternalUrl('http://127.0.0.1:3999/v1')).toBe(true)
    expect(isSafeExternalUrl('https://api.openai.com/v1')).toBe(true)
  })

  it('non-production (development): allows loopback too', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(isSafeExternalUrl('http://127.0.0.1:3999/v1')).toBe(true)
    expect(isSafeExternalUrl('ftp://example.com/file')).toBe(false)
  })
})

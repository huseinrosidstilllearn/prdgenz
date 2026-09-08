import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCredential, configuredProviderIds, defaultProvider } from './env'

const ALL_ENV_KEYS = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_API_KEY',
  'OMNIROUTE_API_KEY',
  'TOKENROUTER_API_KEY',
  '9ROUTER_API_KEY',
  'CUSTOM_API_KEY',
  'CUSTOM_BASE_URL',
  'AI_DEFAULT_PROVIDER',
]

describe('getCredential (env-based keys, PRD §6.2.2)', () => {
  beforeEach(() => {
    for (const k of ALL_ENV_KEYS) delete process.env[k]
  })
  afterEach(() => {
    for (const k of ALL_ENV_KEYS) delete process.env[k]
  })

  it('returns the key for a configured provider', () => {
    process.env.OPENAI_API_KEY = 'sk-local'
    expect(getCredential('openai')).toEqual({ apiKey: 'sk-local' })
  })

  it('returns null for a provider without a key', () => {
    expect(getCredential('openai')).toBeNull()
  })

  it('returns null for an unknown provider id', () => {
    expect(getCredential('nope')).toBeNull()
  })

  it('requires CUSTOM_BASE_URL for the custom provider', () => {
    process.env.CUSTOM_API_KEY = 'k'
    expect(getCredential('custom')).toBeNull()
    process.env.CUSTOM_BASE_URL = 'https://llm.internal/v1'
    expect(getCredential('custom')).toEqual({
      apiKey: 'k',
      baseUrl: 'https://llm.internal/v1',
    })
  })
})

describe('configuredProviderIds', () => {
  beforeEach(() => {
    for (const k of ALL_ENV_KEYS) delete process.env[k]
  })

  it('lists only providers whose env keys are set', () => {
    process.env.ANTHROPIC_API_KEY = 'k1'
    process.env.TOKENROUTER_API_KEY = 'k2'
    expect(configuredProviderIds()).toEqual(['anthropic', 'tokenrouter'])
  })
})

describe('defaultProvider', () => {
  beforeEach(() => {
    for (const k of ALL_ENV_KEYS) delete process.env[k]
  })

  it('prefers AI_DEFAULT_PROVIDER when its key exists', () => {
    process.env.AI_DEFAULT_PROVIDER = 'google'
    process.env.GOOGLE_API_KEY = 'k'
    process.env.OPENAI_API_KEY = 'k'
    expect(defaultProvider()).toBe('google')
  })

  it('falls back to the first configured provider', () => {
    process.env.ANTHROPIC_API_KEY = 'k'
    expect(defaultProvider()).toBe('anthropic')
  })

  it('falls back to openai when nothing is configured', () => {
    expect(defaultProvider()).toBe('openai')
  })
})

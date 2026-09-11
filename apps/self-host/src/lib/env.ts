import { AI_PROVIDERS } from '@prdgenz/shared'

/**
 * Self-host API keys come from environment variables (PRD §6.2.2) —
 * there is no user account, so no encrypted key store is needed.
 */
const ENV_KEYS: Record<string, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
  omniroute: 'OMNIROUTE_API_KEY',
  tokenrouter: 'TOKENROUTER_API_KEY',
  '9router': '9ROUTER_API_KEY',
  custom: 'CUSTOM_API_KEY',
}

const ENV_BASE_URLS: Record<string, string> = {
  openai: 'OPENAI_BASE_URL',
  anthropic: 'ANTHROPIC_BASE_URL',
  google: 'GOOGLE_BASE_URL',
  omniroute: 'OMNIROUTE_BASE_URL',
  tokenrouter: 'TOKENROUTER_BASE_URL',
  '9router': '9ROUTER_BASE_URL',
  custom: 'CUSTOM_BASE_URL',
}

export interface EnvCredential {
  apiKey: string
  baseUrl?: string
}

export function getCredential(provider: string): EnvCredential | null {
  const envName = ENV_KEYS[provider]
  if (!envName) return null
  const apiKey = process.env[envName]
  if (!apiKey) return null
  const baseUrl = process.env[ENV_BASE_URLS[provider] ?? '']
  if (provider === 'custom' && !baseUrl) return null
  return { apiKey, baseUrl }
}

export function configuredProviderIds(): string[] {
  return AI_PROVIDERS.filter((p) => getCredential(p.id) !== null).map((p) => p.id)
}

export function defaultProvider(): string {
  const preferred = process.env.AI_DEFAULT_PROVIDER
  if (preferred && getCredential(preferred)) return preferred
  const configured = configuredProviderIds()
  return configured[0] ?? AI_PROVIDERS[0].id
}

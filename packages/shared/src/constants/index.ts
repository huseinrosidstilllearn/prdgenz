export const APP_NAME = 'PRD GenZ'
export const APP_VERSION = '0.0.1'
export const APP_DESCRIPTION = 'AI-powered PRD Generator'

export const PRD_SECTIONS = [
  'title',
  'summary',
  'problem',
  'targetUser',
  'features',
  'userStories',
  'acceptanceCriteria',
  'techStack',
  'timeline',
  'outputFormat',
] as const

export const PRD_SECTIONS_OPTIONAL = [
  'risks',
  'successMetrics',
  'openQuestions',
  'assumptions',
] as const

export const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', type: 'direct', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  { id: 'anthropic', name: 'Anthropic', type: 'direct', models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
  { id: 'google', name: 'Google', type: 'direct', models: ['gemini-2.0-flash', 'gemini-1.5-pro'] },
  { id: 'omniroute', name: 'OmniRoute', type: 'aggregator', models: ['auto'] },
  { id: 'tokenrouter', name: 'TokenRouter', type: 'aggregator', models: ['auto'] },
  { id: '9router', name: '9Router', type: 'aggregator', models: ['auto'] },
  { id: 'custom', name: 'Custom (OpenAI-compatible)', type: 'direct', models: [] },
] as const

export const LANGUAGES = [
  { id: 'id', name: 'Bahasa Indonesia', code: 'ID' },
  { id: 'en', name: 'English', code: 'EN' },
] as const

/** Wizard steps (PRD §6.1.1) */
export const WIZARD_STEPS = [
  'idea',
  'targetUser',
  'features',
  'userStories',
  'acceptanceCriteria',
  'techStack',
  'timeline',
  'outputFormat',
] as const

/** Free plan: max PRD per month (PRD §14) */
export const FREE_PLAN_LIMIT = 10

/** Pro plan price in USD per month (PRD §14) */
export const PRO_PRICE = 9

/** Rate limit: requests per minute per user (PRD §7.2) */
export const RATE_LIMIT_PER_MINUTE = 100

export const EXPORT_FORMATS = ['markdown', 'pdf', 'ai-prompt'] as const

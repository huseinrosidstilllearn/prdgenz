import { describe, it, expect } from 'vitest'
import {
  wizardInputSchema,
  oneShotInputSchema,
  chatMessageSchema,
  generateRequestSchema,
  prdContentSchema,
  registerSchema,
  loginSchema,
} from './index'

describe('wizardInputSchema', () => {
  it('accepts a complete wizard input', () => {
    const r = wizardInputSchema.safeParse({
      idea: 'Aplikasi kasir untuk warung kopi',
      problem: 'Pencatatan manual',
      targetUser: 'Pemilik warung',
      features: ['Login', 'Laporan penjualan'],
    })
    expect(r.success).toBe(true)
  })
  it('rejects an idea shorter than 3 chars', () => {
    const r = wizardInputSchema.safeParse({ idea: 'ab' })
    expect(r.success).toBe(false)
  })
  it('rejects more than 30 features', () => {
    const r = wizardInputSchema.safeParse({
      idea: 'valid idea here',
      features: Array.from({ length: 31 }, () => 'feature'),
    })
    expect(r.success).toBe(false)
  })
})

describe('oneShotInputSchema', () => {
  it('accepts an idea of >= 10 chars with optional constraints', () => {
    const r = oneShotInputSchema.safeParse({
      idea: 'Aplikasi kasir warung kopi dengan inventaris',
      constraints: 'Harus offline-first',
    })
    expect(r.success).toBe(true)
  })
  it('rejects an idea shorter than 10 chars', () => {
    expect(oneShotInputSchema.safeParse({ idea: 'too short' }).success).toBe(false)
  })
})

describe('chatMessageSchema', () => {
  it('accepts user and assistant roles', () => {
    expect(chatMessageSchema.safeParse({ role: 'user', content: 'hello' }).success).toBe(true)
    expect(chatMessageSchema.safeParse({ role: 'assistant', content: 'hi' }).success).toBe(true)
  })
  it('rejects other roles and empty content', () => {
    expect(chatMessageSchema.safeParse({ role: 'system', content: 'hi' }).success).toBe(false)
    expect(chatMessageSchema.safeParse({ role: 'user', content: '' }).success).toBe(false)
  })
})

describe('generateRequestSchema (superRefine per mode)', () => {
  const base = {
    language: 'EN' as const,
    provider: 'openai',
    mode: 'WIZARD' as const,
  }

  it('validates WIZARD mode against wizardInputSchema', () => {
    const ok = generateRequestSchema.safeParse({
      ...base,
      input: { idea: 'A good product idea' },
    })
    expect(ok.success).toBe(true)

    const bad = generateRequestSchema.safeParse({ ...base, input: { idea: 'no' } })
    expect(bad.success).toBe(false)
    if (!bad.success) {
      expect(bad.error.issues.some((i) => i.path[0] === 'input')).toBe(true)
    }
  })

  it('validates ONESHOT mode against oneShotInputSchema', () => {
    const ok = generateRequestSchema.safeParse({
      ...base,
      mode: 'ONESHOT',
      input: { idea: 'A sufficiently long product idea' },
    })
    expect(ok.success).toBe(true)

    const bad = generateRequestSchema.safeParse({
      ...base,
      mode: 'ONESHOT',
      input: { idea: 'short' },
    })
    expect(bad.success).toBe(false)
    if (!bad.success) {
      expect(bad.error.issues.some((i) => i.message === 'Invalid one-shot input')).toBe(true)
    }
  })

  it('validates CHAT mode against an array of messages', () => {
    const ok = generateRequestSchema.safeParse({
      ...base,
      mode: 'CHAT',
      input: [{ role: 'user', content: 'I want to build something' }],
    })
    expect(ok.success).toBe(true)

    const bad = generateRequestSchema.safeParse({ ...base, mode: 'CHAT', input: {} })
    expect(bad.success).toBe(false)
  })

  it('rejects an invalid language or mode value', () => {
    expect(
      generateRequestSchema.safeParse({ ...base, language: 'FR', input: { idea: 'an idea' } })
        .success
    ).toBe(false)
    expect(
      generateRequestSchema.safeParse({ ...base, mode: 'VOICE', input: { idea: 'an idea' } })
        .success
    ).toBe(false)
  })

  it('validates customBaseUrl as a URL when present', () => {
    const ok = generateRequestSchema.safeParse({
      ...base,
      customBaseUrl: 'https://my-proxy.example.com/v1',
      input: { idea: 'an idea' },
    })
    expect(ok.success).toBe(true)
    const bad = generateRequestSchema.safeParse({
      ...base,
      customBaseUrl: 'not-a-url',
      input: { idea: 'an idea' },
    })
    expect(bad.success).toBe(false)
  })
})

describe('prdContentSchema (validates AI JSON output, PRD §6.3)', () => {
  const validContent = {
    title: 'Aplikasi Kasir',
    summary: 'Ringkasan',
    problem: 'Masalah pencatatan manual',
    targetUser: 'Pemilik warung',
    features: [{ id: 'f1', name: 'Login', description: 'Login user', priority: 'must' }],
    userStories: [{ id: 'us1', asA: 'pemilik', iWant: 'mencatat penjualan', soThat: 'laporan akurat' }],
    acceptanceCriteria: [{ id: 'ac1', featureId: 'f1', criteria: 'User bisa login' }],
    techStack: {
      frontend: ['Next.js'],
      backend: ['Node.js'],
      database: ['PostgreSQL'],
      infrastructure: ['Docker'],
      reasoning: 'Stabilitas',
    },
    timeline: [{ id: 't1', milestone: 'MVP', duration: '2 minggu', deliverables: ['Fitur inti'] }],
    outputFormat: 'Markdown',
  }

  it('accepts a complete PRD content object', () => {
    expect(prdContentSchema.safeParse(validContent).success).toBe(true)
  })
  it('accepts optional sections (risks, successMetrics, openQuestions)', () => {
    const r = prdContentSchema.safeParse({
      ...validContent,
      risks: [{ id: 'r1', description: 'd', impact: 'high', mitigation: 'm' }],
      successMetrics: ['MAU'],
      openQuestions: ['Q?'],
    })
    expect(r.success).toBe(true)
  })
  it('rejects content with no features (min 1)', () => {
    expect(prdContentSchema.safeParse({ ...validContent, features: [] }).success).toBe(false)
  })
  it('rejects an invalid feature priority', () => {
    expect(
      prdContentSchema.safeParse({
        ...validContent,
        features: [{ id: 'f1', name: 'X', description: 'd', priority: 'critical' }],
      }).success
    ).toBe(false)
  })
  it('rejects a missing required section (techStack)', () => {
    const { techStack: _omit, ...noStack } = validContent
    expect(prdContentSchema.safeParse(noStack).success).toBe(false)
  })
})

describe('registerSchema / loginSchema (PRD §6.4)', () => {
  it('accepts a valid registration', () => {
    expect(
      registerSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test1234!',
      }).success
    ).toBe(true)
  })
  it('rejects short passwords (<8)', () => {
    expect(
      registerSchema.safeParse({ name: 'X', email: 'a@b.co', password: 'short' }).success
    ).toBe(false)
  })
  it('rejects invalid emails', () => {
    expect(
      registerSchema.safeParse({ name: 'X', email: 'not-an-email', password: 'Test1234!' })
        .success
    ).toBe(false)
  })
  it('login only requires email + password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true)
    expect(loginSchema.safeParse({ email: 'bad', password: 'x' }).success).toBe(false)
  })
})

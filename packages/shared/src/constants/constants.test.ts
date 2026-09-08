import { describe, it, expect } from 'vitest'
import { AI_PROVIDERS, WIZARD_STEPS, FREE_PLAN_LIMIT, PRO_PRICE } from './index'

describe('AI_PROVIDERS (PRD §6.2.1)', () => {
  it('lists exactly the 7 supported providers', () => {
    expect(AI_PROVIDERS).toHaveLength(7)
    expect(AI_PROVIDERS.map((p) => p.id)).toEqual([
      'openai',
      'anthropic',
      'google',
      'omniroute',
      'tokenrouter',
      '9router',
      'custom',
    ])
  })
  it('marks direct vs aggregator providers', () => {
    const types = Object.fromEntries(AI_PROVIDERS.map((p) => [p.id, p.type]))
    expect(types.openai).toBe('direct')
    expect(types.anthropic).toBe('direct')
    expect(types.google).toBe('direct')
    expect(types.omniroute).toBe('aggregator')
    expect(types.tokenrouter).toBe('aggregator')
    expect(types['9router']).toBe('aggregator')
    expect(types.custom).toBe('direct')
  })
  it('gives direct providers at least one default model', () => {
    for (const p of AI_PROVIDERS.filter((x) => x.id !== 'custom')) {
      expect(p.models.length).toBeGreaterThan(0)
    }
  })
})

describe('WIZARD_STEPS (PRD §6.1)', () => {
  it('defines the 8 wizard steps in order', () => {
    expect(WIZARD_STEPS).toHaveLength(8)
  })
})

describe('plan constants (PRD §14)', () => {
  it('free plan allows 10 PRDs per 30 days', () => {
    expect(FREE_PLAN_LIMIT).toBe(10)
  })
  it('pro plan costs $9/month', () => {
    expect(PRO_PRICE).toBe(9)
  })
})

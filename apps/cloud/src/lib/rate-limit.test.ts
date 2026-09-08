import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimit } from './rate-limit'

describe('rateLimit (100 req/min per key, PRD §7.2)', () => {
  beforeEach(() => {
    // Each test uses a fresh key so the module-level buckets map stays isolated
  })

  it('allows the first 100 requests within the window', () => {
    const key = `t-allow-${Math.random()}`
    for (let i = 0; i < 100; i++) {
      expect(rateLimit(key)).toBe(true)
    }
  })

  it('blocks request 101 within the same window', () => {
    const key = `t-block-${Math.random()}`
    for (let i = 0; i < 100; i++) rateLimit(key)
    expect(rateLimit(key)).toBe(false)
    expect(rateLimit(key)).toBe(false)
  })

  it('tracks keys independently', () => {
    const keyA = `t-a-${Math.random()}`
    const keyB = `t-b-${Math.random()}`
    for (let i = 0; i < 100; i++) rateLimit(keyA)
    expect(rateLimit(keyA)).toBe(false)
    expect(rateLimit(keyB)).toBe(true)
  })

  it('allows again after the window slides (1ms window edge case)', async () => {
    const key = `t-slide-${Math.random()}`
    for (let i = 0; i < 100; i++) rateLimit(key, 100, 5) // 5ms window
    expect(rateLimit(key, 100, 5)).toBe(false)
    await new Promise((r) => setTimeout(r, 20))
    expect(rateLimit(key, 100, 5)).toBe(true)
  })

  it('supports a custom limit', () => {
    const key = `t-custom-${Math.random()}`
    expect(rateLimit(key, 2)).toBe(true)
    expect(rateLimit(key, 2)).toBe(true)
    expect(rateLimit(key, 2)).toBe(false)
  })
})

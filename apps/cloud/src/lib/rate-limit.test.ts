import { describe, it, expect, afterEach, vi } from 'vitest'
import { rateLimit } from './rate-limit'

describe('rateLimit (100 req/min per key, PRD §7.2)', () => {
  afterEach(() => {
    vi.useRealTimers()
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

  it('allows again after the window slides', () => {
    // Frozen clock. The 5ms window used to be measured against the wall clock,
    // so on a loaded runner the 100-call loop could itself take longer than the
    // window; the first timestamps were pruned mid-loop and request 101 came
    // back allowed. That made this a coin flip rather than a test.
    vi.useFakeTimers()
    vi.setSystemTime(1_700_000_000_000)

    const key = `t-slide-${Math.random()}`
    for (let i = 0; i < 100; i++) {
      expect(rateLimit(key, 100, 5)).toBe(true)
    }
    expect(rateLimit(key, 100, 5)).toBe(false)

    vi.advanceTimersByTime(6)
    expect(rateLimit(key, 100, 5)).toBe(true)
  })

  it('supports a custom limit', () => {
    const key = `t-custom-${Math.random()}`
    expect(rateLimit(key, 2)).toBe(true)
    expect(rateLimit(key, 2)).toBe(true)
    expect(rateLimit(key, 2)).toBe(false)
  })
})

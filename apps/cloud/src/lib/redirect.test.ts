import { describe, it, expect } from 'vitest'
import { safeCallbackUrl } from './redirect'

describe('safeCallbackUrl (open-redirect guard)', () => {
  it('falls back on null/undefined/empty', () => {
    expect(safeCallbackUrl(null)).toBe('/dashboard')
    expect(safeCallbackUrl(undefined)).toBe('/dashboard')
    expect(safeCallbackUrl('')).toBe('/dashboard')
  })

  it('keeps relative paths', () => {
    expect(safeCallbackUrl('/prd/x')).toBe('/prd/x')
    expect(safeCallbackUrl('/dashboard?x=1')).toBe('/dashboard?x=1')
  })

  it('blocks absolute and protocol-relative URLs', () => {
    expect(safeCallbackUrl('https://evil.com')).toBe('/dashboard')
    expect(safeCallbackUrl('//evil.com')).toBe('/dashboard')
    expect(safeCallbackUrl('http://evil.com/x')).toBe('/dashboard')
  })

  it('blocks backslash tricks and non-relative values', () => {
    expect(safeCallbackUrl('/\\evil')).toBe('/dashboard')
    expect(safeCallbackUrl('\\evil')).toBe('/dashboard')
    expect(safeCallbackUrl('dashboard')).toBe('/dashboard')
  })
})


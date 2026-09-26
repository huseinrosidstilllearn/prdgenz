import { describe, it, expect } from 'vitest'
import { resolveVersionPair } from './resolve-pair'

describe('resolveVersionPair', () => {
  it('uses an explicit pair when both versions exist and differ', () => {
    expect(resolveVersionPair([3, 2, 1], 3, '1', '3')).toEqual({ from: 1, to: 3 })
  })

  it('falls back to the previous version when no pair is given', () => {
    expect(resolveVersionPair([3, 2, 1], 3)).toEqual({ from: 2, to: 3 })
  })

  it('falls back when the query names a version that does not exist', () => {
    expect(resolveVersionPair([3, 2, 1], 3, '9', '3')).toEqual({ from: 2, to: 3 })
  })

  it('falls back when the query is not a number', () => {
    expect(resolveVersionPair([3, 2, 1], 3, 'abc', 'xyz')).toEqual({ from: 2, to: 3 })
  })

  it('rejects a pair where both sides are the same version', () => {
    // Asking to diff v2 against v2 is not a comparison, so this must fall back
    // rather than render an empty diff.
    expect(resolveVersionPair([3, 2, 1], 3, '2', '2')).toEqual({ from: 2, to: 3 })
  })

  it('returns null when only one version exists', () => {
    expect(resolveVersionPair([3], 3)).toBeNull()
  })

  it('returns null when the current version is the oldest', () => {
    expect(resolveVersionPair([1, 2], 1)).toBeNull()
  })
})

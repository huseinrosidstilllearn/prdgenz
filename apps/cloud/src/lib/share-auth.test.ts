import { describe, it, expect } from 'vitest'
import { shareAuthCookieName, shareAuthValue, shareAuthValid } from './share-auth'
import { createHash } from 'crypto'

const shareId = 'aplikasi-kasir-abc12345'
const hash = '$2a$10$abcdefghijklmnopqrstuv'

describe('share-auth helpers (PRD §6.7 gate cookie)', () => {
  it('cookie name uses the first 8 chars of the shareId', () => {
    expect(shareAuthCookieName(shareId)).toBe('shareAuth_aplikasi')
  })

  it('signed value is sha256(shareId + passwordHash)', () => {
    const expected = createHash('sha256').update(shareId + hash).digest('hex')
    expect(shareAuthValue(shareId, hash)).toBe(expected)
    expect(shareAuthValue(shareId, hash)).not.toBe(shareAuthValue('other-share', hash))
  })

  it('validates a matching cookie value', () => {
    const value = shareAuthValue(shareId, hash)
    expect(shareAuthValid({ get: () => ({ value }) }, shareId, hash)).toBe(true)
  })

  it('rejects a missing or wrong cookie value', () => {
    expect(shareAuthValid({ get: () => undefined }, shareId, hash)).toBe(false)
    expect(shareAuthValid({ get: () => ({ value: 'deadbeef' }) }, shareId, hash)).toBe(false)
    // value for a different share must not validate
    const otherShare = shareAuthValue('other-share', hash)
    expect(shareAuthValid({ get: () => ({ value: otherShare }) }, shareId, hash)).toBe(false)
  })

  it('invalidates when the owner rotates the password (hash changes)', () => {
    const value = shareAuthValue(shareId, hash)
    expect(shareAuthValid({ get: () => ({ value }) }, shareId, '$2a$10$newhashnewhash')).toBe(false)
  })
})
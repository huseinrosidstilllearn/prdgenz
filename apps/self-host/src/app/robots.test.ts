import { describe, it, expect } from 'vitest'
import robots from './robots'

describe('robots (S4 — private instance SEO)', () => {
  it('disallows all user agents from every path (noindex)', () => {
    const result = robots()
    expect(result.rules).toEqual({
      userAgent: '*',
      disallow: '/',
    })
  })

  it('does not link a sitemap (private instance)', () => {
    const result = robots()
    expect(result.sitemap).toBeUndefined()
  })
})

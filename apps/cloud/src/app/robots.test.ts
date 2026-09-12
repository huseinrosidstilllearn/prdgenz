import { describe, it, expect } from 'vitest'
import robots from './robots'

describe('robots (T4 — SEO)', () => {
  it('allows all user agents, disallows private areas, links the sitemap', () => {
    const result = robots()
    expect(result.rules).toEqual({
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/settings', '/prd'],
    })
    expect(result.sitemap).toBe('http://localhost:3000/sitemap.xml')
  })
})

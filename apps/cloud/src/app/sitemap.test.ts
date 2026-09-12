import { describe, it, expect } from 'vitest'
import sitemap from './sitemap'

describe('sitemap (T4 — SEO)', () => {
  it('lists the public routes with absolute URLs', () => {
    const result = sitemap()
    expect(result.map((e) => e.url)).toEqual([
      'http://localhost:3000',
      'http://localhost:3000/pricing',
      'http://localhost:3000/login',
      'http://localhost:3000/register',
    ])
    for (const entry of result) {
      expect(entry.lastModified).toBeInstanceOf(Date)
    }
  })
})

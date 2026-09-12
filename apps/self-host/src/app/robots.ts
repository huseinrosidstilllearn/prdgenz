import type { MetadataRoute } from 'next'

/** Private single-user instance — disallow everything from crawlers (PRD §8.5.2). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}

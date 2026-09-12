import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const lastModified = new Date()

  return [
    { url: appUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/login`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${appUrl}/register`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
  ]
}

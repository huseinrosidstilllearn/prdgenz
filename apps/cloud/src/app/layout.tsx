import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ThemeProvider } from '@prdgenz/ui'
import { fontVariables } from '@prdgenz/ui/fonts'
import './globals.css'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'PRD GenZ',
    template: '%s | PRD GenZ',
  },
  description:
    'AI-powered PRD Generator: turn raw ideas into structured, actionable PRDs in minutes.',
  openGraph: {
    title: 'PRD GenZ',
    description:
      'AI-powered PRD Generator: turn raw ideas into structured, actionable PRDs in minutes.',
    type: 'website',
    siteName: 'PRD GenZ',
    images: [{ url: '/og-image.png', width: 2560, height: 1280, alt: 'PRD GenZ' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // fontVariables lives on <html>: tokens.css resolves --font-sans at :root,
    // so the next/font variables must exist on the same element or the whole
    // chain computes invalid and every font falls back to Times.
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <body className="min-h-screen antialiased">
        <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
      </body>
    </html>
  )
}


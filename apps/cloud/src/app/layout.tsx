import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DM_Sans, Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Visual language synced to ngodingpakeai.com: DM Sans display + Inter body.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'PRD GenZ',
    template: '%s | PRD GenZ',
  },
  description:
    'AI-powered PRD Generator — turn raw ideas into structured, actionable PRDs in minutes.',
  openGraph: {
    title: 'PRD GenZ',
    description:
      'AI-powered PRD Generator — turn raw ideas into structured, actionable PRDs in minutes.',
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${dmSans.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

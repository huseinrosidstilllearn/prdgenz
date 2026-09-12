import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

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
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

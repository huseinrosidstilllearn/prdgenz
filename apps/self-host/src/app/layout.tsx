import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import './globals.css'

// Private single-user instance (PRD §8.5.2) — never index user PRD data.
export const metadata: Metadata = {
  title: {
    default: 'PRD GenZ — Self-Hosted',
    template: '%s | PRD GenZ',
  },
  description:
    'Self-hosted AI-powered PRD Generator — your data and API keys stay on your machine.',
  robots: {
    index: false,
    follow: false,
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
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

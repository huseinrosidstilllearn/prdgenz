import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PRD GenZ — Self-Hosted',
    template: '%s | PRD GenZ',
  },
  description:
    'Self-hosted AI-powered PRD Generator — your data and API keys stay on your machine.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

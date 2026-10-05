import type { ReactNode } from 'react'
import { AppShell } from '@prdgenz/app'

export default function NewDocumentLayout({ children }: { children: ReactNode }) {
  return <AppShell maxWidth="4xl" nav={[
    { href: '/dashboard', label: 'PRDs' },
    { href: '/prd/new', label: 'New PRD', active: true },
    { href: '/settings', label: 'Settings' },
  ]}>{children}</AppShell>
}

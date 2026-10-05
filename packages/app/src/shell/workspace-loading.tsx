import { AppShell } from './app-shell'
import { PageHeader } from './page-header'

export function WorkspaceLoading({ homeHref }: { homeHref: '/' | '/dashboard' }) {
  return <AppShell maxWidth="4xl" nav={[
    { href: homeHref, label: 'PRDs', active: true },
    { href: '/prd/new', label: 'New PRD' },
    { href: '/settings', label: 'Settings' },
  ]}>
    <PageHeader title="Your documents" eyebrow="Workspace" />
    <div role="status" className="rounded-lg border bg-card p-6">
      <p className="text-sm font-medium">Loading your workspace...</p>
      <p className="mt-2 text-sm text-muted-foreground">Fetching your documents. They will appear here when ready.</p>
    </div>
  </AppShell>
}

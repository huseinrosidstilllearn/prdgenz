import Link from 'next/link'
import { AppShell, PageHeader, PRDList, WorkspaceStart } from '@prdgenz/app'
import { Badge, Button } from '@prdgenz/ui'
import { prisma } from '@/lib/prisma'
import { configuredProviderIds, defaultProvider } from '@/lib/env'

// This page queries SQLite on every request — never prerender at build time.
export const dynamic = 'force-dynamic'

/** Self-host home: list all PRDs, single-user, no auth (PRD §8.5.2). */
export default async function Home() {
  const prds = await prisma.pRD.findMany({ orderBy: { updatedAt: 'desc' } })
  const configured = configuredProviderIds()

  return (
    <AppShell
      maxWidth="4xl"
      nav={[
        { href: '/', label: 'PRDs', active: true },
        { href: '/prd/new', label: 'New PRD' },
        { href: '/settings', label: 'Settings' },
      ]}
      headerExtra={
        <Badge variant={configured.length ? 'success' : 'destructive'}>
          {configured.length
            ? `${configured.length} provider${configured.length === 1 ? '' : 's'} ready`
            : 'no key set'}
        </Badge>
      }
    >
      <PageHeader
        eyebrow="Self-hosted"
        title="Your documents"
        description={
          <>
            Stored locally in SQLite. Default provider:{' '}
            <span className="font-mono">{defaultProvider()}</span>.
          </>
        }
        actions={
          <Button asChild>
            <Link href="/prd/new">New PRD</Link>
          </Button>
        }
      />

      {prds.length === 0 ? (
        <WorkspaceStart providerConfigured={configured.length > 0} />
      ) : (
        <PRDList
          items={prds.map((prd) => ({
            id: prd.id,
            title: prd.title,
            version: prd.currentVersion,
            mode: prd.mode,
            language: prd.language as 'ID' | 'EN',
            updatedAt: prd.updatedAt.toISOString(),
          }))}
        />
      )}
    </AppShell>
  )
}

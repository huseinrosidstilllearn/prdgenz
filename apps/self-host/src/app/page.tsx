import Link from 'next/link'
import { AppShell, EmptyState, PageHeader, PRDList } from '@prdgenz/app'
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
        <EmptyState
          title="No PRDs yet"
          body="Write down the idea you have in mind. The model will turn it into a structured document you can iterate on."
          action={
            <Button asChild>
              <Link href="/prd/new">Create your first PRD</Link>
            </Button>
          }
        />
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


import Link from 'next/link'
import { Badge } from '@prdgenz/ui'
import { prisma } from '@/lib/prisma'
import { configuredProviderIds, defaultProvider } from '@/lib/env'
import { truncate } from '@prdgenz/shared'

// This page queries SQLite on every request — never prerender at build time.
export const dynamic = 'force-dynamic'

/** Self-host home: list all PRDs, single-user, no auth (PRD §8.5.2). */
export default async function Home() {
  const prds = await prisma.pRD.findMany({ orderBy: { updatedAt: 'desc' } })
  const configured = configuredProviderIds()
  const defProvider = defaultProvider()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            PRD GenZ <span className="text-sm font-normal text-muted-foreground">self-hosted</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/prd/new" className="text-muted-foreground hover:text-foreground">
              New PRD
            </Link>
            <Link href="/settings" className="text-muted-foreground hover:text-foreground">
              Settings
            </Link>
            <Badge variant={configured.length ? 'default' : 'destructive'}>
              {configured.length ? `${configured.length} provider(s) ready` : 'no key set'}
            </Badge>
          </nav>
        </div>
      </header>

      <main className="container flex-1 space-y-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Your PRDs</h1>
            <p className="text-sm text-muted-foreground">
              Stored locally in SQLite · default provider:{' '}
              <span className="font-medium">{defProvider}</span>
            </p>
          </div>
          <Link
            href="/prd/new"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            New PRD
          </Link>
        </div>

        {prds.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <h2 className="mb-2 text-lg font-semibold">No PRDs yet</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Turn your first raw idea into a structured PRD.
            </p>
            <Link
              href="/prd/new"
              className="text-sm underline underline-offset-4"
            >
              Create your first PRD
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prds.map((prd) => (
              <Link
                key={prd.id}
                href={`/prd/${prd.id}`}
                className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="mb-1 font-medium">{truncate(prd.title, 60)}</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  v{prd.currentVersion} · {prd.mode.toLowerCase()} mode ·{' '}
                  {prd.language === 'ID' ? 'Bahasa Indonesia' : 'English'}
                </p>
                <Badge variant="secondary">{new Date(prd.updatedAt).toLocaleDateString()}</Badge>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

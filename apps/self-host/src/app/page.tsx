import Link from 'next/link'
import { Badge, Button, ThemeToggle } from '@prdgenz/ui'
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between px-2 sm:px-3">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="font-heading font-bold tracking-tight">
              prd<span className="text-primary">genz</span>
            </span>{' '}
            <span className="text-xs font-normal text-muted-foreground">self-hosted</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-4">
            <Link
              href="/prd/new"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              New PRD
            </Link>
            <Link
              href="/settings"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Settings
            </Link>
            <ThemeToggle />
            <Badge variant={configured.length ? 'default' : 'destructive'}>
              {configured.length ? `${configured.length} provider(s) ready` : 'no key set'}
            </Badge>
          </nav>
        </div>
      </header>

      <main className="container flex-1 space-y-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold tracking-tight">Your PRDs</h1>
              {prds.length > 0 && (
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {prds.length} PRD
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Stored locally in SQLite · default provider:{' '}
              <span className="font-medium">{defProvider}</span>
            </p>
          </div>
          <Button asChild>
            <Link href="/prd/new">New PRD</Link>
          </Button>
        </div>

        {prds.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <h2 className="font-heading mb-2 text-lg font-bold">Belum ada PRD</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Ubah ide pertamamu jadi PRD terstruktur.
            </p>
            <Button asChild variant="outline">
              <Link href="/prd/new">Bikin PRD pertama</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prds.map((prd) => (
              <Link
                key={prd.id}
                href={`/prd/${prd.id}`}
                className="rounded-xl border bg-card p-5 shadow-sm transition-all duration-150 hover:-translate-y-1 hover:border-ring/40 hover:shadow-lg active:translate-y-0"
              >
                <p className="mb-1 font-semibold">{truncate(prd.title, 60)}</p>
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

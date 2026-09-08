import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { Badge } from '@prdgenz/ui'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateProjectButton } from '@/components/create-project'
import { FREE_PLAN_LIMIT } from '@prdgenz/shared'
import { truncate } from '@prdgenz/shared'

// Session + DB backed page — always render on demand.
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const [projects, prds, user] = await Promise.all([
    prisma.project.findMany({
      where: { userId: userId! },
      include: { _count: { select: { prds: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.pRD.findMany({
      where: { project: { userId: userId! } },
      include: { project: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    prisma.user.findUnique({ where: { id: userId! }, select: { role: true, name: true } }),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold">
            PRD GenZ
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/prd/new" className="text-muted-foreground hover:text-foreground">
              New PRD
            </Link>
            <Link href="/settings" className="text-muted-foreground hover:text-foreground">
              Settings
            </Link>
            <Badge variant={user?.role === 'PRO' ? 'default' : 'secondary'}>
              {user?.role ?? 'FREE'}
            </Badge>
          </nav>
        </div>
      </header>

      <main className="container flex-1 space-y-10 py-10">
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {user?.role === 'PRO'
                ? 'Unlimited PRDs — Pro plan'
                : `Free plan: ${FREE_PLAN_LIMIT} PRDs per 30 days`}
            </p>
          </div>
          <CreateProjectButton />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Recent PRDs</h2>
          {prds.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              <p className="mb-4">No PRDs yet.</p>
              <Link
                href="/prd/new"
                className="text-foreground underline underline-offset-4"
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
                    {prd.project.name} · v{prd.currentVersion} · {prd.mode.toLowerCase()}
                  </p>
                  <Badge variant="secondary">{prd.language === 'ID' ? 'Bahasa Indonesia' : 'English'}</Badge>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Projects</h2>
          {projects.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              No projects yet — create one to organize your PRDs.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border bg-card p-5 shadow-sm"
                >
                  <p className="font-medium">{p.name}</p>
                  {p.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{truncate(p.description, 80)}</p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {p._count.prds} PRD{p._count.prds === 1 ? '' : 's'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

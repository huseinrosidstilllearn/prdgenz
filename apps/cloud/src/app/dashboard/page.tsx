import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { AppShell, EmptyState, PageHeader, PRDList } from '@prdgenz/app'
import { Badge, Button } from '@prdgenz/ui'
import { FREE_PLAN_LIMIT } from '@prdgenz/shared'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateProjectButton } from '@/components/create-project'

// Session + DB backed page — always render on demand.
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const [prds, user] = await Promise.all([
    prisma.pRD.findMany({
      where: { project: { userId: userId! } },
      include: { project: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    prisma.user.findUnique({
      where: { id: userId! },
      select: { role: true, name: true },
    }),
  ])

  const isPro = user?.role === 'PRO'

  return (
    <AppShell
      nav={[
        { href: '/dashboard', label: 'PRDs', active: true },
        { href: '/prd/new', label: 'New PRD' },
        { href: '/settings', label: 'Settings' },
      ]}
      headerExtra={
        <Badge variant={isPro ? 'primary' : 'secondary'}>{user?.role ?? 'FREE'}</Badge>
      }
    >
      <PageHeader
        eyebrow="Dashboard"
        title="Your documents"
        description={
          isPro
            ? 'Pro plan: no monthly limit.'
            : `Free plan: ${FREE_PLAN_LIMIT} PRDs every 30 days.`
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
          body="Start from a rough idea and the model will draft the problem, users, features, and acceptance criteria around it."
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
            projectName: prd.project.name,
            version: prd.currentVersion,
            mode: prd.mode,
            language: prd.language as 'ID' | 'EN',
            updatedAt: prd.updatedAt.toISOString(),
          }))}
        />
      )}

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl">Projects</h2>
          <CreateProjectButton />
        </div>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          Projects group related PRDs. Every document above belongs to one.
        </p>
      </section>
    </AppShell>
  )
}


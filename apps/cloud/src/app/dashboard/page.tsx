import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { AppShell, EmptyState, PageHeader, PRDList, ProjectList, WorkspaceStart } from '@prdgenz/app'
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
    prisma.user.findUnique({
      where: { id: userId! },
      select: { role: true, name: true, _count: { select: { apiKeys: true } } },
    }),
  ])

  const isPro = user?.role === 'PRO'

  return (
    <AppShell
      maxWidth="4xl"
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
        <WorkspaceStart providerConfigured={Boolean(user?._count.apiKeys)} hasProject={projects.length > 0} />
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

      <section id="projects" className="mt-10 scroll-mt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl">Projects</h2>
            <p className="mt-1 text-xs text-muted-foreground">Keep related product decisions in one place.</p>
          </div>
          <CreateProjectButton />
        </div>
        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            body="Create a project for the product you are planning. You will choose it when you write your first PRD."
          />
        ) : (
          <ProjectList
            items={projects.map((project) => ({
              id: project.id,
              name: project.name,
              description: project.description,
              prdCount: project._count.prds,
              updatedAt: project.updatedAt.toISOString(),
            }))}
          />
        )}
      </section>
    </AppShell>
  )
}

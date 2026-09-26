import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { PRDEditForm } from '@prdgenz/app'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Session-backed page — always render on demand.
export const dynamic = 'force-dynamic'

/** Edit metadata: rename, change output language, delete (PRD §9.2). */
export default async function EditPRDPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const prd = await prisma.pRD.findFirst({
    where: { id, project: { userId: userId! } },
    select: { id: true, title: true, language: true },
  })
  if (!prd) notFound()

  return (
    <PRDEditForm
      prdId={prd.id}
      initialTitle={prd.title}
      initialLanguage={prd.language}
      canDelete
      redirectTo="/dashboard"
    />
  )
}
import { notFound } from 'next/navigation'
import { PRDEditForm } from '@prdgenz/app'
import { prisma } from '@/lib/prisma'

// SQLite-backed page — always render on demand.
export const dynamic = 'force-dynamic'

/** Edit metadata: rename and change output language (self-host /prd/[id]/edit). */
export default async function EditPRDPage({ params }: { params: { id: string } }) {
  const prd = await prisma.pRD.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, language: true },
  })
  if (!prd) notFound()

  return (
    <PRDEditForm
      prdId={prd.id}
      initialTitle={prd.title}
      initialLanguage={prd.language}
      redirectTo="/"
    />
  )
}
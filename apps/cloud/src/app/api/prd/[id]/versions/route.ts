import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/api-auth'
import { assertPRDOwnership, ServiceError } from '@/lib/prd-service'

type Params = { params: Promise<{ id: string }> }

/** GET /api/prd/[id]/versions — list all versions, newest first (PRD §10.2). */
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const prd = await assertPRDOwnership(userId, id)
    const versions = await prisma.pRDVersion.findMany({
      where: { prdId: prd.id },
      orderBy: { versionNumber: 'desc' },
      select: { id: true, versionNumber: true, createdAt: true },
    })
    return NextResponse.json({ versions, currentVersion: prd.currentVersion })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[versions:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

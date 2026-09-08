import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPRD, ServiceError } from '@/lib/prd-service'

/** GET /api/prd/[id]/versions — list versions, newest first (self-host). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const prd = await getPRD(params.id)
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

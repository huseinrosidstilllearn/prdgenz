import { NextResponse } from 'next/server'
import { slugify } from '@prdgenz/shared'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/api-auth'
import { assertPRDOwnership, getCurrentVersion, ServiceError } from '@/lib/prd-service'

/** POST /api/export/md — download current PRD version as Markdown (PRD §10.4, all plans). */
export async function POST(req: Request) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const prdId = typeof body?.prdId === 'string' ? body.prdId : null
    if (!prdId) return NextResponse.json({ error: 'prdId is required' }, { status: 400 })

    const prd = await assertPRDOwnership(userId, prdId)
    const version = await getCurrentVersion(prd.id)
    if (!version) {
      return NextResponse.json({ error: 'PRD has no generated content yet' }, { status: 409 })
    }

    const filename = `${slugify(prd.title) || 'prd'}.md`
    return new NextResponse(version.contentMd, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[export/md]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

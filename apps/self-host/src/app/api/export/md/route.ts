import { NextResponse } from 'next/server'
import { slugify } from '@prdgenz/shared'
import { getCurrentVersion, getPRD, ServiceError } from '@/lib/prd-service'

/** POST /api/export/md — download current version as Markdown (self-host). */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const prdId = typeof body?.prdId === 'string' ? body.prdId : null
    if (!prdId) return NextResponse.json({ error: 'prdId is required' }, { status: 400 })

    const prd = await getPRD(prdId)
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

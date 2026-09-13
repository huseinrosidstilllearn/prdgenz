import { NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api-auth'
import { restoreVersion, ServiceError } from '@/lib/prd-service'

type Params = { params: Promise<{ id: string; vid: string }> }

/** POST /api/prd/[id]/versions/[vid]/restore — restore an old version (PRD §6.6, §10.2). */
export async function POST(_req: Request, { params }: Params) {
  const { id, vid: vidParam } = await params
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const vid = Number(vidParam)
    if (!Number.isInteger(vid) || vid < 1) {
      return NextResponse.json({ error: 'Invalid version number' }, { status: 400 })
    }
    const version = await restoreVersion(userId, id, vid)
    return NextResponse.json({
      version: { id: version.id, versionNumber: version.versionNumber, createdAt: version.createdAt },
    })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[restore]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

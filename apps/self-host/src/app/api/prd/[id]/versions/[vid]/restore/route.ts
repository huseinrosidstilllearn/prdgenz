import { NextResponse } from 'next/server'
import { restoreVersion, ServiceError } from '@/lib/prd-service'

type Params = { params: { id: string; vid: string } }

/** POST /api/prd/[id]/versions/[vid]/restore — restore old version (self-host). */
export async function POST(_req: Request, { params }: Params) {
  try {
    const vid = Number(params.vid)
    if (!Number.isInteger(vid) || vid < 1) {
      return NextResponse.json({ error: 'Invalid version number' }, { status: 400 })
    }
    const version = await restoreVersion(params.id, vid)
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

import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/api-auth'
import { assertPRDOwnership, ServiceError } from '@/lib/prd-service'
import { slugify } from '@prdgenz/shared'

type Params = { params: { id: string } }

/** POST /api/prd/[id]/share — create a view-only share link (PRD §6.7, cloud only). */
export async function POST(_req: Request, { params }: Params) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const prd = await assertPRDOwnership(userId, params.id)
    if (prd.shareId) {
      return NextResponse.json({ shareId: prd.shareId })
    }
    const shareId = slugify(prd.title).slice(0, 24) + '-' + randomUUID().slice(0, 8)
    await prisma.pRD.update({ where: { id: prd.id }, data: { shareId } })
    return NextResponse.json({ shareId })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[share:POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/prd/[id]/share — revoke the share link. */
export async function DELETE(_req: Request, { params }: Params) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const prd = await assertPRDOwnership(userId, params.id)
    await prisma.pRD.update({ where: { id: prd.id }, data: { shareId: null } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[share:DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

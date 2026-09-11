import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/api-auth'
import { assertPRDOwnership, ServiceError } from '@/lib/prd-service'
import { slugify, shareCreateSchema } from '@prdgenz/shared'

type Params = { params: { id: string } }

/** POST /api/prd/[id]/share — create a view-only share link (PRD §6.7, cloud only). */
export async function POST(req: Request, { params }: Params) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const prd = await assertPRDOwnership(userId, params.id)
    const parsed = shareCreateSchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { password, expiresInDays } = parsed.data
    if (prd.shareId) {
      if (password || expiresInDays) {
        return NextResponse.json(
          { error: 'Share link already exists — revoke it first to change protection settings' },
          { status: 400 }
        )
      }
      return NextResponse.json({ shareId: prd.shareId })
    }
    const shareId = slugify(prd.title).slice(0, 24) + '-' + randomUUID().slice(0, 8)
    await prisma.pRD.update({
      where: { id: prd.id },
      data: {
        shareId,
        sharePasswordHash: password ? await bcrypt.hash(password, 10) : null,
        shareExpiresAt: expiresInDays
          ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
          : null,
      },
    })
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
    await prisma.pRD.update({
      where: { id: prd.id },
      data: { shareId: null, sharePasswordHash: null, shareExpiresAt: null },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[share:DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
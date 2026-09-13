import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'
import { assertPRDOwnership, ServiceError } from '@/lib/prd-service'

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  language: z.enum(['ID', 'EN']).optional(),
})

type Params = { params: Promise<{ id: string }> }

/** GET /api/prd/[id] — PRD detail with current version (PRD §10.2). */
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const prd = await prisma.pRD.findFirst({
      where: { id: id, project: { userId } },
      include: {
        project: { select: { id: true, name: true } },
        versions: {
          orderBy: { versionNumber: 'desc' },
          select: { id: true, versionNumber: true, createdAt: true },
        },
      },
    })
    if (!prd) return NextResponse.json({ error: 'PRD not found' }, { status: 404 })

    const current = await prisma.pRDVersion.findFirst({
      where: { prdId: prd.id, versionNumber: prd.currentVersion },
    })
    return NextResponse.json({ prd, currentVersion: current })
  } catch (err) {
    console.error('[prd/:id:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/prd/[id] — update PRD metadata. */
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const parsed = updateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    await assertPRDOwnership(userId, id)
    const prd = await prisma.pRD.update({ where: { id: id }, data: parsed.data })
    return NextResponse.json({ prd })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[prd/:id:PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/prd/[id] — delete PRD and its versions. */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!rateLimit(`prd:${userId}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  try {
    await assertPRDOwnership(userId, id)
    await prisma.pRD.delete({ where: { id: id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[prd/:id:DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

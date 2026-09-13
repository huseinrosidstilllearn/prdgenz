import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/api-auth'
import { assertProjectOwnership, ServiceError } from '@/lib/prd-service'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
})

type Params = { params: Promise<{ id: string }> }

/** GET /api/projects/[id] — project detail with its PRDs. */
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const project = await prisma.project.findFirst({
      where: { id: id, userId },
      include: {
        prds: {
          orderBy: { updatedAt: 'desc' },
          select: { id: true, title: true, mode: true, language: true, currentVersion: true, createdAt: true, updatedAt: true },
        },
      },
    })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    return NextResponse.json({ project })
  } catch (err) {
    console.error('[projects/:id:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** PATCH /api/projects/[id] — rename / edit description. */
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const parsed = updateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    await assertProjectOwnership(userId, id)
    const project = await prisma.project.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ project })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[projects/:id:PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/projects/[id] — delete project and all contained PRDs. */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await assertProjectOwnership(userId, id)
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[projects/:id:DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

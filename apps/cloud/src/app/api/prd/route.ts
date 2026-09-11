import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'
import { assertProjectOwnership, assertCreateAllowed, ServiceError } from '@/lib/prd-service'

const createSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(300).default('Untitled PRD'),
  language: z.enum(['ID', 'EN']).default('EN'),
  mode: z.enum(['WIZARD', 'CHAT', 'ONESHOT']).default('WIZARD'),
})

/** GET /api/prd — list all of the user's PRDs (PRD §10.2). */
export async function GET() {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prds = await prisma.pRD.findMany({
    where: { project: { userId } },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json({ prds })
}

/** POST /api/prd — create an empty PRD shell inside a project. */
export async function POST(req: Request) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!rateLimit(`prd:${userId}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  try {
    const parsed = createSchema.safeParse((await req.json()) ?? {})
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    await assertProjectOwnership(userId, parsed.data.projectId)
    await assertCreateAllowed(userId)
    const prd = await prisma.pRD.create({
      data: {
        projectId: parsed.data.projectId,
        title: parsed.data.title,
        language: parsed.data.language,
        mode: parsed.data.mode,
      },
    })
    return NextResponse.json({ prd }, { status: 201 })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[prd:POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

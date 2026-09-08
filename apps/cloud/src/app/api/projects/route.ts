import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'
import { ServiceError } from '@/lib/prd-service'

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

/** GET /api/projects — list the user's projects (PRD §10). */
export async function GET() {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!rateLimit(`projects:${userId}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    include: { _count: { select: { prds: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json({ projects })
}

/** POST /api/projects — create a project. */
export async function POST(req: Request) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const parsed = createProjectSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const project = await prisma.project.create({ data: { ...parsed.data, userId } })
    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[projects:POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

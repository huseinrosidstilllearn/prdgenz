import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ServiceError } from '@/lib/prd-service'

const createSchema = z.object({
  title: z.string().min(1).max(300).default('Untitled PRD'),
  language: z.enum(['ID', 'EN']).default('EN'),
  mode: z.enum(['WIZARD', 'CHAT', 'ONESHOT']).default('WIZARD'),
})

/** GET /api/prd — list all PRDs (self-host: single user). */
export async function GET() {
  const prds = await prisma.pRD.findMany({ orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ prds })
}

/** POST /api/prd — create an empty PRD shell. */
export async function POST(req: Request) {
  try {
    const parsed = createSchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const prd = await prisma.pRD.create({
      data: {
        title: parsed.data.title,
        language: parsed.data.language,
        mode: parsed.data.mode,
      },
    })
    return NextResponse.json({ prd }, { status: 201 })
  } catch (err) {
    console.error('[prd:POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

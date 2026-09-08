import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPRD, getCurrentVersion, ServiceError } from '@/lib/prd-service'

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  language: z.enum(['ID', 'EN']).optional(),
})

type Params = { params: { id: string } }

/** GET /api/prd/[id] — PRD detail with current version. */
export async function GET(_req: Request, { params }: Params) {
  try {
    const prd = await getPRD(params.id)
    const current = await getCurrentVersion(prd.id)
    return NextResponse.json({ prd, currentVersion: current })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[prd/:id:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/prd/[id] — update metadata. */
export async function PUT(req: Request, { params }: Params) {
  try {
    const parsed = updateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    await getPRD(params.id)
    const prd = await prisma.pRD.update({ where: { id: params.id }, data: parsed.data })
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
  try {
    await getPRD(params.id)
    await prisma.pRD.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[prd/:id:DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

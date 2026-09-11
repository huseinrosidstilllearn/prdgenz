import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { shareAuthCookieName, shareAuthValue } from '@/lib/share-auth'

type Params = { params: { shareId: string } }

/** POST /api/share/[shareId]/auth — verify a share-link password (PRD §6.7). */
export async function POST(req: Request, { params }: Params) {
  try {
    const body = await req.json().catch(() => ({}))
    const password = typeof (body as { password?: unknown })?.password === 'string'
      ? (body as { password: string }).password
      : ''
    if (!password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const prd = await prisma.pRD.findUnique({ where: { shareId: params.shareId } })
    if (!prd?.shareId || !prd.sharePasswordHash) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    if (prd.shareExpiresAt && prd.shareExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, prd.sharePasswordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(shareAuthCookieName(prd.shareId), shareAuthValue(prd.shareId, prd.sharePasswordHash), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    return res
  } catch (err) {
    console.error('[share:auth]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
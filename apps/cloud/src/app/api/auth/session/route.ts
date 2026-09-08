import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

/** GET /api/auth/session — current session (PRD §10.1). */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
  return NextResponse.json({ user: session.user }, { status: 200 })
}

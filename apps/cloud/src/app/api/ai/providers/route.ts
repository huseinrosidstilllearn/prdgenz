import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { listProviders } from '@prdgenz/shared'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

/** GET /api/ai/providers — list available providers + configured status (PRD §10.3). */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = await prisma.apiKey.findMany({
    where: { userId },
    select: { provider: true },
  })

  return NextResponse.json({ providers: listProviders(keys.map((k) => k.provider)) })
}

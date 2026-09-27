import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@prdgenz/shared'
import { clientKey, rateLimit } from '@/lib/rate-limit'

/** Prisma's error code for a unique-index violation. */
const PRISMA_UNIQUE_VIOLATION = 'P2002'

/**
 * POST /api/auth/register — create a new user (PRD §10.1).
 */
export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, 'register'), 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, name, password } = parsed.data
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    let user
    try {
      user = await prisma.user.create({
        data: { email, name, passwordHash },
        select: { id: true, email: true, name: true },
      })
    } catch (err) {
      // The check above is a convenience for the common case, not a guarantee:
      // two requests for the same email can both pass it, and the unique index
      // on email is what actually decides. Losing that race is a duplicate
      // signup, not a server fault, so report it the same way as the check.
      if (
        typeof err === 'object' &&
        err !== null &&
        (err as { code?: unknown }).code === PRISMA_UNIQUE_VIOLATION
      ) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }
      throw err
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

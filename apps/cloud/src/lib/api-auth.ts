import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/** Fail closed if deployment secrets are left at placeholder values. */
export function assertProdSecrets(): void {
  if (process.env.NODE_ENV !== 'production') return
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret || secret === 'change-me-in-production' || secret.length < 32) {
    throw new Error('NEXTAUTH_SECRET must be set to a strong random value (openssl rand -base64 32) in production')
  }
}

/** Session user id or null — used by API route handlers (PRD §10). */
export async function requireUserId(): Promise<string | null> {
  assertProdSecrets()
  const session = await getServerSession(authOptions)
  const id = (session?.user as { id?: string } | undefined)?.id
  return id ?? null
}

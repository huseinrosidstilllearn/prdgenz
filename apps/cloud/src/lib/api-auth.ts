import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/** Session user id or null — used by API route handlers (PRD §10). */
export async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  const id = (session?.user as { id?: string } | undefined)?.id
  return id ?? null
}

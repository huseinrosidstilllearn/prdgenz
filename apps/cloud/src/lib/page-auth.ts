import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { assertProdSecrets } from './api-auth'

/**
 * Page-level auth guard. Replaces `src/middleware.ts`.
 *
 * Auth lives in server layouts because the Cloudflare adapter does not support
 * Node middleware on Workers ("patched by open next" disables loadNodeMiddleware),
 * and a server component is the stronger place to enforce auth anyway: it runs
 * before the page renders, so it cannot be bypassed the way edge middleware can.
 * (The "Dynamic require of middleware-manifest.json" 500s that once motivated
 * this move come from next-server itself, not from user middleware —
 * scripts/patch-worker.mjs handles that call site after every build.)
 *
 * Every layout that calls this must `export const dynamic = 'force-dynamic'`:
 * during a static prerender the guard would run at build time, where
 * assertProdSecrets fails because CI has no secrets.
 *
 * Returns the authenticated user id, or redirects to /login when signed out.
 */
export async function requirePageUser(): Promise<string> {
  assertProdSecrets()
  const session = await getServerSession(authOptions)
  const id = (session?.user as { id?: string } | undefined)?.id
  if (!id) redirect('/login')
  return id
}

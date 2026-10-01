import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { assertProdSecrets } from './api-auth'

/**
 * Page-level auth guard. Replaces `src/middleware.ts`.
 *
 * Why this exists instead of middleware: the Cloudflare Workers runtime has no
 * filesystem, so a middleware build makes Next try to `require()` its
 * middleware-manifest.json at request time. esbuild cannot bundle that require
 * statically, and its runtime fallback throws
 * "Dynamic require of ... is not supported", 500-ing every request.
 * Without `src/middleware.ts` there is no manifest to load.
 *
 * This is also the stronger place to enforce auth: a server component runs
 * before the page renders, so it cannot be bypassed the way edge middleware can.
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

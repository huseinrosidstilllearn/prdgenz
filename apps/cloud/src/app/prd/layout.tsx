import type { ReactNode } from 'react'
import { requirePageUser } from '@/lib/page-auth'

// Session-gated routes render per request: never prerendered at build time
// (which would run assertProdSecrets without secrets) nor cached.
export const dynamic = 'force-dynamic'

/**
 * Server-side auth guard for every /prd/* route (replaces src/middleware.ts).
 * Covers /prd/new, /prd/[id] and its edit/diff subroutes.
 */
export default async function PrdLayout({ children }: { children: ReactNode }) {
  await requirePageUser()
  return <>{children}</>
}

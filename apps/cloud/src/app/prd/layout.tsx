import type { ReactNode } from 'react'
import { requirePageUser } from '@/lib/page-auth'

/**
 * Server-side auth guard for every /prd/* route (replaces src/middleware.ts).
 * Covers /prd/new, /prd/[id] and its edit/diff subroutes.
 */
export default async function PrdLayout({ children }: { children: ReactNode }) {
  await requirePageUser()
  return <>{children}</>
}

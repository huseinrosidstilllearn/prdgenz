import type { ReactNode } from 'react'
import { requirePageUser } from '@/lib/page-auth'

// Session-gated routes render per request: never prerendered at build time
// (which would run assertProdSecrets without secrets) nor cached.
export const dynamic = 'force-dynamic'

/**
 * Server-side auth guard for /dashboard (replaces src/middleware.ts).
 * Redirects to /login when signed out.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requirePageUser()
  return <>{children}</>
}

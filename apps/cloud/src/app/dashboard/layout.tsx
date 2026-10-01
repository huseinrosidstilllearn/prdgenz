import type { ReactNode } from 'react'
import { requirePageUser } from '@/lib/page-auth'

/**
 * Server-side auth guard for /dashboard (replaces src/middleware.ts).
 * Redirects to /login when signed out.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requirePageUser()
  return <>{children}</>
}

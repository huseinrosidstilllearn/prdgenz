import type { ReactNode } from 'react'
import { requirePageUser } from '@/lib/page-auth'

// Session-gated routes render per request: never prerendered at build time
// (which would run assertProdSecrets without secrets) nor cached.
export const dynamic = 'force-dynamic'

/**
 * Server-side auth guard for /settings (replaces src/middleware.ts).
 * The page itself is a client component, so the check lives in this layout.
 */
export default async function SettingsLayout({ children }: { children: ReactNode }) {
  await requirePageUser()
  return <>{children}</>
}

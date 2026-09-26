import { getServerSession } from 'next-auth'
import { Landing } from '@prdgenz/app'
import { authOptions } from '@/lib/auth'

// Reads the session, so this page cannot be prerendered.
export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  return <Landing signedIn={Boolean(session)} />
}

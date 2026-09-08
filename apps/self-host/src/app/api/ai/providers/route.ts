import { NextResponse } from 'next/server'
import { listProviders } from '@prdgenz/shared'
import { configuredProviderIds, defaultProvider } from '@/lib/env'

/** GET /api/ai/providers — configured providers from env (self-host). */
export async function GET() {
  return NextResponse.json({
    providers: listProviders(configuredProviderIds()),
    defaultProvider: defaultProvider(),
  })
}

import { NextResponse } from 'next/server'
import {
  apiKeyUpsertSchema,
  maskApiKey,
  testProviderConnection,
} from '@prdgenz/shared'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/api-auth'
import { encryptApiKey, decryptApiKey } from '@/lib/encryption'

/** GET /api/settings/apikey — masked key list (PRD §10.5, §15). */
export async function GET() {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, provider: true, keyEncrypted: true, baseUrl: true, updatedAt: true },
  })

  const masked = await Promise.all(
    keys.map(async (k) => {
      let maskedKey = '****'
      try {
        maskedKey = maskApiKey(await decryptApiKey(k.keyEncrypted))
      } catch {
        /* corrupted entry — show generic mask */
      }
      return { id: k.id, provider: k.provider, maskedKey, baseUrl: k.baseUrl, updatedAt: k.updatedAt }
    })
  )
  return NextResponse.json({ apiKeys: masked })
}

/** PUT /api/settings/apikey — upsert an encrypted provider key (PRD §10.5, §7.2). */
export async function PUT(req: Request) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = apiKeyUpsertSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { provider, key, customBaseUrl } = parsed.data

  const keyEncrypted = await encryptApiKey(key)
  const connectionOk = await testProviderConnection(provider, key, customBaseUrl)

  const apikey = await prisma.apiKey.upsert({
    where: { userId_provider: { userId, provider } },
    create: { userId, provider, keyEncrypted, baseUrl: customBaseUrl ?? null },
    update: { keyEncrypted, baseUrl: customBaseUrl ?? null },
  })

  return NextResponse.json({
    apiKey: {
      id: apikey.id,
      provider,
      maskedKey: maskApiKey(key),
      baseUrl: apikey.baseUrl,
      updatedAt: apikey.updatedAt,
    },
    connectionOk,
    warning: connectionOk ? null : 'Saved, but the connection test failed — verify the key.',
  })
}

/** DELETE /api/settings/apikey?provider=xxx — remove a provider key (PRD §10.5). */
export async function DELETE(req: Request) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const provider = new URL(req.url).searchParams.get('provider')
  if (!provider) {
    return NextResponse.json({ error: 'Missing "provider" query param' }, { status: 400 })
  }
  const deleted = await prisma.apiKey.deleteMany({ where: { userId, provider } })
  return NextResponse.json({ ok: true, deleted: deleted.count })
}

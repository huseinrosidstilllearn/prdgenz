import { NextResponse } from 'next/server'
import {
  buildSystemPrompt,
  buildUserPrompt,
  callAI,
  generateRequestSchema,
  Language,
  PRDMode,
  parseAIResponse,
} from '@prdgenz/shared'
import { requireUserId } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'
import { getUserCredential } from '@/lib/encryption'
import {
  appendPRDVersion,
  assertPRDOwnership,
  validatePRDContent,
  ServiceError,
} from '@/lib/prd-service'

/**
 * POST /api/prd/[id]/generate — non-streaming regenerate for an existing PRD
 * (PRD §10.2). Creates a new version from validated AI JSON output.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!rateLimit(`generate:${userId}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const parsed = generateRequestSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { language, mode, provider, model, input, customBaseUrl } = parsed.data
    await assertPRDOwnership(userId, params.id)

    const cred = await getUserCredential(userId, provider)
    if (!cred) {
      return NextResponse.json(
        { error: `No API key configured for provider "${provider}". Add it in Settings.` },
        { status: 400 }
      )
    }

    const raw = await callAI({
      provider,
      apiKey: cred.apiKey,
      model,
      systemPrompt: buildSystemPrompt(language as Language, mode as PRDMode),
      userPrompt: buildUserPrompt(mode as PRDMode, input as never),
      jsonMode: true,
      customBaseUrl: customBaseUrl ?? cred.baseUrl,
    })

    const content = validatePRDContent(parseAIResponse(raw))
    const version = await appendPRDVersion(userId, params.id, content, language as Language)

    return NextResponse.json({
      version: {
        id: version.id,
        versionNumber: version.versionNumber,
        createdAt: version.createdAt,
      },
      content,
      contentMd: version.contentMd,
    })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[prd/:id:generate]', err)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 502 })
  }
}

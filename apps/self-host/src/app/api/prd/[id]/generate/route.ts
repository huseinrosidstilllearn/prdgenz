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
import { getCredential } from '@/lib/env'
import { appendPRDVersion, getPRD, validatePRDContent, ServiceError } from '@/lib/prd-service'

/** POST /api/prd/[id]/generate — regenerate for an existing PRD (self-host). */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const parsed = generateRequestSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { language, mode, provider, model, input, customBaseUrl } = parsed.data
    await getPRD(params.id)

    const cred = getCredential(provider)
    if (!cred) {
      return NextResponse.json(
        {
          error: `No API key configured for provider "${provider}". Set ${provider.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_API_KEY in the environment.`,
        },
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
    const version = await appendPRDVersion(params.id, content, language)

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

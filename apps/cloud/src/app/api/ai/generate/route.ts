import {
  buildSystemPrompt,
  buildUserPrompt,
  callAIStream,
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
  createPRDFromContent,
  validatePRDContent,
  ServiceError,
} from '@/lib/prd-service'

/**
 * POST /api/ai/generate — streaming full-PRD generation (PRD §10.3, §6.2.4).
 * SSE events: {type:"delta",text} ... {type:"done",content,saved} | {type:"error",error}
 * `saved.prdId` is set when projectId (new PRD) or prdId (new version) was passed.
 */
export async function POST(req: Request) {
  const userId = await requireUserId()
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!rateLimit(`generate:${userId}`)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const parsed = generateRequestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid input', details: parsed.error.flatten() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
  const { language, mode, provider, model, projectId, prdId, input, customBaseUrl } = parsed.data

  const cred = await getUserCredential(userId, provider)
  if (!cred) {
    return new Response(
      JSON.stringify({
        error: `No API key configured for provider "${provider}". Add it in Settings.`,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const enc = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`))
      try {
        if (prdId) await assertPRDOwnership(userId, prdId)
        if (projectId) {
          const svc = await import('@/lib/prd-service')
          await svc.assertProjectOwnership(userId, projectId)
        }

        let full = ''
        for await (const delta of callAIStream({
          provider,
          apiKey: cred.apiKey,
          model,
          systemPrompt: buildSystemPrompt(language as Language, mode as PRDMode),
          userPrompt: buildUserPrompt(mode as PRDMode, input as never),
          jsonMode: true,
          customBaseUrl: customBaseUrl ?? cred.baseUrl,
        })) {
          full += delta
          send({ type: 'delta', text: delta })
        }

        const content = validatePRDContent(parseAIResponse(full))
        let saved: { prdId: string; versionNumber: number } | null = null
        if (prdId) {
          const version = await appendPRDVersion(userId, prdId, content, language as Language)
          saved = { prdId, versionNumber: version.versionNumber }
        } else if (projectId) {
          const prd = await createPRDFromContent(
            userId,
            { projectId, language: language as Language, mode: mode as PRDMode },
            content
          )
          saved = { prdId: prd.id, versionNumber: 1 }
        }
        send({ type: 'done', content, saved })
      } catch (err) {
        send({
          type: 'error',
          error: err instanceof Error ? err.message : 'Generation failed',
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

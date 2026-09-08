import {
  buildSystemPrompt,
  buildUserPrompt,
  callAIStream,
  generateRequestSchema,
  Language,
  PRDMode,
  parseAIResponse,
} from '@prdgenz/shared'
import { getCredential } from '@/lib/env'
import { appendPRDVersion, createPRDFromContent, validatePRDContent } from '@/lib/prd-service'

/**
 * POST /api/ai/generate — streaming full-PRD generation (self-host).
 * SSE events: {type:"delta",text} ... {type:"done",content,saved} | {type:"error",error}
 * `saved.prdId` set when prdId (new version) was passed; otherwise a new PRD is created.
 */
export async function POST(req: Request) {
  const parsed = generateRequestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid input', details: parsed.error.flatten() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
  const { language, mode, provider, model, prdId, input, customBaseUrl } = parsed.data

  const cred = getCredential(provider)
  if (!cred) {
    return new Response(
      JSON.stringify({
        error: `No API key configured for provider "${provider}". Set the matching *_API_KEY in your .env / docker-compose environment.`,
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
        if (prdId) {
          const { getPRD } = await import('@/lib/prd-service')
          await getPRD(prdId)
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
          const version = await appendPRDVersion(prdId, content, language)
          saved = { prdId, versionNumber: version.versionNumber }
        } else {
          const prd = await createPRDFromContent({ language, mode }, content)
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

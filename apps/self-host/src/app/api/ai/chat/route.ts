import { z } from 'zod'
import { buildChatSystemPrompt, callAIStream, chatMessageSchema, Language } from '@prdgenz/shared'
import { getCredential } from '@/lib/env'

const chatRequestSchema = z.object({
  language: z.enum(['ID', 'EN']).default('EN'),
  provider: z.string().min(1),
  model: z.string().min(1).optional(),
  customBaseUrl: z.string().url().optional(),
  messages: z.array(chatMessageSchema).min(1),
})

/** POST /api/ai/chat — streaming chat turn (self-host, PRD §6.1.2). */
export async function POST(req: Request) {
  const parsed = chatRequestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid input', details: parsed.error.flatten() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
  const { language, provider, model, messages, customBaseUrl } = parsed.data

  const cred = getCredential(provider)
  if (!cred) {
    return new Response(
      JSON.stringify({ error: `No API key configured for provider "${provider}".` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')

  const enc = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`))
      try {
        let full = ''
        for await (const delta of callAIStream({
          provider,
          apiKey: cred.apiKey,
          model,
          systemPrompt: buildChatSystemPrompt(language as Language),
          userPrompt: lastUser ? lastUser.content : messages.map((m) => m.content).join('\n\n'),
          customBaseUrl: customBaseUrl ?? cred.baseUrl,
        })) {
          full += delta
          send({ type: 'delta', text: delta })
        }
        send({ type: 'done', full })
      } catch (err) {
        send({
          type: 'error',
          error: err instanceof Error ? err.message : 'Chat failed',
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

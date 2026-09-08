import { z } from 'zod'
import {
  buildChatSystemPrompt,
  callAIStream,
  chatMessageSchema,
  Language,
} from '@prdgenz/shared'
import { requireUserId } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'
import { getUserCredential } from '@/lib/encryption'

const chatRequestSchema = z.object({
  language: z.enum(['ID', 'EN']).default('EN'),
  provider: z.string().min(1),
  model: z.string().min(1).optional(),
  customBaseUrl: z.string().url().optional(),
  messages: z.array(chatMessageSchema).min(1),
})

/**
 * POST /api/ai/chat — streaming chat turn (PRD §10.3, §6.1.2).
 * SSE events: {type:"delta",text} ... {type:"done",full} | {type:"error",error}
 */
export async function POST(req: Request) {
  const userId = await requireUserId()
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!rateLimit(`chat:${userId}`)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const parsed = chatRequestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid input', details: parsed.error.flatten() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
  const { language, provider, model, messages, customBaseUrl } = parsed.data

  const cred = await getUserCredential(userId, provider)
  if (!cred) {
    return new Response(
      JSON.stringify({
        error: `No API key configured for provider "${provider}". Add it in Settings.`,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const history = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')
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
          userPrompt: lastUser ? lastUser.content : history,
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

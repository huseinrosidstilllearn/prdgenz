import { z } from 'zod'
import {
  callAIStream,
  isGeneratableSection,
  isSafeExternalUrl,
  Language,
  mergeSectionIntoDraft,
  parseAIResponse,
  sectionSystemPrompt,
  buildSectionUserPrompt,
  type GeneratableSection,
} from '@prdgenz/shared'
import { requireUserId } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'
import { getUserCredential } from '@/lib/encryption'
import { getCurrentVersion } from '@/lib/prd-service'
import { prisma } from '@/lib/prisma'
import type { PRDContent } from '@prdgenz/shared'

const wizardContext = z.object({
  idea: z.string().min(3).max(5000),
  problem: z.string().max(5000).optional(),
  targetUser: z.string().max(2000).optional(),
  features: z.array(z.string().max(300)).max(30).optional(),
  techStack: z.array(z.string().max(100)).max(20).optional(),
  timeline: z.string().max(2000).optional(),
  constraints: z.string().max(3000).optional(),
})

const sectionRequestSchema = z.object({
  language: z.enum(['ID', 'EN']),
  provider: z.string().min(1),
  model: z.string().min(1).optional(),
  prdId: z.string().min(1),
  customBaseUrl: z.string().url().optional(),
  input: wizardContext,
})

/**
 * POST /api/ai/section — streaming per-section wizard generation (PRD §6.1.1
 * "AI generate per section", §6.2.3 "system prompt dinamis tiap section").
 *
 * Generates ONE section from the wizard context, merges it into the current
 * PRD draft, and saves the result as a NEW version.
 *
 * SSE events: {type:"delta",text} ... {type:"done",content,saved} | {type:"error",error}
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

  const body = await req.json().catch(() => null)
  const rawSection = typeof body?.section === 'string' ? body.section : ''
  if (!isGeneratableSection(rawSection)) {
    return new Response(JSON.stringify({ error: 'Invalid input', details: { section: ['Unknown section'] } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const section: GeneratableSection = rawSection
  const parsed = sectionRequestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid input', details: parsed.error.flatten() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
  const { language, provider, model, prdId, customBaseUrl, input } = parsed.data

  if (customBaseUrl && !isSafeExternalUrl(customBaseUrl)) {
    return new Response(
      JSON.stringify({ error: 'customBaseUrl must be a public http(s) URL' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Ownership check + current draft.
  const prd = await prisma.pRD.findFirst({
    where: { id: prdId, project: { userId } },
  })
  if (!prd) {
    return new Response(JSON.stringify({ error: 'PRD not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const current = await getCurrentVersion(prdId)
  if (!current?.content) {
    return new Response(
      JSON.stringify({ error: 'This PRD has no generated content yet — generate the full PRD first.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

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
        let full = ''
        for await (const delta of callAIStream({
          provider,
          apiKey: cred.apiKey,
          model,
          systemPrompt: sectionSystemPrompt(language as Language, section),
          userPrompt: buildSectionUserPrompt(section, input),
          customBaseUrl: customBaseUrl ?? cred.baseUrl,
        })) {
          full += delta
          send({ type: 'delta', text: delta })
        }

        const sectionValue = parseAIResponse(full)
        const draft = mergeSectionIntoDraft(
          current.content as unknown as PRDContent,
          section,
          sectionValue
        )

        // Validate the merged draft before saving (PRD §6.3).
        const { validatePRDContent, appendPRDVersion } = await import('@/lib/prd-service')
        const content = validatePRDContent(draft)
        const version = await appendPRDVersion(userId, prdId, content, language as Language)
        send({ type: 'done', content, saved: { prdId, versionNumber: version.versionNumber } })
      } catch (err) {
        send({
          type: 'error',
          error: err instanceof Error ? err.message : 'Section generation failed',
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

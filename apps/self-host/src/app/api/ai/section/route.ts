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
  type PRDContent,
} from '@prdgenz/shared'
import { getCredential } from '@/lib/env'
import { getCurrentVersion, appendPRDVersion, validatePRDContent, getPRD } from '@/lib/prd-service'

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
 * POST /api/ai/section — streaming per-section wizard generation (self-host,
 * single user — no auth). Generates ONE section, merges it into the current
 * PRD draft, saves as a NEW version.
 *
 * SSE events: {type:"delta",text} ... {type:"done",content,saved} | {type:"error",error}
 */
export async function POST(req: Request) {
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

  const prd = await getPRD(prdId)
  const current = await getCurrentVersion(prd.id)
  if (!current) {
    return new Response(
      JSON.stringify({ error: 'This PRD has no generated content yet — generate the full PRD first.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

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
          JSON.parse(current.content) as PRDContent,
          section,
          sectionValue
        )

        const content = validatePRDContent(draft)
        const version = await appendPRDVersion(prdId, content, language)
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

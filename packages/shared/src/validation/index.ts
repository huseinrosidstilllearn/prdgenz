import { z } from 'zod'

// ---------------------------------------------------------------------------
// Wizard / One-Shot / Chat inputs (PRD §6.1)
// ---------------------------------------------------------------------------

export const wizardInputSchema = z.object({
  idea: z.string().min(3).max(5000),
  problem: z.string().max(5000).optional().default(''),
  targetUser: z.string().max(2000).optional().default(''),
  features: z.array(z.string().max(300)).max(30).optional().default([]),
  techStack: z.array(z.string().max(100)).max(20).optional(),
  timeline: z.string().max(2000).optional(),
  constraints: z.string().max(3000).optional(),
})
export type WizardInputSchema = z.infer<typeof wizardInputSchema>

export const oneShotInputSchema = z.object({
  idea: z.string().min(10).max(10000),
  constraints: z.string().max(3000).optional(),
})
export type OneShotInputSchema = z.infer<typeof oneShotInputSchema>

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000),
})
export type ChatMessageSchema = z.infer<typeof chatMessageSchema>

// ---------------------------------------------------------------------------
// Generate request (POST /api/ai/generate — PRD §10.3)
// ---------------------------------------------------------------------------

export const generateRequestSchema = z
  .object({
    language: z.enum(['ID', 'EN']),
    mode: z.enum(['WIZARD', 'CHAT', 'ONESHOT']),
    provider: z.string().min(1),
    model: z.string().min(1).optional(),
    projectId: z.string().optional(),
    prdId: z.string().optional(),
    customBaseUrl: z.string().url().optional(),
    input: z.unknown(),
  })
  .superRefine((val, ctx) => {
    if (val.mode === 'WIZARD') {
      const r = wizardInputSchema.safeParse(val.input)
      if (!r.success) ctx.addIssue({ code: 'custom', message: 'Invalid wizard input', path: ['input'] })
    } else if (val.mode === 'ONESHOT') {
      const r = oneShotInputSchema.safeParse(val.input)
      if (!r.success) ctx.addIssue({ code: 'custom', message: 'Invalid one-shot input', path: ['input'] })
    } else if (val.mode === 'CHAT') {
      const r = z.array(chatMessageSchema).min(1).safeParse(val.input)
      if (!r.success) ctx.addIssue({ code: 'custom', message: 'Invalid chat input', path: ['input'] })
    }
  })
export type GenerateRequestSchema = z.infer<typeof generateRequestSchema>

// ---------------------------------------------------------------------------
// PRD content (validates AI JSON output — PRD §6.3)
// ---------------------------------------------------------------------------

export const featureSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  priority: z.enum(['must', 'should', 'could']),
})

export const userStorySchema = z.object({
  id: z.string(),
  asA: z.string(),
  iWant: z.string(),
  soThat: z.string(),
})

export const acceptanceCriteriaSchema = z.object({
  id: z.string(),
  featureId: z.string(),
  criteria: z.string(),
})

export const techStackSchema = z.object({
  frontend: z.array(z.string()),
  backend: z.array(z.string()),
  database: z.array(z.string()),
  infrastructure: z.array(z.string()),
  reasoning: z.string(),
})

export const timelineSchema = z.object({
  id: z.string(),
  milestone: z.string(),
  duration: z.string(),
  deliverables: z.array(z.string()),
})

export const riskSchema = z.object({
  id: z.string(),
  description: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
  mitigation: z.string(),
})

export const prdContentSchema = z.object({
  title: z.string().min(1),
  summary: z.string(),
  problem: z.string(),
  targetUser: z.string(),
  features: z.array(featureSchema).min(1),
  userStories: z.array(userStorySchema),
  acceptanceCriteria: z.array(acceptanceCriteriaSchema),
  techStack: techStackSchema,
  timeline: z.array(timelineSchema),
  outputFormat: z.string(),
  risks: z.array(riskSchema).optional(),
  successMetrics: z.array(z.string()).optional(),
  openQuestions: z.array(z.string()).optional(),
})
export type PrdContentSchema = z.infer<typeof prdContentSchema>

// ---------------------------------------------------------------------------
// API key settings (PUT /api/settings/apikey — PRD §10.5)
// ---------------------------------------------------------------------------

export const apiKeyUpsertSchema = z.object({
  provider: z.string().min(1),
  key: z.string().min(8).max(500),
  customBaseUrl: z.string().url().optional(),
})

// ---------------------------------------------------------------------------
// Auth (cloud — PRD §6.4)
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(100),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
})

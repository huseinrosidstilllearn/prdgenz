import { Language, PRDContent, TechStack, Timeline, Feature, UserStory, AcceptanceCriteria, Risk } from '../types'
import { buildSectionSystemPrompt } from './prompts'

/**
 * Wizard per-section generation (PRD §6.1.1: "AI generate per section atau
 * sekaligus"). Each wizard step can be generated on its own from the wizard
 * input collected so far; results are merged into a growing PRD draft.
 */

/** PRD content keys that a wizard step can generate. */
export const GENERATABLE_SECTIONS = [
  'title',
  'summary',
  'problem',
  'targetUser',
  'features',
  'userStories',
  'acceptanceCriteria',
  'techStack',
  'timeline',
  'outputFormat',
  'risks',
  'successMetrics',
  'openQuestions',
] as const

export type GeneratableSection = (typeof GENERATABLE_SECTIONS)[number]

/** JSON schema hint sent to the AI for each section (kept in sync with types). */
const SECTION_SCHEMAS: Record<GeneratableSection, string> = {
  title: 'string — the product title (3-8 words, no tagline)',
  summary: 'string — one-paragraph executive summary',
  problem: 'string — the problem statement paragraph',
  targetUser: 'string — target user description',
  features: 'array of { "id": string, "name": string, "description": string, "priority": "must" | "should" | "could" }',
  userStories: 'array of { "id": string, "asA": string, "iWant": string, "soThat": string }',
  acceptanceCriteria:
    'array of { "id": string, "featureId": string, "criteria": string } — featureId MUST match an existing feature id in the draft',
  techStack:
    'object { "frontend": string[], "backend": string[], "database": string[], "infrastructure": string[], "reasoning": string }',
  timeline:
    'array of { "id": string, "milestone": string, "duration": string, "deliverables": string[] }',
  outputFormat: 'string — the output/delivery format requirements',
  risks: 'array of { "id": string, "description": string, "impact": "high" | "medium" | "low", "mitigation": string }',
  successMetrics: 'array of strings — measurable success metrics',
  openQuestions: 'array of strings — open questions for stakeholders',
}

export function isGeneratableSection(value: string): value is GeneratableSection {
  return (GENERATABLE_SECTIONS as readonly string[]).includes(value)
}

/**
 * User prompt for one section: wizard context + the schemas of already-known
 * draft fields (so e.g. acceptance criteria can reference feature ids).
 */
export function buildSectionUserPrompt(section: GeneratableSection, wizardInput: {
  idea: string
  problem?: string
  targetUser?: string
  features?: string[]
  techStack?: string[]
  timeline?: string
  constraints?: string
}): string {
  const parts: string[] = []

  parts.push('## Product idea', wizardInput.idea)
  if (wizardInput.problem) parts.push('## Known problem', wizardInput.problem)
  if (wizardInput.targetUser) parts.push('## Target user', wizardInput.targetUser)
  if (wizardInput.features?.length) {
    parts.push('## Feature ideas', wizardInput.features.map((f) => `- ${f}`).join('\n'))
  }
  if (wizardInput.techStack?.length) {
    parts.push('## Preferred tech stack', wizardInput.techStack.join(', '))
  }
  if (wizardInput.timeline) parts.push('## Timeline notes', wizardInput.timeline)
  if (wizardInput.constraints) parts.push('## Constraints', wizardInput.constraints)

  parts.push(
    `## Your task`,
    `Generate the "${section}" field of the PRD as a single valid JSON value matching this schema:`,
    SECTION_SCHEMAS[section],
    '',
    'Respond with the JSON value only — no markdown fences, no object wrapper, no commentary.'
  )
  return parts.join('\n\n')
}

/** System prompt variant that names the section (wraps buildSectionSystemPrompt). */
export function sectionSystemPrompt(language: Language, section: GeneratableSection): string {
  return buildSectionSystemPrompt(language, section)
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Unwrap the AI's answer: per-section prompts ask for a bare JSON value, but
 * some models (and mocks) return the full PRD object — in that case take the
 * requested field out of it.
 */
export function unwrapSectionValue(section: GeneratableSection, value: unknown): unknown {
  if (isPlainObject(value) && section in value) {
    return (value as Record<string, unknown>)[section]
  }
  return value
}

/**
 * Merge one generated section into a PRD draft (PRD §6.1.1 per-section flow).
 * Returns a NEW draft object; never mutates the input. The draft keeps growing
 * as sections are generated — missing fields stay undefined until filled.
 */
export function mergeSectionIntoDraft(
  draft: PRDContent | null,
  section: GeneratableSection,
  value: unknown
): PRDContent {
  const base: PRDContent = draft ? { ...draft } : ({} as PRDContent)
  const v = unwrapSectionValue(section, value)
  switch (section) {
    case 'techStack':
      if (!isPlainObject(v)) throw new Error('techStack must be a JSON object')
      base.techStack = v as unknown as TechStack
      break
    case 'features':
      if (!Array.isArray(v)) throw new Error('features must be a JSON array')
      base.features = v as Feature[]
      break
    case 'userStories':
      if (!Array.isArray(v)) throw new Error('userStories must be a JSON array')
      base.userStories = v as UserStory[]
      break
    case 'acceptanceCriteria':
      if (!Array.isArray(v)) throw new Error('acceptanceCriteria must be a JSON array')
      base.acceptanceCriteria = v as AcceptanceCriteria[]
      break
    case 'timeline':
      if (!Array.isArray(v)) throw new Error('timeline must be a JSON array')
      base.timeline = v as Timeline[]
      break
    case 'risks':
      if (!Array.isArray(v)) throw new Error('risks must be a JSON array')
      base.risks = v as Risk[]
      break
    case 'successMetrics':
      if (!Array.isArray(v)) throw new Error('successMetrics must be a JSON array')
      base.successMetrics = v as string[]
      break
    case 'openQuestions':
      if (!Array.isArray(v)) throw new Error('openQuestions must be a JSON array')
      base.openQuestions = v as string[]
      break
    case 'title':
    case 'summary':
    case 'problem':
    case 'targetUser':
    case 'outputFormat':
      if (typeof v !== 'string') throw new Error(`${section} must be a JSON string`)
      base[section] = v
      break
  }
  return base
}

/** Which PRD section each wizard step generates (WIZARD_STEPS → PRD field). */
export const WIZARD_STEP_SECTIONS: Record<string, GeneratableSection | null> = {
  idea: null, // step 0 is user input only — the idea feeds every other section
  targetUser: 'targetUser',
  features: 'features',
  userStories: 'userStories',
  acceptanceCriteria: 'acceptanceCriteria',
  techStack: 'techStack',
  timeline: 'timeline',
  outputFormat: 'outputFormat',
}

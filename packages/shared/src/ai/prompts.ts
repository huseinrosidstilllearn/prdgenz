import { ChatMessage, GenerateInput, Language, OneShotInput, PRDMode, WizardInput } from '../types'

/** JSON structure the AI must return for a full PRD (PRD §6.2.3). */
export const PRD_JSON_SPEC = `{
  "title": string,
  "summary": string,
  "problem": string,
  "targetUser": string,
  "features": [{ "id": string, "name": string, "description": string, "priority": "must" | "should" | "could" }],
  "userStories": [{ "id": string, "asA": string, "iWant": string, "soThat": string }],
  "acceptanceCriteria": [{ "id": string, "featureId": string, "criteria": string }],
  "techStack": { "frontend": string[], "backend": string[], "database": string[], "infrastructure": string[], "reasoning": string },
  "timeline": [{ "id": string, "milestone": string, "duration": string, "deliverables": string[] }],
  "outputFormat": string,
  "risks": [{ "id": string, "description": string, "impact": "high" | "medium" | "low", "mitigation": string }],
  "successMetrics": string[],
  "openQuestions": string[]
}`

const LANG_INSTRUCTION: Record<Language, string> = {
  [Language.ID]: 'You are an expert product manager. Write ALL PRD content in Bahasa Indonesia. User story phrasing uses "Sebagai ..., saya ingin ..., sehingga ...".',
  [Language.EN]: 'You are an expert product manager. Write ALL PRD content in English. User story phrasing uses "As a ..., I want ..., so that ...".',
}

const MODE_INSTRUCTION: Record<PRDMode, string> = {
  [PRDMode.WIZARD]:
    'The user has provided structured input through a step-by-step wizard. Use the provided information to generate a complete PRD. Fill gaps with reasonable, clearly-stated assumptions based on best practices.',
  [PRDMode.CHAT]:
    'You are in a conversational mode. Ask short clarifying questions when critical information is missing, but when the user asks to generate the PRD (or the conversation contains enough context), produce the complete PRD.',
  [PRDMode.ONESHOT]:
    'The user provided a single raw idea. Expand it into a complete, professional PRD in one shot. Make pragmatic assumptions where the idea is vague.',
}

/** System prompt for full-PRD generation (PRD §6.2.3). */
export function buildSystemPrompt(language: Language, mode: PRDMode): string {
  return [
    LANG_INSTRUCTION[language],
    '',
    MODE_INSTRUCTION[mode],
    '',
    'You MUST respond with a single valid JSON object (no markdown fences, no commentary) matching this structure:',
    PRD_JSON_SPEC,
    '',
    'The PRD must be comprehensive, actionable, and ready to be used with AI coding assistants such as Cline, Cursor, or Lovable.',
  ].join('\n')
}

/**
 * System prompt for generating a single wizard section (PRD §6.2.3:
 * "System prompt dinamis, berubah tiap section wizard").
 */
export function buildSectionSystemPrompt(language: Language, section: string): string {
  return [
    LANG_INSTRUCTION[language],
    '',
    `You are generating ONLY the "${section}" section of a Product Requirements Document.`,
    'Respond with valid JSON containing just that section value — no markdown fences, no commentary.',
    'If the section is an array of objects, match the schemas given in the user prompt.',
  ].join('\n')
}

/** System prompt for chat mode turns (PRD §6.1.2). */
export function buildChatSystemPrompt(language: Language): string {
  return [
    LANG_INSTRUCTION[language],
    '',
    'You are helping a user shape a product idea into a PRD through conversation.',
    '- Ask at most 2-3 short clarifying questions per turn when critical info is missing.',
    '- Be concise and friendly. Remember all context from the conversation.',
    '- When the user says "generate", "buat PRD", or similar, respond ONLY with the complete PRD as a single valid JSON object matching this structure:',
    PRD_JSON_SPEC,
  ].join('\n')
}

/** Format the mode-specific user input into a prompt string (PRD §6.2.3). */
export function buildUserPrompt(mode: PRDMode, input: GenerateInput): string {
  switch (mode) {
    case PRDMode.WIZARD:
      return buildWizardUserPrompt(input as WizardInput)
    case PRDMode.ONESHOT:
      return buildOneShotUserPrompt(input as OneShotInput)
    case PRDMode.CHAT:
      return buildChatUserPrompt(input as ChatMessage[])
  }
}

function buildWizardUserPrompt(input: WizardInput): string {
  const parts: string[] = ['Generate a complete PRD from the following wizard input:']
  if (input.idea) parts.push(`## Idea / Problem Statement\n${input.idea}`)
  if (input.problem) parts.push(`## Problem\n${input.problem}`)
  if (input.targetUser) parts.push(`## Target User\n${input.targetUser}`)
  if (input.features?.length) parts.push(`## Features\n${input.features.map((f) => `- ${f}`).join('\n')}`)
  if (input.techStack?.length) parts.push(`## Preferred Tech Stack\n${input.techStack.join(', ')}`)
  if (input.timeline) parts.push(`## Timeline Notes\n${input.timeline}`)
  if (input.constraints) parts.push(`## Constraints\n${input.constraints}`)
  return parts.join('\n\n')
}

function buildOneShotUserPrompt(input: OneShotInput): string {
  const parts = [`## Idea\n${input.idea}`]
  if (input.constraints) parts.push(`## Constraints\n${input.constraints}`)
  return parts.join('\n\n')
}

function buildChatUserPrompt(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')
}

/** Type guards for discriminating GenerateInput (PRD §6.1). */
export function isChatInput(input: GenerateInput): input is ChatMessage[] {
  return Array.isArray(input)
}

export function isWizardInput(input: GenerateInput): input is WizardInput {
  return !Array.isArray(input) && typeof input === 'object' && 'features' in input
}

export function isOneShotInput(input: GenerateInput): input is OneShotInput {
  return !Array.isArray(input) && typeof input === 'object' && 'idea' in input && !('features' in input)
}

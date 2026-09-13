import { WizardInput } from '../types'
import { WIZARD_STEPS } from '../constants'

/**
 * Wizard step reorder/toggle (PRD §6.1.1: "Section bisa di-reorder &
 * di-toggle (show/hide)"). `idea` (step 0) is the mandatory context source
 * for every section — it can never be reordered or hidden.
 */
export const FIXED_WIZARD_STEPS = ['idea'] as const

const TOGGLABLE_STEPS: readonly string[] = WIZARD_STEPS.filter(
  (s) => !(FIXED_WIZARD_STEPS as readonly string[]).includes(s)
)

/**
 * Wizard step → wizard input field mapping used by `filterWizardInput`.
 * `userStories` and `acceptanceCriteria` are notes-only steps: they have no
 * dedicated payload field of their own (their wizard textareas reuse
 * targetUser/problem), so hiding them has NO effect on the AI payload —
 * navigation-only.
 */
const STEP_INPUT_FIELDS: Record<string, keyof WizardInput | null> = {
  idea: null, // always sent — no separate toggle step
  targetUser: 'targetUser',
  features: 'features',
  userStories: null, // notes-only step — no payload field to filter
  acceptanceCriteria: null, // notes-only step — no payload field to filter
  techStack: 'techStack',
  timeline: 'timeline',
  outputFormat: 'constraints',
}

/**
 * Validate a persisted wizard config from localStorage. Returns a clean
 * `{order, hidden}` or `null` when corrupt — callers fall back to the
 * default (WIZARD_STEPS, no hidden steps).
 *
 * Rules:
 * - `order` must be an EXACT permutation of WIZARD_STEPS (same length, same
 *   set, no duplicates) — otherwise null (fallback, no crash).
 * - `hidden` is filtered to togglable members of WIZARD_STEPS; `idea` is
 *   forcibly never hidden (manual localStorage tampering included).
 */
export function normalizeWizardSteps(
  order: string[] | undefined,
  hidden: string[] | undefined
): { order: string[]; hidden: string[] } | null {
  if (!Array.isArray(order) || order.length !== WIZARD_STEPS.length) return null
  const seen = new Set<string>()
  for (const step of order) {
    if (typeof step !== 'string') return null
    if (seen.has(step)) return null // duplicate
    seen.add(step)
  }
  for (const step of WIZARD_STEPS) {
    if (!seen.has(step)) return null // missing step (extra steps imply missing ones at equal length)
  }

  const hiddenClean = Array.isArray(hidden)
    ? hidden.filter((s) => typeof s === 'string' && TOGGLABLE_STEPS.includes(s))
    : []

  return { order: [...order], hidden: hiddenClean }
}

/**
 * Build the wizard input sent to the AI, EXCLUDING fields whose step is
 * hidden. Deterministic and explicit (PRD §6.1.1 toggle = "tidak dikirim ke
 * AI"): hidden steps never reach the prompt. The React state keeps its
 * values — only the payload is filtered, so un-hiding restores input.
 */
export function filterWizardInput(
  input: WizardInput,
  hidden: readonly string[] | undefined
): WizardInput {
  const hiddenSet = new Set(hidden ?? [])
  const drop = new Set<keyof WizardInput>()
  for (const step of hiddenSet) {
    const field = STEP_INPUT_FIELDS[step]
    if (field) drop.add(field)
  }
  const out: WizardInput = { ...input }
  if (drop.has('targetUser')) out.targetUser = ''
  if (drop.has('features')) out.features = []
  if (drop.has('techStack')) out.techStack = []
  if (drop.has('timeline')) out.timeline = ''
  if (drop.has('constraints')) out.constraints = ''
  return out
}

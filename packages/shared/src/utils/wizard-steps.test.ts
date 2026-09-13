import { describe, it, expect } from 'vitest'
import { WIZARD_STEPS } from '../constants'
import { FIXED_WIZARD_STEPS, normalizeWizardSteps, filterWizardInput } from './wizard-steps'
import { WizardInput } from '../types'

const INPUT: WizardInput = {
  idea: 'Aplikasi kasir kedai kopi',
  problem: 'Pencatatan manual',
  targetUser: 'Pemilik kedai',
  features: ['Login', 'Laporan'],
  techStack: ['Next.js'],
  timeline: '1 bulan',
  constraints: 'Offline-first',
}

describe('FIXED_WIZARD_STEPS', () => {
  it('pins idea as the only fixed step', () => {
    expect(FIXED_WIZARD_STEPS).toEqual(['idea'])
  })
})

describe('normalizeWizardSteps (localStorage validation)', () => {
  it('accepts an exact permutation and returns it clean', () => {
    const order = [...WIZARD_STEPS].reverse()
    const out = normalizeWizardSteps(order, ['timeline'])
    expect(out).toEqual({ order, hidden: ['timeline'] })
  })

  it('returns null for a missing step', () => {
    const order = [...WIZARD_STEPS].slice(1)
    expect(normalizeWizardSteps(order, [])).toBeNull()
  })

  it('returns null for an extra/unknown step (wrong set)', () => {
    const order = [...WIZARD_STEPS.slice(0, 7), 'bogus']
    expect(normalizeWizardSteps(order, [])).toBeNull()
  })

  it('returns null for a duplicated step', () => {
    const order = [...WIZARD_STEPS]
    order[1] = order[0] as (typeof WIZARD_STEPS)[number]
    expect(normalizeWizardSteps(order, [])).toBeNull()
  })

  it('returns null for the wrong length', () => {
    expect(normalizeWizardSteps([...WIZARD_STEPS, 'outputFormat'], [])).toBeNull()
    expect(normalizeWizardSteps([], [])).toBeNull()
    expect(normalizeWizardSteps(undefined, [])).toBeNull()
  })

  it('forces idea to stay visible even if hidden was tampered with', () => {
    const out = normalizeWizardSteps([...WIZARD_STEPS], ['idea', 'timeline'])
    expect(out).toEqual({ order: [...WIZARD_STEPS], hidden: ['timeline'] })
  })

  it('filters arbitrary strings out of hidden', () => {
    const out = normalizeWizardSteps([...WIZARD_STEPS], ['nope', 'features', 42 as unknown as string])
    expect(out?.hidden).toEqual(['features'])
  })

  it('tolerates a missing hidden array', () => {
    const out = normalizeWizardSteps([...WIZARD_STEPS], undefined)
    expect(out).toEqual({ order: [...WIZARD_STEPS], hidden: [] })
  })
})

describe('filterWizardInput (toggle = exclude from AI payload)', () => {
  it('drops exactly the fields of hidden steps and keeps the rest', () => {
    const out = filterWizardInput(INPUT, ['targetUser', 'features', 'techStack', 'timeline', 'outputFormat'])
    expect(out).toEqual({
      idea: INPUT.idea,
      problem: INPUT.problem,
      targetUser: '',
      features: [],
      techStack: [],
      timeline: '',
      constraints: '',
    })
  })

  it('keeps the full payload when nothing is hidden', () => {
    expect(filterWizardInput(INPUT, [])).toEqual(INPUT)
    expect(filterWizardInput(INPUT, undefined)).toEqual(INPUT)
  })

  it('does not mutate the input object', () => {
    const snapshot = {
      ...INPUT,
      features: [...INPUT.features],
      techStack: [...(INPUT.techStack ?? [])],
    }
    filterWizardInput(INPUT, ['features'])
    expect(INPUT).toEqual(snapshot)
  })

  it('notes-only steps (userStories, acceptanceCriteria) do not affect the payload', () => {
    const out = filterWizardInput(INPUT, ['userStories', 'acceptanceCriteria'])
    expect(out).toEqual(INPUT)
  })

  it('hiding every togglable step leaves the minimal payload (idea + problem)', () => {
    const all: string[] = WIZARD_STEPS.filter((s) => s !== 'idea')
    const out = filterWizardInput(INPUT, all)
    expect(out).toEqual({
      idea: INPUT.idea,
      problem: INPUT.problem,
      targetUser: '',
      features: [],
      techStack: [],
      timeline: '',
      constraints: '',
    })
  })
})

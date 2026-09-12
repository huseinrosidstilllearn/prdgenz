import { describe, it, expect } from 'vitest'
import {
  GENERATABLE_SECTIONS,
  isGeneratableSection,
  buildSectionUserPrompt,
  sectionSystemPrompt,
  mergeSectionIntoDraft,
  WIZARD_STEP_SECTIONS,
} from './sections'
import { Language, type PRDContent } from '../types'

const INPUT = {
  idea: 'Aplikasi kasir kedai kopi',
  problem: 'Pencatatan manual',
  targetUser: 'Pemilik kedai kopi',
  features: ['Login', 'Laporan harian'],
  techStack: ['Next.js'],
  timeline: '1 bulan',
  constraints: 'Offline-first',
}

describe('GENERATABLE_SECTIONS (PRD §6.1.1 per-section)', () => {
  it('covers every core PRD field plus the optional ones', () => {
    for (const key of ['title', 'summary', 'problem', 'targetUser', 'features', 'userStories', 'acceptanceCriteria', 'techStack', 'timeline', 'outputFormat', 'risks', 'successMetrics', 'openQuestions']) {
      expect(GENERATABLE_SECTIONS).toContain(key)
    }
  })
})

describe('isGeneratableSection', () => {
  it('accepts known sections and rejects unknown keys', () => {
    expect(isGeneratableSection('features')).toBe(true)
    expect(isGeneratableSection('bogus')).toBe(false)
  })
})

describe('buildSectionUserPrompt (PRD §6.2.3 dynamic per-section)', () => {
  it('includes the wizard context sections that are filled', () => {
    const up = buildSectionUserPrompt('features', INPUT)
    expect(up).toContain('## Product idea')
    expect(up).toContain(INPUT.idea)
    expect(up).toContain('## Known problem')
    expect(up).toContain('## Target user')
    expect(up).toContain('- Login')
    expect(up).toContain('## Constraints')
  })

  it('omits empty wizard sections', () => {
    const up = buildSectionUserPrompt('summary', { idea: 'x' })
    expect(up).not.toContain('## Known problem')
    expect(up).not.toContain('## Feature ideas')
  })

  it('asks for the section schema and a bare JSON value', () => {
    const up = buildSectionUserPrompt('userStories', INPUT)
    expect(up).toContain('Generate the "userStories" field')
    expect(up).toContain('asA')
    expect(up).toContain('no markdown fences')
  })

  it('gives techStack its object schema', () => {
    const up = buildSectionUserPrompt('techStack', INPUT)
    expect(up).toContain('"frontend"')
    expect(up).toContain('"reasoning"')
  })
})

describe('sectionSystemPrompt', () => {
  it('names the target section and keeps the language instruction', () => {
    const sp = sectionSystemPrompt(Language.ID, 'summary')
    expect(sp).toContain('ONLY the "summary" section')
    expect(sp).toContain('Bahasa Indonesia')
  })
})

describe('mergeSectionIntoDraft (growing draft)', () => {
  it('starts a draft from null with the generated string section', () => {
    const draft = mergeSectionIntoDraft(null, 'title', 'Kasir Kopi')
    expect(draft.title).toBe('Kasir Kopi')
  })

  it('merges into an existing draft without mutating it', () => {
    const draft0 = mergeSectionIntoDraft(null, 'title', 'Kasir Kopi')
    const draft1 = mergeSectionIntoDraft(draft0, 'problem', 'Manual records')
    expect(draft0.problem).toBeUndefined()
    expect(draft1.title).toBe('Kasir Kopi')
    expect(draft1.problem).toBe('Manual records')
  })

  it('merges each array/object section type', () => {
    let draft: PRDContent | null = null
    draft = mergeSectionIntoDraft(draft, 'features', [
      { id: 'f1', name: 'Login', description: 'Auth', priority: 'must' },
    ])
    draft = mergeSectionIntoDraft(draft, 'techStack', {
      frontend: ['Next.js'],
      backend: [],
      database: [],
      infrastructure: [],
      reasoning: 'x',
    })
    draft = mergeSectionIntoDraft(draft, 'timeline', [
      { id: 't1', milestone: 'MVP', duration: '2w', deliverables: ['a'] },
    ])
    expect(draft.features).toHaveLength(1)
    expect(draft.techStack?.frontend).toEqual(['Next.js'])
    expect(draft.timeline).toHaveLength(1)
  })

  it('merges optional sections (risks, successMetrics, openQuestions)', () => {
    let draft: PRDContent | null = null
    draft = mergeSectionIntoDraft(draft, 'risks', [
      { id: 'r1', description: 'adoption', impact: 'low', mitigation: 'onboarding' },
    ])
    draft = mergeSectionIntoDraft(draft, 'successMetrics', ['10 users'])
    draft = mergeSectionIntoDraft(draft, 'openQuestions', ['QRIS?'])
    expect(draft.risks).toHaveLength(1)
    expect(draft.successMetrics).toEqual(['10 users'])
    expect(draft.openQuestions).toEqual(['QRIS?'])
  })

  it('throws a clear error when the value shape is wrong', () => {
    expect(() => mergeSectionIntoDraft(null, 'features', 'not-an-array')).toThrow(
      'features must be a JSON array'
    )
    expect(() => mergeSectionIntoDraft(null, 'techStack', [1, 2])).toThrow(
      'techStack must be a JSON object'
    )
    expect(() => mergeSectionIntoDraft(null, 'summary', 42)).toThrow(
      'summary must be a JSON string'
    )
  })

  it('unwraps the section field when the AI returns a full PRD object', () => {
    const fullPrd = {
      title: 'Kasir Kopi',
      summary: 'Ringkasan baru',
      problem: 'Problem lama',
    }
    const draft = mergeSectionIntoDraft(null, 'summary', fullPrd)
    expect(draft.summary).toBe('Ringkasan baru')
    // other fields of the full object are NOT merged in
    expect(draft.title).toBeUndefined()
  })
})

describe('WIZARD_STEP_SECTIONS (step → PRD field mapping)', () => {
  it('maps every wizard step to a generatable section (idea excluded)', () => {
    for (const [step, section] of Object.entries(WIZARD_STEP_SECTIONS)) {
      if (section === null) {
        expect(step).toBe('idea')
      } else {
        expect(isGeneratableSection(section)).toBe(true)
      }
    }
  })
})

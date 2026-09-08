import { describe, it, expect } from 'vitest'
import {
  buildSystemPrompt,
  buildUserPrompt,
  buildSectionSystemPrompt,
  buildChatSystemPrompt,
  isChatInput,
  isWizardInput,
  isOneShotInput,
} from './prompts'
import { Language, PRDMode } from '../types'

describe('buildSystemPrompt (PRD §6.2.3)', () => {
  it.each([Language.ID, Language.EN])('includes the language instruction for %s', (lang) => {
    const sp = buildSystemPrompt(lang, PRDMode.WIZARD)
    expect(sp).toContain('expert product manager')
    expect(sp).toContain(lang === Language.ID ? 'Bahasa Indonesia' : 'in English')
  })

  it('includes the JSON structure spec in every mode', () => {
    for (const mode of [PRDMode.WIZARD, PRDMode.CHAT, PRDMode.ONESHOT]) {
      const sp = buildSystemPrompt(Language.EN, mode)
      expect(sp).toContain('"title"')
      expect(sp).toContain('"userStories"')
      expect(sp).toContain('single valid JSON object')
    }
  })

  it('describes the correct mode behavior', () => {
    expect(buildSystemPrompt(Language.EN, PRDMode.WIZARD)).toContain('step-by-step wizard')
    expect(buildSystemPrompt(Language.EN, PRDMode.CHAT)).toContain('conversational mode')
    expect(buildSystemPrompt(Language.EN, PRDMode.ONESHOT)).toContain('single raw idea')
  })
})

describe('buildSectionSystemPrompt (dynamic per-section, PRD §6.2.3)', () => {
  it('mentions the target section', () => {
    const sp = buildSectionSystemPrompt(Language.EN, 'features')
    expect(sp).toContain('"features"')
    expect(sp).toContain('ONLY the "features" section')
  })
})

describe('buildChatSystemPrompt (PRD §6.1.2)', () => {
  it('asks for the full PRD JSON on "generate" intent', () => {
    const sp = buildChatSystemPrompt(Language.ID)
    expect(sp).toContain('generate')
    expect(sp).toContain('buat PRD')
    expect(sp).toContain('"title"')
  })
})

describe('buildUserPrompt per mode', () => {
  it('formats WIZARD input sections', () => {
    const up = buildUserPrompt(PRDMode.WIZARD, {
      idea: 'Aplikasi kasir',
      problem: 'Pencatatan manual',
      targetUser: 'Pemilik warung',
      features: ['Login', 'Laporan'],
      techStack: ['Next.js'],
      timeline: '1 bulan',
      constraints: 'Offline-first',
    })
    expect(up).toContain('## Idea / Problem Statement')
    expect(up).toContain('## Features')
    expect(up).toContain('- Login')
    expect(up).toContain('## Preferred Tech Stack')
    expect(up).toContain('## Constraints')
  })

  it('omits empty wizard sections', () => {
    const up = buildUserPrompt(PRDMode.WIZARD, {
      idea: 'Aplikasi kasir',
      problem: '',
      targetUser: '',
      features: [],
    })
    expect(up).not.toContain('## Problem')
    expect(up).not.toContain('## Features')
    expect(up).not.toContain('## Constraints')
  })

  it('formats ONESHOT input as idea + optional constraints', () => {
    const up = buildUserPrompt(PRDMode.ONESHOT, {
      idea: 'Aplikasi kasir warung kopi',
      constraints: 'Harus murah',
    })
    expect(up).toContain('## Idea')
    expect(up).toContain('## Constraints')
    expect(up).toContain('Harus murah')
  })

  it('formats CHAT messages as a transcript', () => {
    const up = buildUserPrompt(PRDMode.CHAT, [
      { id: '1', role: 'user', content: 'aku mau bikin aplikasi kasir', timestamp: new Date() },
      { id: '2', role: 'assistant', content: 'siapa target usernya?', timestamp: new Date() },
    ])
    expect(up).toContain('User: aku mau bikin aplikasi kasir')
    expect(up).toContain('Assistant: siapa target usernya?')
  })
})

describe('GenerateInput type guards', () => {
  it('identifies chat input (array)', () => {
    expect(isChatInput([])).toBe(true)
    expect(isChatInput({ idea: 'x' })).toBe(false)
  })
  it('identifies wizard input (has features)', () => {
    expect(isWizardInput({ idea: 'x', features: [] })).toBe(true)
    expect(isWizardInput({ idea: 'x' })).toBe(false)
  })
  it('identifies one-shot input (idea, no features)', () => {
    expect(isOneShotInput({ idea: 'x' })).toBe(true)
    expect(isOneShotInput({ idea: 'x', features: [] })).toBe(false)
    expect(isOneShotInput([])).toBe(false)
  })
})

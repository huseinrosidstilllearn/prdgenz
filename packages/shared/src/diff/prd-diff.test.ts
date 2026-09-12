import { describe, it, expect } from 'vitest'
import { diffPRDVersions } from './prd-diff'
import { renderPRDToMarkdown, type PRDContent, Language } from '../index'

function makeContent(overrides: Partial<PRDContent> = {}): PRDContent {
  return {
    title: 'Aplikasi Kasir',
    summary: 'Ringkasan singkat',
    problem: 'Pencatatan manual lambat',
    targetUser: 'Pemilik warung kopi',
    features: [
      { id: 'f1', name: 'Login', description: 'Autentikasi kasir', priority: 'must' },
    ],
    userStories: [
      { id: 'us1', asA: 'pemilik warung', iWant: 'mencatat transaksi', soThat: 'laporan akurat' },
    ],
    acceptanceCriteria: [
      { id: 'ac1', featureId: 'f1', criteria: 'Kasir bisa login dengan email' },
    ],
    techStack: {
      frontend: ['Next.js'],
      backend: ['Node.js'],
      database: ['PostgreSQL'],
      infrastructure: ['Docker'],
      reasoning: 'Ekosistem besar',
    },
    timeline: [{ id: 't1', milestone: 'MVP', duration: '2 minggu', deliverables: ['Fitur inti'] }],
    outputFormat: 'Markdown',
    ...overrides,
  }
}

describe('diffPRDVersions (PRD §6.6 diff view)', () => {
  it('marks identical documents as fully unchanged', () => {
    const md = renderPRDToMarkdown(makeContent(), Language.ID)
    const diff = diffPRDVersions(md, md)
    expect(diff.length).toBeGreaterThan(0)
    for (const section of diff) expect(section.status).toBe('unchanged')
  })

  it('detects a changed section body while others stay unchanged', () => {
    const fromMd = renderPRDToMarkdown(makeContent(), Language.ID)
    const toMd = renderPRDToMarkdown(
      makeContent({ problem: 'Pencatatan manual lambat dan rawan salah.' }),
      Language.ID
    )
    const diff = diffPRDVersions(fromMd, toMd)
    const problem = diff.find((s) => s.heading === 'Masalah')
    expect(problem?.status).toBe('changed')
    expect(problem?.fromText).toBe('Pencatatan manual lambat')
    expect(problem?.toText).toBe('Pencatatan manual lambat dan rawan salah.')
    expect(diff.filter((s) => s.status === 'unchanged').length).toBe(diff.length - 1)
  })

  it('detects an added section (present only in the new version)', () => {
    const fromMd = '# Title\n\n## A\n\na body\n'
    const toMd = '# Title\n\n## A\n\na body\n\n## B\n\nb body\n'
    const diff = diffPRDVersions(fromMd, toMd)
    const added = diff.find((s) => s.heading === 'B')
    expect(added?.status).toBe('added')
    expect(added?.toText).toBe('b body')
    expect(added?.fromText).toBeUndefined()
  })

  it('detects a removed section (present only in the old version)', () => {
    const fromMd = '# Title\n\n## A\n\na body\n\n## B\n\nb body\n'
    const toMd = '# Title\n\n## A\n\na body\n'
    const diff = diffPRDVersions(fromMd, toMd)
    const removed = diff.find((s) => s.heading === 'B')
    expect(removed?.status).toBe('removed')
    expect(removed?.fromText).toBe('b body')
    expect(removed?.toText).toBeUndefined()
  })

  it('keys duplicate headings by occurrence so both are compared separately', () => {
    const fromMd = '# Title\n\n## Same\n\nfirst\n\n## Same\n\nsecond\n'
    const toMd = '# Title\n\n## Same\n\nfirst\n\n## Same\n\nsecond edited\n'
    const diff = diffPRDVersions(fromMd, toMd)
    const same = diff.filter((s) => s.heading === 'Same')
    expect(same).toHaveLength(2)
    expect(same[0].status).toBe('unchanged')
    expect(same[1].status).toBe('changed')
    expect(same[1].toText).toBe('second edited')
  })

  it('treats an H1 title change as a changed level-1 section', () => {
    const fromMd = renderPRDToMarkdown(makeContent(), Language.ID)
    const toMd = renderPRDToMarkdown(makeContent({ title: 'Aplikasi Kasir Pro' }), Language.ID)
    const diff = diffPRDVersions(fromMd, toMd)
    const titleSection = diff.find((s) => s.level === 1)
    expect(titleSection?.heading).toBe('Aplikasi Kasir Pro')
    // The heading itself changed, so the old-title section is 'removed' and the
    // new-title section 'added' — the H1 is still a level-1 diff section.
    expect(['changed', 'added']).toContain(titleSection?.status)
    const oldTitle = diff.find((s) => s.heading === 'Aplikasi Kasir')
    expect(oldTitle?.status).toBe('removed')
    expect(diff[0].level).toBe(1)
  })

  it('handles a section with an empty body', () => {
    const fromMd = '# Title\n\n## Empty\n\n\n## Body\n\ntext\n'
    const toMd = '# Title\n\n## Empty\n\n\n## Body\n\ntext\n'
    const diff = diffPRDVersions(fromMd, toMd)
    expect(diff.find((s) => s.heading === 'Empty')?.status).toBe('unchanged')
  })

  it('orders output by to-document order, removed sections appended at the end', () => {
    const fromMd = '# Title\n\n## A\n\na\n\n## B\n\nb\n\n## C\n\nc\n'
    const toMd = '# Title\n\n## C\n\nc\n\n## A\n\na\n\n## D\n\nd\n'
    const diff = diffPRDVersions(fromMd, toMd)
    expect(diff.map((s) => s.heading)).toEqual(['Title', 'C', 'A', 'D', 'B'])
    expect(diff.map((s) => s.status)).toEqual([
      'unchanged',
      'unchanged',
      'unchanged',
      'added',
      'removed',
    ])
  })

  it('keeps H3+ lines inside the body of their parent section', () => {
    const fromMd = '# Title\n\n## A\n\n### Sub\n\nsub text\n'
    const toMd = '# Title\n\n## A\n\n### Sub\n\nsub text edited\n'
    const diff = diffPRDVersions(fromMd, toMd)
    expect(diff).toHaveLength(2)
    expect(diff[1].status).toBe('changed')
    expect(diff[1].fromText).toContain('### Sub')
    expect(diff[1].fromText).toContain('sub text')
    expect(diff[1].toText).toContain('sub text edited')
  })

  it('returns an empty diff for two empty documents', () => {
    expect(diffPRDVersions('', '')).toEqual([])
  })
})

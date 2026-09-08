import { describe, it, expect } from 'vitest'
import { renderPRDToMarkdown } from './prd-template'
import { Language, type PRDContent } from '../types'

function makeContent(overrides: Partial<PRDContent> = {}): PRDContent {
  return {
    title: 'Aplikasi Kasir',
    summary: 'Ringkasan singkat',
    problem: 'Pencatatan manual lambat',
    targetUser: 'Pemilik warung kopi',
    features: [
      { id: 'f1', name: 'Login', description: 'Autentikasi kasir', priority: 'must' },
      { id: 'f2', name: 'Laporan', description: 'Laporan penjualan harian', priority: 'should' },
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

describe('renderPRDToMarkdown (PRD §6.3)', () => {
  it('renders the document title as an H1', () => {
    const md = renderPRDToMarkdown(makeContent(), Language.ID)
    expect(md.startsWith('# Aplikasi Kasir')).toBe(true)
  })

  it('renders ID section headings in Indonesian', () => {
    const md = renderPRDToMarkdown(makeContent(), Language.ID)
    expect(md).toContain('## Ringkasan')
    expect(md).toContain('## Masalah')
    expect(md).toContain('## Target Pengguna')
    expect(md).toContain('## Fitur')
    expect(md).toContain('## User Story')
    expect(md).toContain('## Kriteria Penerimaan')
  })

  it('renders EN section headings in English', () => {
    const md = renderPRDToMarkdown(makeContent(), Language.EN)
    expect(md).toContain('## Executive Summary')
    expect(md).toContain('## Problem Statement')
    expect(md).toContain('## Target User')
    expect(md).toContain('## Acceptance Criteria')
  })

  it('renders features with bold names and uppercase priority', () => {
    const md = renderPRDToMarkdown(makeContent(), Language.EN)
    expect(md).toContain('- **Login** [MUST]: Autentikasi kasir')
    expect(md).toContain('- **Laporan** [SHOULD]: Laporan penjualan harian')
  })

  it('renders ID user stories with "Sebagai ... saya ingin ... sehingga ..." phrasing', () => {
    const md = renderPRDToMarkdown(makeContent(), Language.ID)
    expect(md).toContain(
      '**Sebagai** pemilik warung, **saya ingin** mencatat transaksi, **sehingga** laporan akurat'
    )
  })

  it('renders EN user stories with "As a ... I want ... so that ..." phrasing', () => {
    const md = renderPRDToMarkdown(makeContent(), Language.EN)
    expect(md).toContain(
      '**As a** pemilik warung, **I want** mencatat transaksi, **so that** laporan akurat'
    )
  })

  it('renders acceptance criteria as GitHub-style checkboxes', () => {
    const md = renderPRDToMarkdown(makeContent(), Language.ID)
    expect(md).toContain('- [ ] Kasir bisa login dengan email')
  })

  it('renders tech stack with all four categories + reasoning', () => {
    const md = renderPRDToMarkdown(makeContent(), Language.ID)
    expect(md).toContain('- **Frontend**: Next.js')
    expect(md).toContain('- **Backend**: Node.js')
    expect(md).toContain('- **Database**: PostgreSQL')
    expect(md).toContain('- **Infrastruktur**: Docker')
    expect(md).toContain('- **Alasan**: Ekosistem besar')
  })

  it('renders timeline with milestone, duration and deliverables', () => {
    const md = renderPRDToMarkdown(makeContent(), Language.ID)
    expect(md).toContain('- **MVP** (Durasi: 2 minggu): Fitur inti')
  })

  it('renders optional sections when present and skips empty ones', () => {
    const md = renderPRDToMarkdown(
      makeContent({
        risks: [{ id: 'r1', description: 'Adopsi rendah', impact: 'high', mitigation: 'Freemium' }],
        successMetrics: ['100 PRD dibuat'],
        openQuestions: ['Perlu trial Pro?'],
      }),
      Language.ID
    )
    expect(md).toContain('Adopsi rendah')
    expect(md).toContain('100 PRD dibuat')
    expect(md).toContain('Perlu trial Pro?')
    expect(md).toContain('## Risiko & Mitigasi')
    expect(md).toContain('## Metrik Keberhasilan')
    expect(md).toContain('## Pertanyaan Terbuka')

    const mdEmpty = renderPRDToMarkdown(makeContent(), Language.ID)
    expect(mdEmpty).not.toContain('## Risiko & Mitigasi')
    expect(mdEmpty).not.toContain('## Metrik Keberhasilan')
  })
})

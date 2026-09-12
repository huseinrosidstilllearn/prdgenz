import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VersionDiff } from './version-diff'
import type { PRDSectionDiff } from '@prdgenz/shared'

const DIFF: PRDSectionDiff[] = [
  { heading: 'Aplikasi Kasir', level: 1, status: 'unchanged', fromText: 'body a', toText: 'body a' },
  { heading: 'Masalah', level: 2, status: 'changed', fromText: 'old problem', toText: 'new problem' },
  { heading: 'Risiko', level: 2, status: 'added', toText: 'risk body' },
  { heading: 'Metrik', level: 2, status: 'removed', fromText: 'metric body' },
]

describe('VersionDiff (PRD §6.6 diff view)', () => {
  it('renders the version range in the header', () => {
    render(<VersionDiff diff={DIFF} fromVersion={1} toVersion={2} />)
    const header = screen.getByText(/comparing/i)
    expect(header.textContent).toContain('v1')
    expect(header.textContent).toContain('v2')
  })

  it('marks unchanged sections collapsed with a No changes badge', () => {
    render(<VersionDiff diff={DIFF} fromVersion={1} toVersion={2} />)
    expect(screen.getByText('No changes')).toBeDefined()
    expect(screen.queryByText('body a')).toBeNull()
  })

  it('renders changed sections as old block above new block with version labels', () => {
    render(<VersionDiff diff={DIFF} fromVersion={1} toVersion={2} />)
    expect(screen.getByText('Changed')).toBeDefined()
    expect(screen.getByText('old problem')).toBeDefined()
    expect(screen.getByText('new problem')).toBeDefined()
    const labels = screen.getAllByText('v1')
    expect(labels.length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('v2').length).toBeGreaterThanOrEqual(1)
  })

  it('renders added sections with only the new block', () => {
    render(<VersionDiff diff={DIFF} fromVersion={1} toVersion={2} />)
    expect(screen.getByText('Added')).toBeDefined()
    expect(screen.getByText('risk body')).toBeDefined()
  })

  it('renders removed sections with only the old block', () => {
    render(<VersionDiff diff={DIFF} fromVersion={1} toVersion={2} />)
    expect(screen.getByText('Removed')).toBeDefined()
    expect(screen.getByText('metric body')).toBeDefined()
  })

  it('renders every section heading', () => {
    render(<VersionDiff diff={DIFF} fromVersion={1} toVersion={2} />)
    for (const section of DIFF) {
      expect(screen.getByText(section.heading)).toBeDefined()
    }
  })

  it('renders an empty diff without crashing', () => {
    render(<VersionDiff diff={[]} fromVersion={1} toVersion={2} />)
    expect(screen.getByText(/comparing/i)).toBeDefined()
  })
})

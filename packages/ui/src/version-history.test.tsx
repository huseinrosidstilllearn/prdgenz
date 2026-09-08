import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VersionHistory } from './version-history'

const VERSIONS = [
  { versionNumber: 1, createdAt: '2026-01-01T10:00:00Z', summary: 'first' },
  { versionNumber: 2, createdAt: '2026-01-02T10:00:00Z', summary: 'second' },
  { versionNumber: 3, createdAt: '2026-01-03T10:00:00Z', summary: 'third' },
]

describe('VersionHistory (PRD §6.6)', () => {
  it('renders every version, newest listed with its number', () => {
    render(<VersionHistory versions={VERSIONS} currentVersion={3} />)
    expect(screen.getByText('v1')).toBeInTheDocument()
    expect(screen.getByText('v2')).toBeInTheDocument()
    expect(screen.getByText('v3')).toBeInTheDocument()
  })

  it('marks the current version and offers no restore button for it', () => {
    render(<VersionHistory versions={VERSIONS} currentVersion={3} onRestore={vi.fn()} />)
    expect(screen.getByText('Current')).toBeInTheDocument()
    const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
    expect(restoreButtons).toHaveLength(2) // v1 and v2 only
  })

  it('fires onRestore with the version number of the clicked row', () => {
    const onRestore = vi.fn()
    render(<VersionHistory versions={VERSIONS} currentVersion={3} onRestore={onRestore} />)
    fireEvent.click(screen.getAllByRole('button', { name: /restore/i })[0])
    expect(onRestore).toHaveBeenCalledWith(1)
  })

  it('shows no restore buttons at all without an onRestore handler', () => {
    render(<VersionHistory versions={VERSIONS} currentVersion={3} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { PRDSectionDiff } from '@prdgenz/shared'
import { VersionDiffView } from './version-diff'

vi.mock('@prdgenz/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@prdgenz/ui')>()
  return {
    ...actual,
    // The real diff table is exercised in packages/ui; here we only care that
    // the view passes the right pair through.
    VersionDiff: ({ fromVersion, toVersion }: { fromVersion: number; toVersion: number }) => (
      <div data-testid="diff">{`${fromVersion}->${toVersion}`}</div>
    ),
  }
})

const VERSIONS = [
  { versionNumber: 3, createdAt: new Date('2026-03-04') },
  { versionNumber: 2, createdAt: new Date('2026-03-03') },
  { versionNumber: 1, createdAt: new Date('2026-03-02') },
]

// The real PRDSectionDiff shape: heading/level/status plus the before and
// after bodies, rather than a list of line operations.
const DIFF: PRDSectionDiff[] = [
  { heading: 'Summary', level: 2, status: 'changed', fromText: 'old', toText: 'new' },
  { heading: 'Risks', level: 2, status: 'added', toText: 'a new section' },
]

describe('VersionDiffView', () => {
  it('preselects the resolved pair in both pickers', () => {
    render(
      <VersionDiffView
        prdId="p1"
        title="Booking platform"
        versions={VERSIONS}
        from={2}
        to={3}
        diff={DIFF}
      />
    )
    expect((screen.getByLabelText('From') as HTMLSelectElement).value).toBe('2')
    expect((screen.getByLabelText('To') as HTMLSelectElement).value).toBe('3')
  })

  it('offers every known version in the picker', () => {
    render(
      <VersionDiffView
        prdId="p1"
        title="Booking platform"
        versions={VERSIONS}
        from={2}
        to={3}
        diff={DIFF}
      />
    )
    expect(screen.getAllByRole('option')).toHaveLength(6)
  })

  it('submits as a plain GET so the comparison URL is shareable', () => {
    const { container } = render(
      <VersionDiffView
        prdId="p1"
        title="Booking platform"
        versions={VERSIONS}
        from={2}
        to={3}
        diff={DIFF}
      />
    )
    const form = container.querySelector('form')!
    expect(form.getAttribute('method')).toBe('get')
  })

  it('passes the pair to the diff renderer', () => {
    render(
      <VersionDiffView
        prdId="p1"
        title="Booking platform"
        versions={VERSIONS}
        from={2}
        to={3}
        diff={DIFF}
      />
    )
    expect(screen.getByTestId('diff')).toHaveTextContent('2->3')
  })
})

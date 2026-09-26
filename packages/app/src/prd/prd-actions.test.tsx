import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { PRDContent } from '@prdgenz/shared'
import { ShareButton } from './share-button'
import { ExportActions } from './export-actions'
import { PRDActions } from './prd-actions'

// The real PRDContent shape. renderAIReadyPrompt walks every field, so a
// partial fixture throws deep inside the template and the assertion ends up
// testing the wrong thing.
const CONTENT: PRDContent = {
  title: 'Booking platform',
  summary: 'A booking platform',
  problem: 'Scheduling is manual',
  targetUser: 'freelancers',
  features: [{ id: 'f1', name: 'Auth', description: 'Sign in', priority: 'must' }],
  userStories: [],
  acceptanceCriteria: [],
  techStack: {
    frontend: ['Next.js'],
    backend: ['Node'],
    database: ['SQLite'],
    infrastructure: [],
    reasoning: 'small team',
  },
  timeline: [{ id: 't1', milestone: 'MVP', duration: '4 weeks', deliverables: ['auth'] }],
  outputFormat: 'web app',
  risks: [],
  successMetrics: [],
  openQuestions: [],
}

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}))

const writeText = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  push.mockClear()
  writeText.mockClear()
  vi.stubGlobal('fetch', vi.fn())
  // navigator.clipboard is read-only in jsdom, so it has to be redefined.
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  })
})

const mockFetch = (body: unknown, ok = true) => {
  const fn = vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('ShareButton', () => {
  it('creates a link and reports the URL on the first press', async () => {
    mockFetch({ shareId: 'abc123' })
    render(<ShareButton prdId="p1" />)
    fireEvent.click(screen.getByRole('button', { name: /create share link/i }))
    await waitFor(() => expect(screen.getByText(/share link copied/i)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /copy share link/i })).toBeInTheDocument()
  })

  it('re-copies the existing link instead of minting a second one', async () => {
    const fetchMock = mockFetch({ shareId: 'abc123' })
    render(<ShareButton prdId="p1" />)
    fireEvent.click(screen.getByRole('button', { name: /create share link/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /copy share link/i })).toBeInTheDocument())
    const callsAfterCreate = fetchMock.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: /copy share link/i }))
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2))
    // The second press must not POST again.
    expect(fetchMock.mock.calls.length).toBe(callsAfterCreate)
  })

  it('surfaces the API error message', async () => {
    mockFetch({ error: 'Rate limited' }, false)
    render(<ShareButton prdId="p1" />)
    fireEvent.click(screen.getByRole('button', { name: /create share link/i }))
    await waitFor(() => expect(screen.getByText('Rate limited')).toBeInTheDocument())
  })
})

describe('ExportActions', () => {
  it('warns that PDF is a paid export only when locked', () => {
    const { rerender } = render(
      <ExportActions prdId="p1" title="Booking" content={CONTENT} pdfLocked />
    )
    expect(screen.getByText(/pdf export requires pro/i)).toBeInTheDocument()
    rerender(<ExportActions prdId="p1" title="Booking" content={CONTENT} />)
    expect(screen.queryByText(/pdf export requires pro/i)).not.toBeInTheDocument()
  })

  it('copies the AI-ready prompt to the clipboard', async () => {
    render(<ExportActions prdId="p1" title="Booking" content={CONTENT} />)
    fireEvent.click(screen.getByRole('button', { name: /ai prompt/i }))
    await waitFor(() =>
      expect(screen.getByText(/copied to clipboard/i)).toBeInTheDocument()
    )
    expect(writeText).toHaveBeenCalled()
  })

  it('reports a server-side export failure', async () => {
    mockFetch({ error: 'Document not found' }, false)
    render(<ExportActions prdId="p1" title="Booking" content={CONTENT} />)
    fireEvent.click(screen.getByRole('button', { name: /markdown/i }))
    await waitFor(() => expect(screen.getByText('Document not found')).toBeInTheDocument())
  })
})

describe('PRDActions capabilities', () => {
  it('hides share and regenerate unless the app enables them', () => {
    render(
      <PRDActions prdId="p1" title="Booking" content={CONTENT} language="EN" />
    )
    expect(screen.queryByRole('button', { name: /create share link/i })).not.toBeInTheDocument()
    // Match the full label: SectionRegenerate also has a Regenerate button.
    expect(
      screen.queryByRole('button', { name: 'Regenerate (new version)' })
    ).not.toBeInTheDocument()
  })

  it('shows share and regenerate when the app enables them', () => {
    render(
      <PRDActions
        prdId="p1"
        title="Booking"
        content={CONTENT}
        language="EN"
        canShare
        canRegenerate
      />
    )
    expect(screen.getByRole('button', { name: /create share link/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Regenerate (new version)' })
    ).toBeInTheDocument()
  })

  it('offers every clause for individual regeneration', () => {
    render(
      <PRDActions prdId="p1" title="Booking" content={CONTENT} language="EN" />
    )
    const select = screen.getByLabelText(/regenerate a single section/i) as HTMLSelectElement
    // The 11 clauses the PRD defines, not a hand-picked subset.
    expect(select.options).toHaveLength(11)
  })
})

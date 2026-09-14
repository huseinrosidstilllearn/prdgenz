// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import NotFound from './not-found'
import Loading from './loading'
import ErrorPage from './error'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

afterEach(() => {
  cleanup()
})

describe('not-found (S2)', () => {
  it('renders 404 with a link to Home', () => {
    render(<NotFound />)
    expect(screen.getByText('404: Page not found')).toBeDefined()
    expect(screen.getByRole('link', { name: 'Back to Home' }).getAttribute('href')).toBe('/')
  })
})

describe('loading (S2)', () => {
  it('renders an accessible loading spinner', () => {
    render(<Loading />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeDefined()
  })
})

describe('error (S2)', () => {
  it('shows the error message and recovers via reset', () => {
    const reset = vi.fn()
    render(<ErrorPage error={new Error('boom')} reset={reset} />)
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('boom')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalledOnce()
  })

  it('links back to Home (self-host has no dashboard)', () => {
    render(<ErrorPage error={new Error('boom')} reset={() => {}} />)
    expect(screen.getByRole('link', { name: 'Back to Home' }).getAttribute('href')).toBe('/')
  })
})

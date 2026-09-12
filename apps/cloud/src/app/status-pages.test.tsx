// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NotFound from './not-found'
import Loading from './loading'
import ErrorPage from './error'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('not-found (T3)', () => {
  it('renders 404 with links to Dashboard and Landing', () => {
    render(<NotFound />)
    expect(screen.getByText('404 — Page not found')).toBeDefined()
    expect(
      screen.getByRole('link', { name: 'Back to Dashboard' }).getAttribute('href')
    ).toBe('/dashboard')
    expect(screen.getByRole('link', { name: 'Go to Landing' }).getAttribute('href')).toBe('/')
  })
})

describe('loading (T3)', () => {
  it('renders an accessible loading spinner', () => {
    render(<Loading />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeDefined()
  })
})

describe('error (T3)', () => {
  it('shows the error message and recovers via reset', () => {
    const reset = vi.fn()
    render(<ErrorPage error={new Error('boom')} reset={reset} />)
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('boom')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalledOnce()
  })
})

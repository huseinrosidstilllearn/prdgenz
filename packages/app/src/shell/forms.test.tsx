import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthShell, FormSection } from './forms'
import { RouteNotFound } from './routes'

describe('AuthShell', () => {
  it('renders the title, subtitle, children, and footer', () => {
    render(
      <AuthShell title="Welcome back" subtitle="Log in" footer={<a href="/register">Register</a>}>
        <input aria-label="email" />
      </AuthShell>
    )
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByText('Log in')).toBeInTheDocument()
    expect(screen.getByLabelText('email')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
  })

  it('omits the footer paragraph when none is given', () => {
    const { container } = render(
      <AuthShell title="Sign in" subtitle="Log in">
        <span />
      </AuthShell>
    )
    // The subtitle paragraph inside <main>, none for a footer. The brand
    // panel carries its own paragraphs; scope to the form column.
    expect(container.querySelector('main')?.querySelectorAll('p')).toHaveLength(1)
  })
})

describe('FormSection', () => {
  it('renders a title and optional description', () => {
    render(
      <FormSection title="AI providers" description="Set the env var.">
        <span>child</span>
      </FormSection>
    )
    expect(screen.getByRole('heading', { name: 'AI providers' })).toBeInTheDocument()
    expect(screen.getByText('Set the env var.')).toBeInTheDocument()
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('omits the description paragraph when not given', () => {
    render(
      <FormSection title="Storage">
        <span>child</span>
      </FormSection>
    )
    expect(screen.queryByText(/volume/i)).not.toBeInTheDocument()
  })
})

describe('RouteNotFound', () => {
  it('points the escape links at the values it was given', () => {
    render(<RouteNotFound backHref="/" backLabel="Back to your PRDs" />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to your PRDs' }).getAttribute('href')
    ).toBe('/')
    expect(screen.getByRole('link', { name: 'Go to landing' }).getAttribute('href')).toBe('/')
  })
})

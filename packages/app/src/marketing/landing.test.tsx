import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FREE_PLAN_LIMIT, PRO_PRICE } from '@prdgenz/shared'
import { Landing } from './landing'

const renderLanding = (props: { signedIn: boolean; isSelfHost?: boolean }) =>
  render(<Landing {...props} />)

describe('Landing', () => {
  it('invites a signed-out visitor to register', () => {
    renderLanding({ signedIn: false })
    expect(screen.getAllByRole('link', { name: /create an account/i }).length).toBeGreaterThan(0)
    // "Log in" appears in the header and again in the footer.
    expect(screen.getAllByRole('link', { name: /log in/i }).length).toBeGreaterThan(0)
  })

  it('sends a signed-in user to a new PRD instead', () => {
    renderLanding({ signedIn: true })
    expect(screen.getAllByRole('link', { name: /new prd/i }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('quotes the real plan limits rather than invented numbers', () => {
    renderLanding({ signedIn: false })
    expect(
      screen.getByText(new RegExp(`${FREE_PLAN_LIMIT} PRDs a month`))
    ).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Pro is \\$${PRO_PRICE}`))).toBeInTheDocument()
  })

  it('lists the three ways in as an ordered list', () => {
    renderLanding({ signedIn: false })
    expect(screen.getByRole('heading', { name: /three ways to start/i })).toBeInTheDocument()
    // Each row link contains its title and description, so match the title.
    const ways = screen.getAllByRole('listitem').map((li) => li.textContent ?? '')
    expect(ways.join(' ')).toMatch(/Create from Scratch/)
    expect(ways.join(' ')).toMatch(/Chat/)
    expect(ways.join(' ')).toMatch(/One-Shot/)
    expect(
      screen.getByRole('link', { name: /create from scratch/i })
    ).toHaveAttribute('href', '/prd/new/wizard')
  })

  it('hides the self-host note on a self-hosted install', () => {
    renderLanding({ signedIn: true, isSelfHost: true })
    expect(screen.queryByRole('heading', { name: /run it yourself/i })).toBeNull()
  })
})

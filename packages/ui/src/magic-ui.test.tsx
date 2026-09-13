import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ShimmerButton } from './shimmer-button'
import { BorderBeam } from './border-beam'
import { DotPattern } from './dot-pattern'
import { Marquee } from './marquee'

describe('Magic UI components', () => {
  it('ShimmerButton renders a button with gradient animation class', () => {
    render(<ShimmerButton>Mulai Gratis</ShimmerButton>)
    const btn = screen.getByRole('button', { name: 'Mulai Gratis' })
    expect(btn.className).toContain('animate-shimmer')
    expect(btn.className).toContain('bg-gradient-to-r')
  })

  it('ShimmerButton asChild renders child anchor', () => {
    render(
      <ShimmerButton asChild>
        <a href="/prd/new">Go</a>
      </ShimmerButton>
    )
    const link = screen.getByRole('link', { name: 'Go' })
    expect(link.className).toContain('animate-shimmer')
  })

  it('BorderBeam renders hidden overlay with beam animation', () => {
    const { container } = render(<BorderBeam />)
    const overlay = container.firstElementChild as HTMLElement
    expect(overlay.getAttribute('aria-hidden')).toBe('true')
    expect(overlay.className).toContain('absolute')
    expect(overlay.firstElementChild?.className).toContain('animate-beam')
  })

  it('DotPattern renders svg with pattern fill', () => {
    const { container } = render(
      <DotPattern className="absolute inset-0 text-border" />
    )
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.querySelector('pattern circle')).not.toBeNull()
  })

  it('Marquee renders children twice for seamless loop', () => {
    render(
      <Marquee>
        <span>item</span>
      </Marquee>
    )
    const items = screen.getAllByText('item')
    expect(items).toHaveLength(2)
  })
})

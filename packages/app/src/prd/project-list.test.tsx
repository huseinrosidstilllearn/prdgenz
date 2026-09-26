import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PRDList } from './prd-list'
import { ProjectList } from './project-list'

const PRD = {
  id: 'p1',
  title: 'Booking platform',
  projectName: 'Marketplace',
  version: 3,
  mode: 'WIZARD',
  language: 'ID' as const,
  updatedAt: '2026-03-04T10:00:00.000Z',
}

describe('PRDList', () => {
  it('renders one row per document with its version and language', () => {
    render(<PRDList items={[PRD, { ...PRD, id: 'p2', title: 'Second' }]} />)
    expect(screen.getByText('Booking platform')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getAllByText('v3')).toHaveLength(2)
    expect(screen.getAllByText('Bahasa Indonesia')).toHaveLength(2)
  })

  it('omits the project name when the app has no Project table', () => {
    const { projectName: _dropped, ...withoutProject } = PRD
    render(<PRDList items={[withoutProject]} />)
    expect(screen.queryByText('Marketplace')).not.toBeInTheDocument()
  })
})

describe('ProjectList', () => {
  const PROJECT = {
    id: 'pr1',
    name: 'Marketplace',
    description: 'Two-sided booking',
    prdCount: 4,
    updatedAt: '2026-03-04T10:00:00.000Z',
  }

  it('shows the name, description, and document count', () => {
    render(<ProjectList items={[PROJECT]} />)
    expect(screen.getByText('Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Two-sided booking')).toBeInTheDocument()
    expect(screen.getByText('4 docs')).toBeInTheDocument()
  })

  it('uses the singular for a single document', () => {
    render(<ProjectList items={[{ ...PROJECT, prdCount: 1, description: null }]} />)
    expect(screen.getByText('1 doc')).toBeInTheDocument()
  })

  it('omits the description when there is none', () => {
    render(<ProjectList items={[{ ...PROJECT, description: null }]} />)
    expect(screen.queryByText('Two-sided booking')).not.toBeInTheDocument()
  })
})

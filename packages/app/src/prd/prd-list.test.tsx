import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PRDList, type PRDListItem } from './prd-list'

const ITEM: PRDListItem = {
  id: 'prd_1',
  title: 'Invoicing for freelancers',
  projectName: 'Billing',
  version: 3,
  mode: 'WIZARD',
  language: 'EN',
  updatedAt: '2026-09-20T10:00:00.000Z',
}

const renderList = (items: PRDListItem[]) => render(<PRDList items={items} />)

describe('PRDList', () => {
  it('renders one row per document, linking to it', () => {
    renderList([ITEM])
    const link = screen.getByRole('link', { name: /invoicing for freelancers/i })
    expect(link).toHaveAttribute('href', '/prd/prd_1')
  })

  it('shows real metadata: version, mode, language, and project', () => {
    renderList([ITEM])
    expect(screen.getByText('v3')).toBeInTheDocument()
    expect(screen.getByText('wizard')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Billing')).toBeInTheDocument()
  })

  it('labels an Indonesian document honestly', () => {
    renderList([{ ...ITEM, language: 'ID' }])
    expect(screen.getByText('Bahasa Indonesia')).toBeInTheDocument()
  })

  it('omits the project column on installs that have no Project table', () => {
    const { projectName: _projectName, ...withoutProject } = ITEM
    renderList([withoutProject])
    expect(screen.getByText('v3')).toBeInTheDocument()
    expect(screen.queryByText('Billing')).toBeNull()
  })

  it('renders every item passed in', () => {
    renderList([ITEM, { ...ITEM, id: 'prd_2', title: 'Second document' }])
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})

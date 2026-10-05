import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkspaceStart } from './workspace-start'

describe('WorkspaceStart', () => {
  it('gives a new cloud account real setup destinations and a labelled example', () => {
    render(<WorkspaceStart providerConfigured={false} hasProject={false} />)
    expect(screen.getByRole('link', { name: 'Add API key' })).toHaveAttribute('href', '/settings')
    expect(screen.getByRole('link', { name: 'Create a project' })).toHaveAttribute('href', '#projects')
    expect(screen.getByRole('link', { name: 'Create your first PRD' })).toHaveAttribute('href', '/prd/new')
    expect(screen.getByText('Example PRD')).toBeInTheDocument()
    expect(screen.queryByText('Done')).not.toBeInTheDocument()
  })

  it('shows completed setup from the supplied account state', () => {
    render(<WorkspaceStart providerConfigured hasProject />)
    expect(screen.getAllByText('Done')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Manage providers' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View projects' })).toBeInTheDocument()
  })

  it('omits project setup on self-host', () => {
    render(<WorkspaceStart providerConfigured={false} />)
    expect(screen.queryByText('Give it a project')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CreateProjectButton } from './create-project'

const refresh = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.setAttribute('open', '') } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.removeAttribute('open') } })
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

function openDialog() {
  render(<CreateProjectButton />)
  fireEvent.click(screen.getByRole('button', { name: 'New Project' }))
  return screen.getByRole('dialog', { name: 'New Project' })
}

describe('CreateProjectButton', () => {
  it('opens an accessible dialog and supports cancelling it', () => {
    const dialog = openDialog()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(dialog.hasAttribute('open')).toBe(false)
  })

  it('validates an empty name before submitting', () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    openDialog()
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(screen.getByRole('alert').textContent).toBe('Project name is required.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('closes and refreshes the workspace after a successful create', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 201 })))
    const dialog = openDialog()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'First product' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(dialog.hasAttribute('open')).toBe(false))
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('keeps the entered name and allows retry after a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    openDialog()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'First product' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    await screen.findByRole('alert')
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('First product')
    expect((screen.getByRole('button', { name: 'Create' }) as HTMLButtonElement).disabled).toBe(false)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('shows a rejected request without closing the dialog', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Project limit reached' }), { status: 403 })))
    const dialog = openDialog()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Second product' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Project limit reached')
    expect(dialog.hasAttribute('open')).toBe(true)
  })
})

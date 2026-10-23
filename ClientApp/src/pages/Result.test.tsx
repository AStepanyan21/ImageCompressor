import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Result } from './Result'
import { MemoryRouter } from 'react-router-dom'

describe('Result', () => {
  it('renders result page correctly', () => {
    render(
      <MemoryRouter>
        <Result />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Compression Result' })).toBeInTheDocument()
    expect(screen.getByText('Checking compression status...')).toBeInTheDocument()
  })

  it('checks status and shows result', async () => {
    render(
      <MemoryRouter>
        <Result />
      </MemoryRouter>
    )

    // Wait for initial status check
    await waitFor(() => {
      expect(screen.getByText('Checking compression status...')).toBeInTheDocument()
    })

    // Click check status button
    const checkButton = screen.getByRole('button', { name: 'Check Status' })
    fireEvent.click(checkButton)

    // After delay, should show success state
    await waitFor(() => {
      expect(screen.getByText('Image compressed successfully!')).toBeInTheDocument()
    }, { timeout: 3000 })
  }, 5000)

  it('allows download and upload another', async () => {
    render(
      <MemoryRouter>
        <Result />
      </MemoryRouter>
    )

    // Wait for initial status check
    await waitFor(() => {
      expect(screen.getByText('Checking compression status...')).toBeInTheDocument()
    })

    const checkButton = screen.getByRole('button', { name: 'Check Status' })
    fireEvent.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Image compressed successfully!')).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(screen.getByRole('link', { name: 'Download' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload Another' })).toBeInTheDocument()
  }, 5000)
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Upload } from './Upload'
import { MemoryRouter } from 'react-router-dom'
import { UploadService } from '../services/api'

vi.mock('../services/api', () => ({
  UploadService: {
    uploadImage: vi.fn(),
  },
}))

describe('Upload', () => {
  it('renders upload form correctly', () => {
    render(
      <MemoryRouter>
        <Upload />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Upload Image' })).toBeInTheDocument()
    expect(screen.getByText('Select Image')).toBeInTheDocument()
  })

  it('validates file type', async () => {
    render(
      <MemoryRouter>
        <Upload />
      </MemoryRouter>
    )

    const fileInput = screen.getByRole('button', { name: 'Select Image' }) as HTMLLabelElement
    const input = fileInput.previousElementSibling as HTMLInputElement
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('Please select a valid image file')).toBeInTheDocument()
    })
  })

  it('shows preview for valid image', async () => {
    render(
      <MemoryRouter>
        <Upload />
      </MemoryRouter>
    )

    const fileInput = screen.getByRole('button', { name: 'Select Image' }) as HTMLLabelElement
    const input = fileInput.previousElementSibling as HTMLInputElement
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })
  })

  it('calls upload service on submit', async () => {
    const uploadMock = vi.mocked(UploadService.uploadImage)
    uploadMock.mockResolvedValue({ success: true })

    render(
      <MemoryRouter>
        <Upload />
      </MemoryRouter>
    )

    const fileInput = screen.getByRole('button', { name: 'Select Image' }) as HTMLLabelElement
    const input = fileInput.previousElementSibling as HTMLInputElement
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    
    fireEvent.change(input, { target: { files: [file] } })

    const submitButton = screen.getByRole('button', { name: 'Upload & Wait' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(uploadMock).toHaveBeenCalledWith(file)
    })
  })
})

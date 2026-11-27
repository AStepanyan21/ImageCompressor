import { screen, fireEvent, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Upload } from './Upload'
import { ApiError, AuthService, ImageService } from '../services/api'
import { makeImage, renderWithProviders } from '../test/utils'

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>()
  return {
    ...actual,
    AuthService: { register: vi.fn(), login: vi.fn(), logout: vi.fn(), me: vi.fn() },
    ImageService: { upload: vi.fn(), list: vi.fn() },
  }
})

const jpeg = () => new File(['x'.repeat(2048)], 'photo.jpg', { type: 'image/jpeg' })

function selectFile(file: File) {
  fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } })
}

describe('Upload page', () => {
  beforeEach(() => {
    vi.mocked(AuthService.me).mockResolvedValue({ username: 'testuser' })
    vi.mocked(ImageService.list).mockResolvedValue([])
  })

  it('renders the form with default quality 75 and disabled submit', async () => {
    renderWithProviders(<Upload />)
    expect(screen.getByRole('heading', { name: 'Compress an image' })).toBeInTheDocument()
    expect(screen.getByLabelText('Quality')).toHaveValue('75')
    expect(screen.getByRole('button', { name: 'Compress' })).toBeDisabled()
    expect(await screen.findByText(/No compressed images yet/)).toBeInTheDocument()
  })

  it('rejects non-image files', async () => {
    renderWithProviders(<Upload />)
    selectFile(new File(['content'], 'notes.txt', { type: 'text/plain' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Please select an image file')
    expect(screen.getByRole('button', { name: 'Compress' })).toBeDisabled()
  })

  it('shows a preview of the selected image', async () => {
    renderWithProviders(<Upload />)
    selectFile(jpeg())
    expect(await screen.findByAltText('Preview')).toBeInTheDocument()
    expect(screen.getByText('photo.jpg')).toBeInTheDocument()
  })

  it('uploads with the selected quality and shows the result and history entry', async () => {
    const image = makeImage({ id: 7, originalSize: 2048, compressedSize: 512, quality: 40 })
    vi.mocked(ImageService.upload).mockResolvedValue(image)

    renderWithProviders(<Upload />)
    await screen.findByText(/No compressed images yet/)

    selectFile(jpeg())
    fireEvent.change(screen.getByLabelText('Quality'), { target: { value: '40' } })
    fireEvent.click(screen.getByRole('button', { name: 'Compress' }))

    await waitFor(() => expect(ImageService.upload).toHaveBeenCalledWith(expect.any(File), 40))
    expect(await screen.findByRole('heading', { name: 'Done!' })).toBeInTheDocument()
    expect(screen.getByText('Saved 75%')).toBeInTheDocument()
    expect(await screen.findByRole('slider', { name: /Comparison divider/ })).toHaveAttribute('aria-valuenow', '50')

    const history = screen.getByRole('region', { name: 'Upload history' })
    expect(within(history).getByText('photo.jpg')).toBeInTheDocument()
    expect(within(history).getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      '/api/image/1/content?download=true',
    )
  })

  it('shows an error when the server cannot read the image', async () => {
    vi.mocked(ImageService.upload).mockRejectedValue(new ApiError('File is not a supported image', 400))
    renderWithProviders(<Upload />)
    selectFile(jpeg())
    fireEvent.click(screen.getByRole('button', { name: 'Compress' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be read as an image')
  })

  it('renders the history loaded from the API', async () => {
    vi.mocked(ImageService.list).mockResolvedValue([
      makeImage({ id: 2, originalFileName: 'second.png' }),
      makeImage({ id: 1, originalFileName: 'first.jpg' }),
    ])
    renderWithProviders(<Upload />)

    const items = await screen.findAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('second.png')
    expect(items[0]).toHaveTextContent('Quality 75')
  })

  it('offers retry when history fails to load', async () => {
    vi.mocked(ImageService.list).mockRejectedValueOnce(new ApiError('boom', 500))
    renderWithProviders(<Upload />)

    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }))
    expect(await screen.findByText(/No compressed images yet/)).toBeInTheDocument()
    expect(ImageService.list).toHaveBeenCalledTimes(2)
  })
})

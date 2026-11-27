import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ImageHistory } from './ImageHistory'
import { I18nProvider } from '../i18n/I18nContext'
import { makeImage } from '../test/utils'

const images = [
  makeImage({ id: 3, originalFileName: 'third.png', url: '/api/image/3/content', downloadUrl: '/api/image/3/content?download=true' }),
  makeImage({ id: 2, originalFileName: 'second.jpg', url: '/api/image/2/content', downloadUrl: '/api/image/2/content?download=true' }),
  makeImage({ id: 1, originalFileName: 'first.jpg', url: '/api/image/1/content', downloadUrl: '/api/image/1/content?download=true' }),
]

function renderHistory(language: 'en' | 'ru' = 'en') {
  return render(
    <I18nProvider initialLanguage={language}>
      <ImageHistory images={images} status="ready" onRetry={() => {}} />
    </I18nProvider>,
  )
}

const dialog = () => screen.getByRole('dialog')
const viewerImage = () => within(dialog()).getByRole('img')

describe('History image viewer', () => {
  it('opens the clicked image from the thumbnail', () => {
    renderHistory()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open second.jpg' }))

    expect(dialog()).toHaveAccessibleName('second.jpg')
    expect(viewerImage()).toHaveAttribute('src', '/api/image/2/content')
    expect(within(dialog()).getByText('2 of 3')).toBeInTheDocument()
    expect(within(dialog()).getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      '/api/image/2/content?download=true',
    )
  })

  it('opens the image when clicking its name', () => {
    renderHistory()
    fireEvent.click(screen.getByRole('button', { name: 'third.png' }))
    expect(viewerImage()).toHaveAttribute('src', '/api/image/3/content')
  })

  it('navigates with buttons and arrow keys, hiding arrows at the edges', () => {
    renderHistory()
    fireEvent.click(screen.getByRole('button', { name: 'Open third.png' }))

    expect(within(dialog()).queryByRole('button', { name: 'Previous image' })).not.toBeInTheDocument()
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Next image' }))
    expect(viewerImage()).toHaveAttribute('src', '/api/image/2/content')

    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(viewerImage()).toHaveAttribute('src', '/api/image/1/content')
    expect(within(dialog()).queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(viewerImage()).toHaveAttribute('src', '/api/image/1/content')

    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(viewerImage()).toHaveAttribute('src', '/api/image/2/content')
  })

  it('closes with Escape and returns focus to the opener', () => {
    renderHistory()
    const opener = screen.getByRole('button', { name: 'Open first.jpg' })
    opener.focus()
    fireEvent.click(opener)

    expect(within(dialog()).getByRole('button', { name: 'Close' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })

  it('closes with the close button and by clicking the backdrop, but not the image', () => {
    renderHistory()
    fireEvent.click(screen.getByRole('button', { name: 'Open first.jpg' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open first.jpg' }))
    fireEvent.click(viewerImage())
    expect(dialog()).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('viewer-backdrop'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows an error when the image cannot be loaded', () => {
    renderHistory()
    fireEvent.click(screen.getByRole('button', { name: 'Open first.jpg' }))
    fireEvent.error(viewerImage())
    expect(within(dialog()).getByRole('alert')).toHaveTextContent('Failed to load the image')
  })

  it('is translated to Russian', () => {
    renderHistory('ru')
    fireEvent.click(screen.getByRole('button', { name: 'Открыть second.jpg' }))
    expect(within(dialog()).getByRole('button', { name: 'Закрыть' })).toBeInTheDocument()
    expect(within(dialog()).getByText('2 из 3')).toBeInTheDocument()
  })
})

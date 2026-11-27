import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { I18nProvider } from '../i18n/I18nContext'
import type { Language } from '../i18n/translations'
import type { CompressedImage } from '../services/api'

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', language = 'en' }: { route?: string; language?: Language } = {},
) {
  return render(
    <I18nProvider initialLanguage={language}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthProvider>
    </I18nProvider>,
  )
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

export function makeImage(overrides: Partial<CompressedImage> = {}): CompressedImage {
  return {
    id: 1,
    originalFileName: 'photo.jpg',
    contentType: 'image/jpeg',
    originalSize: 2048,
    compressedSize: 1024,
    quality: 75,
    createdAt: '2026-11-27T10:00:00Z',
    url: '/api/image/1/content',
    downloadUrl: '/api/image/1/content?download=true',
    ...overrides,
  }
}

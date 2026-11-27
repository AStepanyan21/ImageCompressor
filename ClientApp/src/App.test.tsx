import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AppRoutes } from './App'
import { AuthService, ImageService } from './services/api'
import { renderWithProviders } from './test/utils'

vi.mock('./services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./services/api')>()
  return {
    ...actual,
    AuthService: { register: vi.fn(), login: vi.fn(), logout: vi.fn(), me: vi.fn() },
    ImageService: { upload: vi.fn(), list: vi.fn().mockResolvedValue([]) },
  }
})

describe('routing', () => {
  it('redirects anonymous users from /upload to the login page', async () => {
    vi.mocked(AuthService.me).mockResolvedValue(null)
    renderWithProviders(<AppRoutes />, { route: '/upload' })

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument()
  })

  it('redirects logged-in users from /login to the upload page', async () => {
    vi.mocked(AuthService.me).mockResolvedValue({ username: 'testuser' })
    vi.mocked(ImageService.list).mockResolvedValue([])
    renderWithProviders(<AppRoutes />, { route: '/login' })

    expect(await screen.findByRole('heading', { name: 'Compress an image' })).toBeInTheDocument()
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('logs out and returns to the login page', async () => {
    vi.mocked(AuthService.me).mockResolvedValue({ username: 'testuser' })
    vi.mocked(AuthService.logout).mockResolvedValue()
    vi.mocked(ImageService.list).mockResolvedValue([])
    renderWithProviders(<AppRoutes />, { route: '/upload' })

    fireEvent.click(await screen.findByRole('button', { name: 'Log out' }))

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(AuthService.logout).toHaveBeenCalled()
  })

  it('switches the interface language and remembers it', async () => {
    vi.mocked(AuthService.me).mockResolvedValue(null)
    renderWithProviders(<AppRoutes />, { route: '/login' })

    fireEvent.click(await screen.findByRole('button', { name: 'RU' }))

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
    expect(localStorage.getItem('imagecompressor.language')).toBe('ru')
    expect(document.documentElement.lang).toBe('ru')
  })
})

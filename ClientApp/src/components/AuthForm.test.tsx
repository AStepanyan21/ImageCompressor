import { screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { AuthForm } from './AuthForm'
import { ApiError, AuthService } from '../services/api'
import { renderWithProviders } from '../test/utils'

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>()
  return {
    ...actual,
    AuthService: { register: vi.fn(), login: vi.fn(), logout: vi.fn(), me: vi.fn() },
  }
})

function renderForm(type: 'login' | 'register', language: 'en' | 'ru' = 'en') {
  return renderWithProviders(
    <Routes>
      <Route path="/form" element={<AuthForm type={type} />} />
      <Route path="/upload" element={<div>Upload page</div>} />
    </Routes>,
    { route: '/form', language },
  )
}

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

describe('AuthForm', () => {
  beforeEach(() => {
    vi.mocked(AuthService.me).mockResolvedValue(null)
  })

  it('renders the login form without password confirmation', () => {
    renderForm('login')
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm password')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/register')
  })

  it('renders the register form with password confirmation', () => {
    renderForm('register')
    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
  })

  it('shows an error when fields are empty', async () => {
    renderForm('login')
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Please fill in all fields')
    expect(AuthService.login).not.toHaveBeenCalled()
  })

  it('does not call the API when passwords do not match', async () => {
    renderForm('register')
    fill('Username', 'testuser')
    fill('Password', 'secret1')
    fill('Confirm password', 'secret2')
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match')
    expect(AuthService.register).not.toHaveBeenCalled()
  })

  it('registers and goes straight to the upload page', async () => {
    vi.mocked(AuthService.register).mockResolvedValue({ username: 'testuser' })
    renderForm('register')
    fill('Username', '  testuser ')
    fill('Password', 'secret')
    fill('Confirm password', 'secret')
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByText('Upload page')).toBeInTheDocument()
    expect(AuthService.register).toHaveBeenCalledWith('testuser', 'secret', 'secret')
  })

  it('shows a friendly message when the username is taken', async () => {
    vi.mocked(AuthService.register).mockRejectedValue(new ApiError('Username is already taken', 409))
    renderForm('register')
    fill('Username', 'testuser')
    fill('Password', 'secret')
    fill('Confirm password', 'secret')
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('This username is already taken')
  })

  it('logs in and goes to the upload page', async () => {
    vi.mocked(AuthService.login).mockResolvedValue({ username: 'testuser' })
    renderForm('login')
    fill('Username', 'testuser')
    fill('Password', 'secret')
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Upload page')).toBeInTheDocument()
    expect(AuthService.login).toHaveBeenCalledWith('testuser', 'secret')
  })

  it('shows invalid credentials error on 401 and re-enables the form', async () => {
    vi.mocked(AuthService.login).mockRejectedValue(new ApiError('Invalid username or password', 401))
    renderForm('login')
    fill('Username', 'testuser')
    fill('Password', 'wrong')
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled())
  })

  it('is translated to Russian', () => {
    renderForm('register', 'ru')
    expect(screen.getByRole('heading', { name: 'Регистрация' })).toBeInTheDocument()
    expect(screen.getByLabelText('Подтверждение пароля')).toBeInTheDocument()
  })
})

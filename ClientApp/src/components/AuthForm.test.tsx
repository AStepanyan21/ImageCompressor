import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthForm } from './AuthForm'
import { AuthService } from '../services/api'

vi.mock('../services/api', () => ({
  AuthService: {
    register: vi.fn(),
    login: vi.fn(),
  },
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => navigateMock,
}))

describe('AuthForm', () => {
  it('renders login form correctly', () => {
    render(<AuthForm type="login" />)
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
  })

  it('renders register form correctly', () => {
    render(<AuthForm type="register" />)
    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument()
  })

  it('shows error when fields are empty', async () => {
    render(<AuthForm type="login" />)
    const submitButton = screen.getByRole('button', { name: 'Login' })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
    })
  })

  it('calls register on submit for register form', async () => {
    const registerMock = vi.mocked(AuthService.register)
    registerMock.mockResolvedValue(undefined)
    
    render(<AuthForm type="register" />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your username'), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    })
    
    const submitButton = screen.getByRole('button', { name: 'Register' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith('testuser', 'password123')
      expect(navigateMock).toHaveBeenCalledWith('/login')
    })
  })

  it('calls login on submit for login form', async () => {
    const loginMock = vi.mocked(AuthService.login)
    loginMock.mockResolvedValue(undefined)
    
    render(<AuthForm type="login" />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your username'), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    })
    
    const submitButton = screen.getByRole('button', { name: 'Login' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('testuser', 'password123')
    })
  })
})

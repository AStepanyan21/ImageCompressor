import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService, UploadService } from './api'

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete import.meta.env.VITE_API_BASE_URL
    import.meta.env.VITE_API_BASE_URL = 'http://localhost:5114'
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
      ) as vi.Mock

      await AuthService.register('testuser', 'password123')

      expect(fetch).toHaveBeenCalledWith('http://localhost:5114/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'testuser', password: 'password123' }),
      })
    })

    it('should throw error on registration failure', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Bad Request',
          json: () => Promise.resolve({ message: 'Username already exists' }),
        } as Response)
      ) as vi.Mock

      await expect(AuthService.register('testuser', 'password123')).rejects.toThrow(
        'Username already exists'
      )
    })
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
      ) as vi.Mock

      await AuthService.login('testuser', 'password123')

      expect(fetch).toHaveBeenCalledWith('http://localhost:5114/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'testuser', password: 'password123' }),
      })
    })

    it('should throw error on login failure', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Unauthorized',
          json: () => Promise.resolve({ message: 'Invalid credentials' }),
        } as Response)
      ) as vi.Mock

      await expect(AuthService.login('testuser', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      )
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
      ) as vi.Mock

      await AuthService.logout()

      expect(fetch).toHaveBeenCalledWith('http://localhost:5114/api/auth/logout', {
        method: 'POST',
      })
    })

    it('should throw error on logout failure', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Internal Server Error',
        } as Response)
      ) as vi.Mock

      await expect(AuthService.logout()).rejects.toThrow('Logout failed')
    })
  })
})

describe('UploadService', () => {
  beforeEach(() => {
    delete import.meta.env.VITE_API_BASE_URL
    import.meta.env.VITE_API_BASE_URL = 'http://localhost:5114'
  })

  it('should upload image successfully', async () => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Upload successful' }),
      } as Response)
    ) as vi.Mock

    const result = await UploadService.uploadImage(file)

    expect(fetch).toHaveBeenCalled()
    expect(result).toEqual({ success: true, message: 'Upload successful' })
  })

  it('should throw error on upload failure', async () => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ message: 'File too large' }),
      } as Response)
    ) as vi.Mock

    await expect(UploadService.uploadImage(file)).rejects.toThrow('File too large')
  })
})

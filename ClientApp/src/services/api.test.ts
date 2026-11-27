import { describe, it, expect, vi } from 'vitest'
import { ApiError, AuthService, ImageService, NetworkError } from './api'
import { jsonResponse, makeImage } from '../test/utils'

function mockFetch(response: Response | Promise<Response>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(response))
}

describe('AuthService', () => {
  it('register sends username, password and confirmPassword to a same-origin endpoint', async () => {
    const fetchMock = mockFetch(jsonResponse({ username: 'testuser' }))

    const user = await AuthService.register('testuser', 'secret', 'secret')

    expect(user).toEqual({ username: 'testuser' })
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/register', {
      credentials: 'same-origin',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: 'secret', confirmPassword: 'secret' }),
    })
  })

  it('login returns the current user', async () => {
    mockFetch(jsonResponse({ username: 'testuser' }))
    await expect(AuthService.login('testuser', 'secret')).resolves.toEqual({ username: 'testuser' })
  })

  it('throws ApiError with server message and status', async () => {
    mockFetch(jsonResponse({ message: 'Invalid username or password' }, 401))

    const error = await AuthService.login('testuser', 'wrong').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(401)
    expect(error.message).toBe('Invalid username or password')
  })

  it('throws NetworkError when the server is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(AuthService.login('a', 'b')).rejects.toBeInstanceOf(NetworkError)
  })

  it('me returns null on 401', async () => {
    mockFetch(jsonResponse({ message: 'Invalid or missing token.' }, 401))
    await expect(AuthService.me()).resolves.toBeNull()
  })

  it('me rethrows other errors', async () => {
    mockFetch(new Response('', { status: 500, statusText: 'Internal Server Error' }))
    await expect(AuthService.me()).rejects.toBeInstanceOf(ApiError)
  })

  it('logout handles an empty response body', async () => {
    const fetchMock = mockFetch(new Response(null, { status: 200 }))
    await expect(AuthService.logout()).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', { credentials: 'same-origin', method: 'POST' })
  })
})

describe('ImageService', () => {
  it('upload sends the file and quality as multipart form data', async () => {
    const image = makeImage()
    const fetchMock = mockFetch(jsonResponse(image))
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })

    const result = await ImageService.upload(file, 40)

    expect(result).toEqual(image)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/image/upload')
    const body = init?.body as FormData
    expect(body.get('file')).toBeInstanceOf(File)
    expect((body.get('file') as File).name).toBe('photo.jpg')
    expect(body.get('quality')).toBe('40')
  })

  it('list returns compressed images', async () => {
    mockFetch(jsonResponse([makeImage({ id: 2 }), makeImage({ id: 1 })]))
    const images = await ImageService.list()
    expect(images.map((i) => i.id)).toEqual([2, 1])
  })
})

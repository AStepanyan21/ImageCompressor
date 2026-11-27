/** Error returned by the API with a non-2xx status. */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** The request never reached the server (offline, DNS, proxy down, ...). */
export class NetworkError extends Error {
  constructor() {
    super('Network error')
    this.name = 'NetworkError'
  }
}

export interface CurrentUser {
  username: string
}

export interface CompressedImage {
  id: number
  originalFileName: string
  contentType: string
  originalSize: number
  compressedSize: number
  quality: number
  createdAt: string
  /** Relative URL to view the compressed image. */
  url: string
  /** Relative URL that downloads the compressed image as a file. */
  downloadUrl: string
}

// Always same-origin: Vite proxies /api in dev, ASP.NET Core serves the SPA in production.
// This keeps the HttpOnly, SameSite=Strict auth cookie working without CORS.
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, { credentials: 'same-origin', ...init })
  } catch {
    throw new NetworkError()
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const message = (data && typeof data.message === 'string' && data.message) || response.statusText || 'Request failed'
    throw new ApiError(message, response.status)
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export const AuthService = {
  register(username: string, password: string, confirmPassword: string): Promise<CurrentUser> {
    return postJson('/api/auth/register', { username, password, confirmPassword })
  },

  login(username: string, password: string): Promise<CurrentUser> {
    return postJson('/api/auth/login', { username, password })
  },

  async logout(): Promise<void> {
    await request('/api/auth/logout', { method: 'POST' })
  },

  /** Returns the current user, or null when there is no valid session. */
  async me(): Promise<CurrentUser | null> {
    try {
      return await request<CurrentUser>('/api/auth/me')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return null
      throw err
    }
  },
}

export const ImageService = {
  upload(file: File, quality: number): Promise<CompressedImage> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('quality', String(quality))
    return request('/api/image/upload', { method: 'POST', body: formData })
  },

  list(): Promise<CompressedImage[]> {
    return request('/api/image')
  },
}

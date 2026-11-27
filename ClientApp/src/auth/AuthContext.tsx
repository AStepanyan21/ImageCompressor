import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthService, type CurrentUser } from '../services/api'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  user: CurrentUser | null
  status: AuthStatus
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => Promise<void>
  /** Call when the API answered 401: drops the local session so guards redirect to login. */
  handleUnauthorized: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const applyUser = useCallback((next: CurrentUser | null) => {
    setUser(next)
    setStatus(next ? 'authenticated' : 'anonymous')
  }, [])

  // The auth cookie is HttpOnly, so the only way to know if we are logged in is to ask the API.
  useEffect(() => {
    let cancelled = false
    AuthService.me()
      .then((current) => !cancelled && applyUser(current))
      .catch(() => !cancelled && applyUser(null))
    return () => {
      cancelled = true
    }
  }, [applyUser])

  const login = useCallback(
    async (username: string, password: string) => applyUser(await AuthService.login(username, password)),
    [applyUser],
  )

  const register = useCallback(
    async (username: string, password: string, confirmPassword: string) =>
      applyUser(await AuthService.register(username, password, confirmPassword)),
    [applyUser],
  )

  const logout = useCallback(async () => {
    try {
      await AuthService.logout()
    } finally {
      // Even if the request failed, the user asked to leave: forget the session locally.
      applyUser(null)
    }
  }, [applyUser])

  const handleUnauthorized = useCallback(() => applyUser(null), [applyUser])

  const value = useMemo(
    () => ({ user, status, login, register, logout, handleUnauthorized }),
    [user, status, login, register, logout, handleUnauthorized],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

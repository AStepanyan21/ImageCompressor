import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { getErrorMessage } from '../utils/errors'

interface AuthFormProps {
  type: 'login' | 'register'
}

export function AuthForm({ type }: AuthFormProps) {
  const { login, register } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isRegister = type === 'register'
  const prefix = isRegister ? 'auth.register' : 'auth.login'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password || (isRegister && !confirmPassword)) {
      setError(t('validation.required'))
      return
    }
    if (isRegister && password !== confirmPassword) {
      setError(t('validation.passwordsMismatch'))
      return
    }

    setIsLoading(true)
    try {
      if (isRegister) {
        // Registration also signs the user in (the API sets the auth cookie).
        await register(username.trim(), password, confirmPassword)
      } else {
        await login(username.trim(), password)
      }
      navigate('/upload', { replace: true })
    } catch (err) {
      setError(
        getErrorMessage(err, t, isRegister ? { 409: 'errors.usernameTaken' } : { 401: 'errors.invalidCredentials' }),
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>{t(`${prefix}.title`)}</h2>
        <p className="card-subtitle">{t(`${prefix}.subtitle`)}</p>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="username">{t('auth.username')}</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('auth.username.placeholder')}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.password.placeholder')}
              disabled={isLoading}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPassword.placeholder')}
                disabled={isLoading}
              />
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary btn-block">
            {isLoading ? t('auth.submitting') : t(`${prefix}.submit`)}
          </button>
        </form>

        <p className="auth-switch">
          {t(`${prefix}.switch`)}{' '}
          <Link to={isRegister ? '/login' : '/register'}>{t(`${prefix}.switchLink`)}</Link>
        </p>
      </div>
    </div>
  )
}

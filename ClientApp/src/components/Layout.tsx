import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Layout() {
  const { user, status, logout } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-mark" aria-hidden="true">◧</span>
            <span className="logo-text">{t('app.name')}</span>
          </Link>

          <nav className="header-nav">
            {status === 'authenticated' && user && (
              <>
                <NavLink to="/upload" className="nav-compress">{t('nav.compress')}</NavLink>
                <span className="header-user" title={user.username}>{user.username}</span>
                <button type="button" onClick={handleLogout} className="btn-secondary btn-small">
                  {t('nav.logout')}
                </button>
              </>
            )}
            {status === 'anonymous' && (
              <>
                <NavLink to="/login">{t('nav.login')}</NavLink>
                <NavLink to="/register">{t('nav.register')}</NavLink>
              </>
            )}
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}

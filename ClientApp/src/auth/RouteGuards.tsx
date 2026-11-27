import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useI18n } from '../i18n/I18nContext'

function FullPageLoader() {
  const { t } = useI18n()
  return (
    <div className="page-loader" role="status">
      <span className="spinner" aria-hidden="true" />
      {t('common.loading')}
    </div>
  )
}

/** Only for logged-in users; others are sent to the login page. */
export function ProtectedRoute() {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageLoader />
  return status === 'authenticated' ? <Outlet /> : <Navigate to="/login" replace />
}

/** Login/registration pages: a logged-in user goes straight to the app. */
export function PublicOnlyRoute() {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageLoader />
  return status === 'anonymous' ? <Outlet /> : <Navigate to="/upload" replace />
}

export function HomeRedirect() {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageLoader />
  return <Navigate to={status === 'authenticated' ? '/upload' : '/login'} replace />
}

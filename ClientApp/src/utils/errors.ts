import { ApiError, NetworkError } from '../services/api'
import type { TranslateFn } from '../i18n/I18nContext'
import type { TranslationKey } from '../i18n/translations'

/**
 * Turns an API/network error into a user-facing, translated message.
 * `byStatus` maps known HTTP statuses of a specific call to translated texts.
 */
export function getErrorMessage(
  error: unknown,
  t: TranslateFn,
  byStatus: Partial<Record<number, TranslationKey>> = {},
): string {
  if (error instanceof NetworkError) return t('errors.network')
  if (error instanceof ApiError) {
    const key = byStatus[error.status]
    if (key) return t(key)
    if (error.status >= 500) return t('errors.unknown')
    return error.message || t('errors.unknown')
  }
  return t('errors.unknown')
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401
}

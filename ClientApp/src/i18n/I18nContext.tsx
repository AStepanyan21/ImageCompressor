import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { languages, translations, type Language, type TranslationKey } from './translations'

const STORAGE_KEY = 'imagecompressor.language'

export type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string

interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: TranslateFn
}

function createTranslate(language: Language): TranslateFn {
  return (key, params) => {
    const template = translations[language][key] ?? translations.en[key] ?? key
    if (!params) return template
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    )
  }
}

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (languages as readonly string[]).includes(value)
}

function detectLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(stored)) return stored
  } catch {
    // storage may be blocked; fall back to the browser language
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

// Default value lets components render without a provider (e.g. in isolated tests).
const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: createTranslate('en'),
})

export function I18nProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(() => initialLanguage ?? detectLanguage())

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // not critical: the choice just won't be remembered
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({ language, setLanguage, t: createTranslate(language) }),
    [language, setLanguage],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

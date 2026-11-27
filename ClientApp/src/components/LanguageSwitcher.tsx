import { useI18n } from '../i18n/I18nContext'
import { languages } from '../i18n/translations'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n()

  return (
    <div className="language-switcher" role="group" aria-label={t('language.label')}>
      {languages.map((lang) => (
        <button
          key={lang}
          type="button"
          className={lang === language ? 'active' : undefined}
          aria-pressed={lang === language}
          onClick={() => setLanguage(lang)}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

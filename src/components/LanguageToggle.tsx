import { useLanguage } from '../LanguageProvider';

export function LanguageToggle() {
  const { locale, toggleLocale, tr } = useLanguage();

  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={toggleLocale}
      aria-label={tr('lang.toggleAria')}
    >
      <span className="lang-toggle-flag" aria-hidden="true">
        {locale === 'en' ? '🇯🇵' : '🇺🇸'}
      </span>
      <span className="lang-toggle-label">{tr('lang.toggle')}</span>
    </button>
  );
}

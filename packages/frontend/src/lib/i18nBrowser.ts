import i18n, { supportedLngs } from '@acme/i18n';

const LANG_STORAGE_KEY = 'i18nextLng';

export function initBrowserLanguage(): void {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (saved && (supportedLngs as readonly string[]).includes(saved)) {
    if (i18n.language !== saved) {
      i18n.changeLanguage(saved);
    }
    return;
  }

  const browserLang = navigator.language?.split('-')[0] ?? 'en';
  const lang = (supportedLngs as readonly string[]).includes(browserLang) ? browserLang : 'en';
  if (i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }
}

export function switchLanguage(lang: string): void {
  if ((supportedLngs as readonly string[]).includes(lang)) {
    i18n.changeLanguage(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }
}

export { LANG_STORAGE_KEY };

import i18n, { isSupportedLng } from '@acme/i18n';

const LANG_STORAGE_KEY = 'i18nextLng';

export function initBrowserLanguage(): void {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (saved && isSupportedLng(saved)) {
    if (i18n.language !== saved) {
      i18n.changeLanguage(saved);
    }
    return;
  }

  const browserLang = navigator.language?.split('-')[0] ?? 'en';
  const lang = isSupportedLng(browserLang) ? browserLang : 'en';
  if (i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }
}

export function switchLanguage(lang: string): void {
  if (isSupportedLng(lang)) {
    i18n.changeLanguage(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }
}

export { LANG_STORAGE_KEY };

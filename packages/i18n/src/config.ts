import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import commonEn from '../locales/en/common.json';
import authEn from '../locales/en/auth.json';
import notesEn from '../locales/en/notes.json';
import errorsEn from '../locales/en/errors.json';
import commonFr from '../locales/fr/common.json';
import authFr from '../locales/fr/auth.json';
import notesFr from '../locales/fr/notes.json';
import errorsFr from '../locales/fr/errors.json';

export const defaultNS = 'common' as const;
export const supportedLngs = ['en', 'fr'] as const;
export const ns = ['common', 'auth', 'notes', 'errors'] as const;

export const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    notes: notesEn,
    errors: errorsEn,
  },
  fr: {
    common: commonFr,
    auth: authFr,
    notes: notesFr,
    errors: errorsFr,
  },
} as const;

i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs,
  ns,
  defaultNS,
  resources,
  interpolation: {
    escapeValue: false,
  },
  initImmediate: false,
});

export default i18next;

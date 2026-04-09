import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import commonEn from '../locales/en/common.json';
import authEn from '../locales/en/auth.json';
import notesEn from '../locales/en/notes.json';

export const defaultNS = 'common' as const;
export const supportedLngs = ['en', 'fr'] as const;
export const ns = ['common', 'auth', 'notes'] as const;

export const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    notes: notesEn,
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
});

export default i18next;

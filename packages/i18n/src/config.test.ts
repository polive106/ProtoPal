import { describe, it, expect } from 'vitest';
import i18next from './config';
import commonEn from '../locales/en/common.json';
import authEn from '../locales/en/auth.json';
import notesEn from '../locales/en/notes.json';
import errorsEn from '../locales/en/errors.json';
import commonFr from '../locales/fr/common.json';
import authFr from '../locales/fr/auth.json';
import notesFr from '../locales/fr/notes.json';
import errorsFr from '../locales/fr/errors.json';

function extractKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...extractKeys(obj[key] as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('i18n config', () => {
  it('has English as the default language', () => {
    expect(i18next.language).toBe('en');
  });

  it('has English as the fallback language', () => {
    expect(i18next.options.fallbackLng).toEqual(['en']);
  });

  it('supports English and French', () => {
    expect(i18next.options.supportedLngs).toEqual(expect.arrayContaining(['en', 'fr']));
  });

  it('has common as the default namespace', () => {
    expect(i18next.options.defaultNS).toBe('common');
  });

  it('loads all four namespaces', () => {
    expect(i18next.options.ns).toEqual(['common', 'auth', 'notes', 'errors']);
  });

  it('translates auth:login.title to "Sign In"', () => {
    expect(i18next.t('login.title', { ns: 'auth' })).toBe('Sign In');
  });

  it('translates common:appName to "ProtoPal"', () => {
    expect(i18next.t('appName')).toBe('ProtoPal');
  });

  it('translates notes:pageTitle to "Notes"', () => {
    expect(i18next.t('pageTitle', { ns: 'notes' })).toBe('Notes');
  });

  it('handles interpolation correctly', () => {
    expect(i18next.t('dashboard.welcome', { firstName: 'Alice' })).toBe('Welcome, Alice!');
  });

  it('has all expected keys in the auth namespace', () => {
    const expectedTopLevelKeys = ['login', 'register', 'forgotPassword', 'resetPassword', 'checkEmail', 'verify'];
    expect(Object.keys(authEn)).toEqual(expect.arrayContaining(expectedTopLevelKeys));
  });

  it('has all expected keys in the notes namespace', () => {
    const expectedTopLevelKeys = ['pageTitle', 'newNote', 'drawer', 'empty', 'card'];
    expect(Object.keys(notesEn)).toEqual(expect.arrayContaining(expectedTopLevelKeys));
  });

  it('has all expected keys in the common namespace', () => {
    const expectedTopLevelKeys = ['appName', 'loading', 'logout', 'notes', 'nav', 'dashboard'];
    expect(Object.keys(commonEn)).toEqual(expect.arrayContaining(expectedTopLevelKeys));
  });

  describe('French translations', () => {
    it('has French resources loaded', () => {
      const frResources = i18next.options.resources?.fr;
      expect(frResources).toBeDefined();
    });

    it('translates auth:login.title to French', () => {
      expect(i18next.t('login.title', { ns: 'auth', lng: 'fr' })).toBe('Se connecter');
    });

    it('translates common:appName to "ProtoPal" in French (brand name)', () => {
      expect(i18next.t('appName', { lng: 'fr' })).toBe('ProtoPal');
    });

    it('handles interpolation correctly in French', () => {
      expect(i18next.t('dashboard.welcome', { firstName: 'Alice', lng: 'fr' })).toBe('Bienvenue, Alice !');
    });
  });

  describe('key parity between EN and FR', () => {
    it('common namespace has identical keys', () => {
      expect(extractKeys(commonFr)).toEqual(extractKeys(commonEn));
    });

    it('auth namespace has identical keys', () => {
      expect(extractKeys(authFr)).toEqual(extractKeys(authEn));
    });

    it('notes namespace has identical keys', () => {
      expect(extractKeys(notesFr)).toEqual(extractKeys(notesEn));
    });

    it('errors namespace has identical keys', () => {
      expect(extractKeys(errorsFr)).toEqual(extractKeys(errorsEn));
    });
  });
});

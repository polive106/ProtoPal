import { describe, it, expect } from 'vitest';
import { flattenKeys, compareLocales, type TranslationMap } from './check-translations';

describe('flattenKeys', () => {
  it('returns leaf keys from a flat object', () => {
    expect(flattenKeys({ a: 'hello', b: 'world' })).toEqual(['a', 'b']);
  });

  it('flattens nested objects with dot notation', () => {
    expect(flattenKeys({ login: { title: 'Sign In', subtitle: 'Welcome' } })).toEqual([
      'login.subtitle',
      'login.title',
    ]);
  });

  it('handles deeply nested objects', () => {
    expect(flattenKeys({ a: { b: { c: 'deep' } } })).toEqual(['a.b.c']);
  });

  it('returns empty array for empty object', () => {
    expect(flattenKeys({})).toEqual([]);
  });

  it('sorts keys alphabetically', () => {
    expect(flattenKeys({ z: '1', a: '2', m: '3' })).toEqual(['a', 'm', 'z']);
  });
});

describe('compareLocales', () => {
  it('returns no errors when all locales have identical keys', () => {
    const translations: TranslationMap = {
      en: { common: { appName: 'App', save: 'Save' } },
      fr: { common: { appName: 'App', save: 'Sauvegarder' } },
    };
    const errors = compareLocales(translations, 'en');
    expect(errors).toEqual([]);
  });

  it('reports missing keys in a locale', () => {
    const translations: TranslationMap = {
      en: { auth: { 'login.title': 'Sign In', 'login.subtitle': 'Welcome' } },
      fr: { auth: { 'login.title': 'Se connecter' } },
    };
    const errors = compareLocales(translations, 'en');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('fr');
    expect(errors[0]).toContain('auth');
    expect(errors[0]).toContain('login.subtitle');
  });

  it('reports extra keys in a locale', () => {
    const translations: TranslationMap = {
      en: { common: { appName: 'App' } },
      fr: { common: { appName: 'App', extra: 'Bonus' } },
    };
    const errors = compareLocales(translations, 'en');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('fr');
    expect(errors[0]).toContain('extra');
  });

  it('handles multiple namespaces', () => {
    const translations: TranslationMap = {
      en: {
        common: { appName: 'App' },
        auth: { login: 'Login' },
      },
      fr: {
        common: { appName: 'App' },
        auth: { login: 'Connexion' },
      },
    };
    const errors = compareLocales(translations, 'en');
    expect(errors).toEqual([]);
  });

  it('reports missing namespace in a locale', () => {
    const translations: TranslationMap = {
      en: { common: { appName: 'App' }, auth: { login: 'Login' } },
      fr: { common: { appName: 'App' } },
    };
    const errors = compareLocales(translations, 'en');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('fr');
    expect(errors[0]).toContain('auth');
  });
});

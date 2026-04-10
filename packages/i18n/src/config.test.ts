import { describe, it, expect } from 'vitest';
import i18next from './config';
import commonEn from '../locales/en/common.json';
import authEn from '../locales/en/auth.json';
import notesEn from '../locales/en/notes.json';

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

  it('loads all three namespaces', () => {
    expect(i18next.options.ns).toEqual(['common', 'auth', 'notes']);
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
});

// @vitest-environment jsdom
vi.mock('react-native', () => {
  const React = require('react');
  return {
    Pressable: ({ testID, onPress, children, ...props }: any) =>
      React.createElement('div', { 'data-testid': testID, onClick: onPress, ...props }, children),
    Text: (props: any) => React.createElement('span', props),
  };
});

vi.mock('@/lib/secureStorage', () => ({
  secureStorage: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    deleteItem: vi.fn().mockResolvedValue(undefined),
  },
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageSwitcher, LANG_PREF_KEY } from './LanguageSwitcher';
import { secureStorage } from '@/lib/secureStorage';
import i18n from '@acme/i18n';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (i18n as any).language = 'en';
  });

  it('renders current language code', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText('EN')).toBeDefined();
  });

  it('has correct testID', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByTestId('language-switcher')).toBeDefined();
  });

  it('calls changeLanguage with next language on press', async () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId('language-switcher'));

    await waitFor(() => {
      expect(i18n.changeLanguage).toHaveBeenCalledWith('fr');
    });
  });

  it('persists language preference to secureStorage', async () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId('language-switcher'));

    await waitFor(() => {
      expect(secureStorage.setItem).toHaveBeenCalledWith(LANG_PREF_KEY, 'fr');
    });
  });

  it('shows FR when current language is fr', () => {
    (i18n as any).language = 'fr';
    render(<LanguageSwitcher />);
    expect(screen.getByText('FR')).toBeDefined();
  });

  it('switches to en when current language is fr', async () => {
    (i18n as any).language = 'fr';
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId('language-switcher'));

    await waitFor(() => {
      expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
    });
  });
});

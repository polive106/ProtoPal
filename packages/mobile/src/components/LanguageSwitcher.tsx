import React from 'react';
import { Pressable, Text } from 'react-native';
import i18n, { supportedLngs } from '@acme/i18n';
import { secureStorage } from '@/lib/secureStorage';

const LANG_PREF_KEY = 'LANG_PREF';

export function LanguageSwitcher() {
  const currentLang = i18n.language;
  const nextLang = currentLang === 'en' ? 'fr' : 'en';
  const label = currentLang.toUpperCase();

  const handleSwitch = async () => {
    if ((supportedLngs as readonly string[]).includes(nextLang)) {
      await i18n.changeLanguage(nextLang);
      await secureStorage.setItem(LANG_PREF_KEY, nextLang);
    }
  };

  return (
    <Pressable testID="language-switcher" onPress={handleSwitch} hitSlop={8}>
      <Text style={{ fontFamily: 'Karla_500Medium', fontSize: 15, color: '#78716c' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export { LANG_PREF_KEY };

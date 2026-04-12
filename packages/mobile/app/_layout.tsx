import '../global.css';

import React, { useCallback, useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Karla_400Regular,
  Karla_500Medium,
  Karla_700Bold,
} from '@expo-google-fonts/karla';
import {
  SourceSerif4_400Regular,
  SourceSerif4_600SemiBold,
} from '@expo-google-fonts/source-serif-4';
import { ToastProvider } from '@acme/design-system-mobile';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import i18n, { supportedLngs } from '@acme/i18n';
import { getLocales } from 'expo-localization';
import { secureStorage } from '@/lib/secureStorage';
import { LANG_PREF_KEY } from '@/components/LanguageSwitcher';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Karla_400Regular,
    Karla_500Medium,
    Karla_700Bold,
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
  });
  const [langReady, setLangReady] = useState(false);

  useEffect(() => {
    async function initLanguage() {
      const savedLang = await secureStorage.getItem(LANG_PREF_KEY);
      if (savedLang && (supportedLngs as readonly string[]).includes(savedLang)) {
        if (i18n.language !== savedLang) {
          await i18n.changeLanguage(savedLang);
        }
      } else {
        const deviceLang = getLocales()[0]?.languageCode ?? 'en';
        const lang = (supportedLngs as readonly string[]).includes(deviceLang) ? deviceLang : 'en';
        if (i18n.language !== lang) {
          await i18n.changeLanguage(lang);
        }
      }
      setLangReady(true);
    }
    initLanguage();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && langReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, langReady]);

  if (!fontsLoaded || !langReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <QueryProvider>
        <AuthProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <Slot />
          </ToastProvider>
        </AuthProvider>
      </QueryProvider>
    </View>
  );
}

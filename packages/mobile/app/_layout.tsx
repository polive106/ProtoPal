import '../global.css';

import React, { useCallback } from 'react';
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Karla_400Regular,
    Karla_500Medium,
    Karla_700Bold,
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
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

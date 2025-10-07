import '../app.css';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/providers/AuthProvider';
import { CopilotProvider } from '@/providers/CopilotProvider';
import { FloidSyncProvider } from '@/providers/FloidSyncProvider';
import { useFrameworkReady } from '@/hooks/common/useFrameworkReady';
import { i18nInitPromise } from '../lib/i18n';
import { OneSignal, LogLevel } from 'react-native-onesignal';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [i18nReady, setI18nReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });
  useEffect(() => {
    i18nInitPromise
      .then(() => {
        setI18nReady(true);
      })
      .catch((err) => {
        console.error('i18n initialization failed:', err);
        setI18nReady(true);
      });
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, i18nReady]);

  // Initialize OneSignal
  useEffect(() => {
    // Only initialize OneSignal on mobile platforms
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      const oneSignalAppId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
      if (oneSignalAppId) {
        OneSignal.initialize(oneSignalAppId);
        OneSignal.Notifications.requestPermission(false);
      } else {
        console.error('OneSignal App ID is not configured. Please set EXPO_PUBLIC_ONESIGNAL_APP_ID in your environment.');
      }
    }
  }, []);

  if (!fontsLoaded && !fontError) return null;
  if (!i18nReady) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FloidSyncProvider>
          <CopilotProvider instructions="Eres un asistente financiero especializado en Patrimore. Ayuda a los usuarios con sus consultas sobre finanzas personales, inversiones, presupuestos y patrimonio. Proporciona consejos prácticos y personalizados basados en los datos disponibles del usuario.">
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'white' },
              }}
            >
              <Stack.Screen name="splash-screens" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </CopilotProvider>
        </FloidSyncProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

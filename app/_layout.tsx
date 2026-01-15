import '../app.css';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { BiometricAuthProvider } from '@/providers/BiometricAuthProvider';
import { CopilotProvider } from '@/providers/CopilotProvider';
import { FloidSyncProvider } from '@/providers/FloidSyncProvider';
import { TransactionModeProvider } from '@/providers/TransactionModeProvider';
import { useFrameworkReady } from '@/hooks/common/useFrameworkReady';
import { useAppVersionCheck } from '@/hooks/common/useAppVersionCheck';
import { UpdateModal } from '@/components/ui/UpdateModal';
import { i18nInitPromise } from '../lib/i18n';
import { OneSignal } from 'react-native-onesignal';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

/**
 * Inner component that has access to AuthProvider context.
 * Handles version check after user is authenticated.
 */
function AppContent() {
  const { isAuthenticated } = useAuth();
  
  // App version check - only runs after user is authenticated
  const {
    isUpdateAvailable,
    currentVersion,
    latestVersion,
    storeUrl,
    dismissUpdate,
  } = useAppVersionCheck({ enabled: isAuthenticated });

  return (
    <>
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
      {/* App Update Modal - only shown after login */}
      <UpdateModal
        visible={isUpdateAvailable}
        onClose={dismissUpdate}
        currentVersion={currentVersion}
        latestVersion={latestVersion}
        storeUrl={storeUrl}
      />
    </>
  );
}

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
      const oneSignalAppId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
      if (oneSignalAppId) {
        OneSignal.initialize(oneSignalAppId);
        // Don't request permission here - let it be done during login
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
        <BiometricAuthProvider>
          <FloidSyncProvider>
            <TransactionModeProvider>
              <CopilotProvider instructions="Eres un asistente financiero especializado en Patrimore. Ayuda a los usuarios con sus consultas sobre finanzas personales, inversiones, presupuestos y patrimonio. Proporciona consejos prácticos y personalizados basados en los datos disponibles del usuario.">
                <AppContent />
              </CopilotProvider>
            </TransactionModeProvider>
          </FloidSyncProvider>
        </BiometricAuthProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

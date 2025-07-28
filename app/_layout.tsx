import '../app.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/providers/AuthProvider';
import { CopilotProvider } from '@/providers/CopilotProvider';
import { useFrameworkReady } from '@/hooks/common/useFrameworkReady';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);
  
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
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
      </AuthProvider>
    </SafeAreaProvider>
  );
}

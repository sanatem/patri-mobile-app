import { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useBiometricAuth } from '@/providers/BiometricAuthProvider';
import { useOnboarding } from '@/hooks/common';
import { useOnboardingValidation } from '@/hooks/common/useOnboardingValidation';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorageService } from '@/services/auth/secure-storage.service';
import { BiometricPrompt } from '@/components/auth/BiometricPrompt';

export default function Index() {
  const { user, loading, isAuthenticated, accessToken, loginWithBiometric } = useAuth();
  const { biometricState, canUseBiometric, getRemainingLockoutTime } = useBiometricAuth();
  const { hasSeenOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const { shouldShowOnboarding, userDataLoading, userData } = useOnboardingValidation();
  const [isReady, setIsReady] = useState(false);
  const [hasSeenSplash, setHasSeenSplash] = useState<boolean | null>(null);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkBiometricAndSplash = async () => {
      try {
        const seen = await AsyncStorage.getItem('splash_seen');
        setHasSeenSplash(seen === 'true');

        // Check if biometric should be shown
        const canUse = await canUseBiometric();

        // Show biometric prompt if:
        // - Biometric is enabled
        // - There's a stored token in SecureStorage
        // - Biometric is supported
        // - User is not already authenticated
        if (canUse && !isAuthenticated) {
          setShowBiometricPrompt(true);
        }
      } catch (e) {
        setHasSeenSplash(false);
      }
    };

    if (!biometricState.isLoading) {
      checkBiometricAndSplash();
    }
  }, [biometricState.isLoading, isAuthenticated, canUseBiometric]);

  const handleBiometricLogin = useCallback(async () => {
    const remainingTime = getRemainingLockoutTime();
    if (remainingTime > 0) {
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      Alert.alert(
        'Demasiados intentos',
        `Por favor, intenta nuevamente en ${minutes}:${seconds.toString().padStart(2, '0')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    setBiometricLoading(true);
    try {
      const success = await loginWithBiometric();
      if (success) {
        router.replace('/(tabs)/patrimony');
      } else {
        // Authentication failed or was cancelled - keep showing the prompt
        // User must authenticate or use password option
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);

      // Show expiration alert if token expired
      if (error.message?.includes('sesión ha expirado')) {
        Alert.alert(
          'Sesión expirada',
          error.message,
          [{
            text: 'OK', onPress: () => {
              // Clear biometric and redirect to login
              setShowBiometricPrompt(false);
            }
          }]
        );
      }
    } finally {
      setBiometricLoading(false);
    }
  }, [getRemainingLockoutTime, loginWithBiometric]);

  const handlePasswordAuth = useCallback(() => {
    // User chose to use password instead - redirect to auth flow
    setShowBiometricPrompt(false);
  }, []);

  if (loading || !isReady || onboardingLoading || userDataLoading || biometricState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  if (showBiometricPrompt) {
    return (
      <BiometricPrompt
        key="biometric-prompt"
        onBiometricAuth={handleBiometricLogin}
        onPasswordAuth={handlePasswordAuth}
        biometricType={biometricState.biometricType}
        loading={biometricLoading}
      />
    );
  }

  if (isAuthenticated && user && accessToken) {
    if (shouldShowOnboarding) {
      return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/(tabs)/patrimony" />;
  }

  if (hasSeenSplash === null || loading || !isReady || onboardingLoading || userDataLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  if (hasSeenSplash) {
    return <Redirect href="/auth/webview" />;
  }
  return <Redirect href="/splash-screens" />;
}

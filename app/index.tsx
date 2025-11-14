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
  const { biometricState, getRemainingLockoutTime } = useBiometricAuth();
  const { hasSeenOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const { shouldShowOnboarding, userDataLoading, userData } = useOnboardingValidation();
  const [isReady, setIsReady] = useState(false);
  const [hasSeenSplash, setHasSeenSplash] = useState<boolean | null>(null);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [biometricRequired, setBiometricRequired] = useState(true);

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

        const lockoutEnd = await SecureStorageService.getLockoutEndTime();
        const lockoutActive = !!(lockoutEnd && Date.now() < lockoutEnd);
        const biometricEnabled = await SecureStorageService.isBiometricEnabled();
        const storedToken = await SecureStorageService.getAuthToken();

        const shouldShowPrompt =
          lockoutActive || (biometricRequired && biometricEnabled && !!storedToken);

        if (shouldShowPrompt) {
          setShowBiometricPrompt(true);
        } else {
          setShowBiometricPrompt(false);
        }
      } catch (e) {
        setHasSeenSplash(false);
      }
    };

    if (!biometricState.isLoading) {
      checkBiometricAndSplash();
    }
  }, [biometricState.isLoading, biometricRequired]);

  useEffect(() => {
    if (!showBiometricPrompt) {
      setLockoutTime(0);
      return;
    }

    let interval: ReturnType<typeof setInterval>;

    const updateLockoutTime = async () => {
      const lockoutEnd = await SecureStorageService.getLockoutEndTime();
      if (!lockoutEnd) {
        setLockoutTime(0);
        return;
      }

      const remaining = Math.max(0, Math.ceil((lockoutEnd - Date.now()) / 1000));
      setLockoutTime(remaining);
    };

    updateLockoutTime();
    interval = setInterval(updateLockoutTime, 1000);

    return () => clearInterval(interval);
  }, [showBiometricPrompt]);

  const handleBiometricLogin = useCallback(async () => {
    if (lockoutTime > 0) {
      const minutes = Math.floor(lockoutTime / 60);
      const seconds = lockoutTime % 60;
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
        setBiometricRequired(false);
        setShowBiometricPrompt(false);
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
  }, [lockoutTime, loginWithBiometric]);

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

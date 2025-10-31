import { useEffect, useState } from 'react';
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
  const { user, loading, isAuthenticated, accessToken } = useAuth();
  const { biometricState, authenticateWithBiometric } = useBiometricAuth();
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

        const token = await AsyncStorage.getItem('auth_token');
        const isBiometricEnabled = await SecureStorageService.isBiometricEnabled();

        if (token && isBiometricEnabled && biometricState.isSupported && !isAuthenticated) {
          setShowBiometricPrompt(true);
        }
      } catch (e) {
        setHasSeenSplash(false);
      }
    };

    if (!biometricState.isLoading) {
      checkBiometricAndSplash();
    }
  }, [biometricState.isLoading, biometricState.isSupported, isAuthenticated]);

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        setShowBiometricPrompt(false);
      } else {
        setShowBiometricPrompt(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al autenticar con biometría');
      setShowBiometricPrompt(false);
    } finally {
      setBiometricLoading(false);
    }
  };

  const handlePasswordAuth = () => {
    setShowBiometricPrompt(false);
  };

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

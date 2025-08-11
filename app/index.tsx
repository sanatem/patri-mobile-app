import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboarding } from '@/hooks/common';
import { useOnboardingValidation } from '@/hooks/common/useOnboardingValidation';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { user, loading, isAuthenticated, accessToken } = useAuth();
  const { hasSeenOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const { shouldShowOnboarding, userDataLoading, userData } = useOnboardingValidation();
  const [isReady, setIsReady] = useState(false);
  const [hasSeenSplash, setHasSeenSplash] = useState<boolean | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadSplashSeen = async () => {
      try {
        const seen = await AsyncStorage.getItem('splash_seen');
        setHasSeenSplash(seen === 'true');
      } catch (e) {
        setHasSeenSplash(false);
      }
    };
    loadSplashSeen();
  }, []);

  if (loading || !isReady || onboardingLoading || userDataLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
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
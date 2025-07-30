import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboarding } from '@/hooks/common';
import Colors from '@/constants/Colors';

export default function Index() {
  const { user, loading, isAuthenticated, accessToken } = useAuth();
  const { hasSeenOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading || !isReady || onboardingLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  if (isAuthenticated && user && accessToken) {
    if (hasSeenOnboarding === false) {
      return <Redirect href="/onboarding" />;
    }
    
    if (hasSeenOnboarding === true) {
      return <Redirect href="/(tabs)/patrimony" />;
    }

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }
  
  return <Redirect href="/splash-screens" />;
}
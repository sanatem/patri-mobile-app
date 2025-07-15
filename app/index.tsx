import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import Colors from '@/constants/Colors';


export default function Index() {
  const { user, loading, isAuthenticated, accessToken } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
        const { status } = await requestTrackingPermissionsAsync();
        if (status === 'granted') {
          console.log('Tienes los permisos habilitados');
        }
      })();
    }
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  if (isAuthenticated && user && accessToken) {
    return <Redirect href="/(tabs)/patrimony" />;
  }

  return <Redirect href="/auth/login" />;
}
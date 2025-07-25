import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboarding } from '@/hooks/common';
import Colors from '@/constants/Colors';

export default function Index() {
  const { user, loading, isAuthenticated, accessToken } = useAuth();
  const { hasSeenOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const [isReady, setIsReady] = useState(false);
  const [hasSeenATT, setHasSeenATT] = useState<boolean | null>(null);
  const [isRequestingATT, setIsRequestingATT] = useState(false);

  useEffect(() => {
    const checkATTStatus = async () => {
      try {
        const attSeen = await AsyncStorage.getItem('att_permission_shown');
        setHasSeenATT(attSeen === 'true');
        
        if (attSeen !== 'true' && Platform.OS === 'ios') {
          await requestATT();
        }
      } catch (error) {
        console.log('Error checking ATT status:', error);
        setHasSeenATT(false);
      }
      
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 300);
      
      return () => clearTimeout(timer);
    };

    checkATTStatus();
  }, []);

  const requestATT = async () => {
    setIsRequestingATT(true);
    
    try {
      const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
      const { status } = await requestTrackingPermissionsAsync();
      
      if (status === 'granted') {
        console.log('Permisos de tracking concedidos');
      } else {
        console.log('Permisos de tracking denegados');
      }
      
      await AsyncStorage.setItem('att_permission_shown', 'true');
      setHasSeenATT(true);
      
    } catch (error) {
      console.error('Error al solicitar permisos de tracking:', error);
      await AsyncStorage.setItem('att_permission_shown', 'true');
      setHasSeenATT(true);
    } finally {
      setIsRequestingATT(false);
    }
  };

  if (loading || !isReady || hasSeenATT === null || onboardingLoading || isRequestingATT) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  if (isAuthenticated && user && accessToken) {
    return <Redirect href="/(tabs)/patrimony" />;
  }

  return <Redirect href="/splash-screens" />;
}
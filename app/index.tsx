import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/providers/AuthProvider';
import Colors from '@/constants/Colors';

export default function Index() {
  const { user, loading, isAuthenticated, accessToken } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [hasSeenATT, setHasSeenATT] = useState<boolean | null>(null);

  useEffect(() => {
    const checkATTStatus = async () => {
      try {
        const attSeen = await AsyncStorage.getItem('att_permission_shown');
        setHasSeenATT(attSeen === 'true');
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

  if (loading || !isReady || hasSeenATT === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }
  if (!hasSeenATT && Platform.OS === 'ios') {
    return <Redirect href="/att-permission" />;
  }

  if (isAuthenticated && user && accessToken) {
    return <Redirect href="/(tabs)/patrimony" />;
  }

  return <Redirect href="/auth/login" />;
}
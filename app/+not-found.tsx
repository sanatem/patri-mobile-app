import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/');
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Cargando...' }} />
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    </>
  );
}

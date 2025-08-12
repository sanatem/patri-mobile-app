import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';


export default function NotFoundScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/');
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ title: t('common.loading') }} />
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

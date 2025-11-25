import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, InteractionManager } from 'react-native';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';

export default function AuthWebViewScreen() {
  const { t } = useTranslation();
  const { login, isAuthRequestReady } = useAuth();
  const [attempted, setAttempted] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused || attempted || !isAuthRequestReady) return;
    let isCancelled = false;

    const doLogin = async () => {
      // Add a delay to ensure the screen is fully visible
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set a timeout for InteractionManager
      await Promise.race([
        new Promise<void>((resolve) => InteractionManager.runAfterInteractions(() => resolve())),
        new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))
      ]);

      if (isCancelled) return;

      // Only set attempted after delays to avoid re-render during critical section
      setAttempted(true);

      try {
        const success = await login();

        if (success) {
          router.replace('/');
        } else {
          Alert.alert(t('authWebViewScreen.alert.cancelledTitle'), t('authWebViewScreen.alert.cancelledMessage'));
          router.replace('/');
        }
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert('Error', 'An error occurred during login. Please try again.');
        router.replace('/');
      }
    };
    doLogin();

    return () => {
      isCancelled = true;
    };
  }, [attempted, isAuthRequestReady, login, t, isFocused]);

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <ArrowLeft size={24} color={Colors.primary[500]} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: Colors.primary[500] }}>
          {t('authWebViewScreen.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View className="flex-1 justify-center items-center p-6">
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
        <Text className="text-center text-base mt-4" style={{ color: Colors.primary[500] }}>
          {t('authWebViewScreen.loadingMessage')}
        </Text>
      </View>
    </View>
  );
}

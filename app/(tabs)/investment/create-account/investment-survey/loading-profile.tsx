import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export default function LoadingProfile() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/investment/create-account/investment-survey/profile-result' as any);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#ff5603" />
      <Text className="mt-4 text-base text-gray-700">
        Definiendo tu perfil de inversor...
      </Text>
    </View>
  );
}

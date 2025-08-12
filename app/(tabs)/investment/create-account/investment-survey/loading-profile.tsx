import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function LoadingProfile() {
  const { t } = useTranslation();
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
        {t('investmentSurvey.loadingMessage')}
      </Text>
    </View>
  );
}

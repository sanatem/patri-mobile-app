import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { FormLayout } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';

export default function LoadingProfile() {
  const { t } = useTranslation();
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/(tabs)/investment/create-account/investment-survey/profile-result');
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      <ActivityIndicator size="large" color="#FF6501" />
      <Text className="text-base font-regular mt-4 text-center" style={{ color: Colors.gray[600] }}>
        {t('investmentSurvey.loadingMessage')}
      </Text>
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';

export default function StartProfile() {
  const {t} = useTranslation();
  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
    <View className="flex-1 p-6 justify-center bg-white">
      <Text className="text-xl font-bold text-center mb-3">
        {t('startProfile.title')}
      </Text>

      <Text className="text-base text-center text-gray-500 mb-6">
        {t('startProfile.description')}
      </Text>

      <TouchableOpacity
        className="bg-primary-500 py-3 px-4 rounded-lg items-center"
        onPress={() => router.push('/(tabs)/investment/create-account/investment-survey/profile-question')}
      >
        <Text className="text-white font-semibold text-base">{t('common.start')}</Text>
      </TouchableOpacity>

      <Text className="text-center text-gray-500 mt-3">{t('startProfile.timeEstimate')}</Text>
    </View>
    </Container>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';

export default function ProfileResult() {
  const { t } = useTranslation();
  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
    <View className="flex-1 justify-center bg-white p-6">
      <Text className="text-[64px] text-center mb-5">🕵️‍♀️</Text>
      <Text className="text-xl font-bold text-center mb-3">
        {t('profileResult.title')}
      </Text>
      <Text className="text-base text-gray-500 text-center mb-2">
        {t('profileResult.description1')}
      </Text>
      <Text className="text-base text-gray-500 text-center mb-2">
        {t('profileResult.description2')}
      </Text>

      <TouchableOpacity
        className="bg-primary-500 py-3 px-4 rounded-lg items-center"
        onPress={() => router.push('/investment/create-account/complete-profile' as any)}
      >
        <Text className="text-white font-semibold text-base">{t('common.understoodAndContinue')}</Text>
      </TouchableOpacity>
    </View>
    </Container>
  );
}

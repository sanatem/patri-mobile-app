import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui';
import { Check, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function SummaryStep() {
  const { t } = useTranslation();

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title={t('summary.title')} />
      <ScrollView className="flex-1 bg-white px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-lg text-gray-600 text-center mb-6">
          {t('summary.description')}
        </Text>

        <View className="bg-primary-500 p-4 rounded-xl mb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white font-semibold text-base">
              {t('summary.steps.identity.title')}
            </Text>
            <Text className="text-white mt-1 font-regular">
              {t('summary.steps.identity.validated')}
            </Text>
          </View>
          <Check size={24} color="white" className="mr-2" />
        </View>

        <View className="bg-primary-500 p-4 rounded-xl mb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white font-semibold text-base">
              {t('summary.steps.basic.title')}
            </Text>
            <Text className="text-white mt-1 font-regular">
              {t('summary.steps.basic.completed')}
            </Text>
          </View>
          <Check size={24} color="white" className="mr-2" />
        </View>

        <View className="bg-gray-100 p-4 rounded-xl mb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-400 font-semibold text-base">
              {t('summary.steps.contract.title')}
            </Text>
            <Text className="text-gray-400 mt-1 font-regular">
              {t('summary.steps.contract.inProgress')}
            </Text>
          </View>
          <Clock size={24} color="#9CA3AF" className="mr-2" />
        </View>

        <View className="bg-gray-100 p-4 rounded-xl mb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-400 font-semibold text-base">
              {t('summary.steps.start.title')}
            </Text>
            <Text className="text-gray-400 mt-1 font-regular">
              {t('summary.steps.start.description')}
            </Text>
          </View>
          <Clock size={24} color="#9CA3AF" className="mr-2" />
        </View>

        <Button
          title={t('summary.returnHome')}
          onPress={() => router.push('/(tabs)/investment')}
          variant="primary"
          fullWidth
        />
      </ScrollView>
    </Container>
  );
}

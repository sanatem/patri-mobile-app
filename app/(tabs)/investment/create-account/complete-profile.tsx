import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { useTranslation } from 'react-i18next';

export default function CompleteProfile() {
  const { t } = useTranslation();
  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title={t('completeProfile.title')} />
      <ScrollView className="flex-1 bg-white px-6" showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          className="bg-primary-500 p-4 rounded-xl mb-4"
          onPress={() => router.push("/investment/create-account/identity-step/identity-method")}
        >
          <View className="flex-row items-center">
            <View className="bg-primary-500 p-4 rounded-xl mb-4" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
              <Text className="text-white font-semibold text-base">
                {t('completeProfile.steps.identity.title')}
              </Text>
              <Text className="text-white mt-1 font-regular">{t('completeProfile.steps.identity.description')}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View className="flex-row">
          <View className="bg-gray-100 p-4 rounded-xl mb-4" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
            <Text className="text-gray-400 font-semibold text-base">→
            {t('completeProfile.steps.basic.title')}</Text>
            <Text className="text-gray-400 mt-1 font-regular">{t('completeProfile.steps.basic.description')}</Text>
          </View>
        </View>

        <View className="flex-row">
          <View className="bg-gray-100 p-4 rounded-xl mb-4" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
            <Text className="text-gray-400 font-semibold text-base">{t('completeProfile.steps.contract.title')}</Text>
            <Text className="text-gray-400 mt-1 font-regular">{t('completeProfile.steps.contract.description')}</Text>
          </View>
        </View>

        <View className="flex-row">
          <View className="bg-gray-100 p-4 rounded-xl mb-4" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
            <Text className="text-gray-400 font-semibold text-base">{t('completeProfile.steps.start.title')}</Text>
            <Text className="text-gray-400 mt-1 font-regular">{t('completeProfile.steps.start.description')}</Text>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';

export default function IdentityMethod() {
  const { t } = useTranslation();

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title={t('identityMethod.title')} />
      <View className="flex-1 bg-white pt-20 px-6">
        <Text className="text-xl font-bold mb-3">
          {t('identityMethod.question')}
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          {t('identityMethod.description')}
        </Text>

        <TouchableOpacity
          className="bg-white py-3 px-4 rounded-lg items-center mb-3 border border-primary-500"
          onPress={() => router.push('/(tabs)/investment/create-account/identity-step/identity-upload')}
        >
          <Text className="text-primary-500 font-semibold text-base">
            {t('identityMethod.option_id_card')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white py-3 px-4 rounded-lg items-center mb-3 mt-3 border border-primary-500"
          onPress={() => router.push('/(tabs)/investment/create-account/identity-step/identity-upload')}
        >
          <Text className="text-primary-500 font-semibold text-base">
            {t('identityMethod.option_passport')}
          </Text>
        </TouchableOpacity>

        <Text className="mt-5 text-sm text-center text-primary-500">
          {t('identityMethod.why')}
        </Text>
      </View>
    </Container>
  );
}

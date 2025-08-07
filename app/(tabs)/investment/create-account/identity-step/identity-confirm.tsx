import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Container, Header, Input, Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';

export default function IdentityConfirm() {
  const { t } = useTranslation();

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title={t('identityConfirm.title')} />
      <ScrollView className="flex-1 bg-white pt-20 px-6" showsVerticalScrollIndicator={false}>
      <Text className="text-gray-500 mb-4 text-center">
        {t('identityConfirm.description')}
      </Text>


      <Input className="bg-gray-100 p-3 rounded-lg mb-3" placeholder={t('identityConfirm.firstName')} value="Rommina Paz" />
      <Input className="bg-gray-100 p-3 rounded-lg mb-3" placeholder={t('identityConfirm.lastName1')} value="Cáceres" />
      <Input className="bg-gray-100 p-3 rounded-lg mb-3" placeholder={t('identityConfirm.lastName2')} value="Pinilla" />
      <Input className="bg-gray-100 p-3 rounded-lg mb-3" placeholder={t('identityConfirm.gender')} value="Femenino" />
      <Input className="bg-gray-100 p-3 rounded-lg mb-3" placeholder={t('identityConfirm.birthDate')} value="18-01-1995" />
      <Input className="bg-gray-100 p-3 rounded-lg mb-4" placeholder={t('identityConfirm.idExpiryDate')} value="18-01-2035" />

      <Button
        title={t('common.continue')}
        onPress={() => router.push('/investment/create-account/personal-information/personal-information-question' as any)}
        variant="primary"
        fullWidth
      />
    </ScrollView>
    </Container>
  );
}

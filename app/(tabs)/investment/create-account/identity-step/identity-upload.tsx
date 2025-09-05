import { View, Text, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, ImageDropbox } from '@/components/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';

export default function IdentityUpload() {
  const { t } = useTranslation();
  const [frontImage, setFrontImage] = useState<string | null>(null);


  const handleContinue = async () => {
    if (frontImage) {
      try {
        await AsyncStorage.setItem('identity_front_image', frontImage);
        router.push('/investment/create-account/identity-step/identity-upload-back' as any);
      } catch (error) {
        console.error('Error saving front image:', error);
        Alert.alert(t('common.error'), 'Error al guardar la imagen');
      }
    }
  };

  return (
    <FormLayout
      title={t('identityUpload.title')}
      subtitle={Platform.OS === 'web'
        ? t('identityUpload.uploadHintWeb')
        : t('identityUpload.uploadHintMobile')}
      currentStep={1}
      totalSteps={3}
      onNext={handleContinue}
      isNextDisabled={!frontImage}
      nextButtonTitle={t('common.continue')}
    >
      <ImageDropbox
        image={frontImage}
        onImageChange={setFrontImage}
        placeholder={t('identityUpload.uploadPrompt')}
        aspectRatio={[16, 10]}
        quality={0.8}
        showAsDocument={true}
      />

      <View className="p-4 rounded-xl mb-6">
        <Text className="text-sm font-medium mb-2" style={{ color: Colors.primary[700] }}>
          {t('identityUpload.tips.title')}
        </Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUpload.tips.light')}</Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUpload.tips.legible')}</Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUpload.tips.noGlare')}</Text>
      </View>
    </FormLayout>
  );
}

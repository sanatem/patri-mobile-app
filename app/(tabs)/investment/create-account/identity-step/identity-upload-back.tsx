import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, ImageDropbox } from '@/components/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';

export default function IdentityUploadBack() {
  const { t } = useTranslation();
  const [backImage, setBackImage] = useState<string | null>(null);


  const handleContinue = async () => {
    if (backImage) {
      try {
        await AsyncStorage.setItem('identity_back_image', backImage);
        router.push('/investment/create-account/identity-step/identity-confirm' as any);
      } catch (error) {
        console.error('Error saving back image:', error);
        Alert.alert(t('common.error'), 'Error al guardar la imagen');
      }
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <FormLayout
      title={t('identityUploadBack.title')}
      subtitle={t('identityUploadBack.uploadSubtitle')}
      currentStep={2}
      totalSteps={3}
      onNext={handleContinue}
      onPrevious={handleGoBack}
      isNextDisabled={!backImage}
      nextButtonTitle={t('common.continue')}
      previousButtonTitle={t('common.back')}
      showLogo={false}
    >
      <ImageDropbox
        image={backImage}
        onImageChange={setBackImage}
        placeholder={t('identityUploadBack.uploadPrompt')}
        aspectRatio={[16, 10]}
        quality={0.8}
        showAsDocument={true}
      />

      <View className="p-4 rounded-xl mb-6">
        <Text className="text-sm font-medium mb-2" style={{ color: Colors.primary[700] }}>
          {t('identityUploadBack.tips.title')}
        </Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUploadBack.tips.light')}</Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUploadBack.tips.legible')}</Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUploadBack.tips.noGlare')}</Text>
      </View>
    </FormLayout>
  );
}
